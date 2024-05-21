import selectedStudent from "../model/selectedStudentModel.js";

export const getAllSelectedStudents = async (req, res) => {
  try {
    const students = await selectedStudent.find();
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createSelectedStudents = async (req, res) => {
  try {
    const { name, education, companyName, designation, gender } = req.body;
    const student = new selectedStudent({
      name,
      education,
      companyName,
      designation,
      gender,
    });
    await student.save();
    res.status(201).json(student);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteSelectedStudent = async (req, res) => {
  try {
    const deletedStudent = await selectedStudent.findByIdAndDelete(
      req.params.id
    );
    if (!deletedStudent) {
      return res.status(404).json({ message: "Student not found" });
    }
    res.json(deletedStudent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateSelectedStudent = async (req, res) => {
  try {
    // const { name,  gender } = req.body;
    const updatedStudent = await selectedStudent.findByIdAndUpdate(
      req.params.id,
      req.body,
    
      { new: true }
    );
    if (!updatedStudent) {
      return res.status(404).json({ message: "Student not found" });
    }
    res.json(updatedStudent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
