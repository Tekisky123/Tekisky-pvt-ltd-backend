import Job from "../model/jobModel.js";

// Helper: Normalize comma or newline-separated strings into clean arrays
const normalizeArray = (input) => {
  if (Array.isArray(input)) {
    return input.map((item) => String(item).trim()).filter(Boolean);
  }
  if (typeof input === "string" && input.trim()) {
    return input
      .split(/[\n,]+/)
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
};

// ============================================================================
// PUBLIC ENDPOINTS (Candidate-facing)
// ============================================================================

/**
 * GET /consultancy/jobs
 * Returns only published and active jobs within their application deadline.
 * Does NOT generate fake or sample seed jobs.
 */
export const getJobs = async (req, res) => {
  try {
    const { category, search, workMode, experience } = req.query;

    const filter = {
      status: "Published",
      // Exclude expired jobs if a deadline was specified
      $or: [
        { deadline: null },
        { deadline: { $exists: false } },
        { deadline: { $gte: new Date() } },
      ],
    };

    if (category && category !== "All") {
      filter.category = category;
    }

    if (workMode && workMode !== "All") {
      filter.workMode = workMode;
    }

    if (experience && experience !== "All") {
      filter.experience = { $regex: experience, $options: "i" };
    }

    if (search && search.trim() !== "") {
      const searchRegex = new RegExp(search.trim(), "i");
      filter.$and = filter.$and || [];
      filter.$and.push({
        $or: [
          { title: searchRegex },
          { primarySkill: searchRegex },
          { skills: { $in: [searchRegex] } },
          { location: searchRegex },
          { description: searchRegex },
          { companyName: searchRegex },
        ],
      });
    }

    const jobs = await Job.find(filter).sort({ postedDate: -1, createdAt: -1 });
    return res.status(200).json(jobs);
  } catch (error) {
    console.error("Error in getJobs:", error.message);
    return res.status(500).json({ error: "Failed to fetch active job openings." });
  }
};

/**
 * GET /consultancy/jobs/:id
 * Returns a single published job opening by ID.
 */
export const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ error: "Job opening not found." });
    }
    return res.status(200).json(job);
  } catch (error) {
    console.error("Error in getJobById:", error.message);
    return res.status(500).json({ error: "Failed to fetch job details." });
  }
};

// ============================================================================
// ADMIN ENDPOINTS (Recruiter & authorized admin only)
// ============================================================================

/**
 * GET /consultancy/admin/jobs
 * Returns all jobs (Draft, Published, Closed) with aggregate metrics for the dashboard.
 */
export const getAdminJobs = async (req, res) => {
  try {
    const { status, category, search, workMode } = req.query;

    const filter = {};

    if (status && status !== "All") {
      filter.status = status;
    }

    if (category && category !== "All") {
      filter.category = category;
    }

    if (workMode && workMode !== "All") {
      filter.workMode = workMode;
    }

    if (search && search.trim() !== "") {
      const searchRegex = new RegExp(search.trim(), "i");
      filter.$or = [
        { title: searchRegex },
        { primarySkill: searchRegex },
        { location: searchRegex },
        { category: searchRegex },
      ];
    }

    const [jobs, totalJobs, publishedJobs, draftJobs, closedJobs] =
      await Promise.all([
        Job.find(filter).sort({ updatedAt: -1, createdAt: -1 }),
        Job.countDocuments(),
        Job.countDocuments({ status: "Published" }),
        Job.countDocuments({ status: "Draft" }),
        Job.countDocuments({ status: "Closed" }),
      ]);

    return res.status(200).json({
      metrics: {
        totalJobs,
        publishedJobs,
        draftJobs,
        closedJobs,
      },
      jobs,
    });
  } catch (error) {
    console.error("Error in getAdminJobs:", error.message);
    return res.status(500).json({ error: "Failed to retrieve job postings." });
  }
};

/**
 * POST /consultancy/admin/jobs
 * Creates a new job posting in Draft or Published state.
 */
export const createJob = async (req, res) => {
  try {
    const {
      title,
      companyName,
      category,
      department,
      primarySkill,
      experience,
      minExperience,
      maxExperience,
      relevantExperience,
      skills,
      qualifications,
      location,
      workMode,
      employmentType,
      openings,
      salaryRange,
      deadline,
      description,
      responsibilities,
      requirements,
      status,
    } = req.body;

    if (!title || !category || !primarySkill || !experience || !description || !location) {
      return res.status(400).json({
        error:
          "Missing required fields: Title, Category, Primary Skill, Experience, Location, and Description are required.",
      });
    }

    const skillsArray = normalizeArray(skills);
    if (skillsArray.length === 0) {
      return res.status(400).json({ error: "Please provide at least one required skill." });
    }

    const adminIdentifier =
      req.user?.fullName || req.user?.email || req.user?.mobileNumber || "Admin";

    const job = new Job({
      title: title.trim(),
      companyName: (companyName || "Tekisky Pvt. Ltd.").trim(),
      category: category.trim(),
      department: department ? department.trim() : category.trim(),
      primarySkill: primarySkill.trim(),
      experience: experience.trim(),
      minExperience: minExperience ? Number(minExperience) : 0,
      maxExperience: maxExperience ? Number(maxExperience) : 0,
      relevantExperience: relevantExperience ? relevantExperience.trim() : "",
      skills: skillsArray,
      qualifications: normalizeArray(qualifications),
      location: location.trim(),
      workMode: workMode || "Hybrid",
      employmentType: employmentType || "Full-time",
      openings: openings ? Math.max(1, Number(openings)) : 1,
      salaryRange: salaryRange ? salaryRange.trim() : "",
      deadline: deadline ? new Date(deadline) : null,
      description: description.trim(),
      responsibilities: normalizeArray(responsibilities),
      requirements: normalizeArray(requirements),
      status: status === "Draft" ? "Draft" : "Published",
      postedDate: status === "Draft" ? null : new Date(),
      createdBy: adminIdentifier,
      isVerified: true,
    });

    const savedJob = await job.save();
    return res.status(201).json({
      message: "Job posting created successfully.",
      job: savedJob,
    });
  } catch (error) {
    console.error("Error creating job:", error.message);
    return res.status(400).json({ error: error.message || "Failed to create job posting." });
  }
};

/**
 * PUT /consultancy/admin/jobs/:id
 * Updates an existing job posting.
 */
export const updateJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ error: "Job posting not found." });
    }

    const updatePayload = { ...req.body };

    if (updatePayload.skills !== undefined) {
      updatePayload.skills = normalizeArray(updatePayload.skills);
    }
    if (updatePayload.responsibilities !== undefined) {
      updatePayload.responsibilities = normalizeArray(updatePayload.responsibilities);
    }
    if (updatePayload.requirements !== undefined) {
      updatePayload.requirements = normalizeArray(updatePayload.requirements);
    }
    if (updatePayload.qualifications !== undefined) {
      updatePayload.qualifications = normalizeArray(updatePayload.qualifications);
    }
    if (updatePayload.openings !== undefined) {
      updatePayload.openings = Math.max(1, Number(updatePayload.openings));
    }
    if (updatePayload.deadline !== undefined) {
      updatePayload.deadline = updatePayload.deadline ? new Date(updatePayload.deadline) : null;
    }

    // If publishing a draft for the first time
    if (updatePayload.status === "Published" && !job.postedDate) {
      updatePayload.postedDate = new Date();
    }

    const updatedJob = await Job.findByIdAndUpdate(req.params.id, updatePayload, {
      new: true,
      runValidators: true,
    });

    return res.status(200).json({
      message: "Job posting updated successfully.",
      job: updatedJob,
    });
  } catch (error) {
    console.error("Error updating job:", error.message);
    return res.status(400).json({ error: error.message || "Failed to update job posting." });
  }
};

/**
 * PATCH /consultancy/admin/jobs/:id/status
 * Quickly publish, unpublish (draft), or close a job posting.
 */
export const patchJobStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!["Draft", "Published", "Closed"].includes(status)) {
      return res.status(400).json({
        error: "Invalid status. Must be one of 'Draft', 'Published', or 'Closed'.",
      });
    }

    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ error: "Job posting not found." });
    }

    job.status = status;
    if (status === "Published" && !job.postedDate) {
      job.postedDate = new Date();
    }

    await job.save();

    return res.status(200).json({
      message: `Job status updated to ${status}.`,
      job,
    });
  } catch (error) {
    console.error("Error updating job status:", error.message);
    return res.status(500).json({ error: "Failed to update job status." });
  }
};

/**
 * DELETE /consultancy/admin/jobs/:id
 * Permanently removes a job posting.
 */
export const deleteJob = async (req, res) => {
  try {
    const deleted = await Job.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: "Job posting not found." });
    }
    return res.status(200).json({
      message: "Job posting deleted successfully.",
      id: req.params.id,
    });
  } catch (error) {
    console.error("Error deleting job:", error.message);
    return res.status(500).json({ error: "Failed to delete job posting." });
  }
};
