import Consultancy from "../model/consultancyModel.js";
import UserModel from "../model/userModel.js";
import { createUserService, deleteUserService, getUsersService, loginService, updateUserServiceById } from "../services/userService.js";

export const createUser = async (req, res) => {
  try {
    const newUserResponse = await createUserService(req.body);

    if (newUserResponse.success) {
      const { user } = newUserResponse;

      const userWithoutPassword = { ...user._doc };
      delete userWithoutPassword.password;

      return res.status(201).json({
        message: "User created successfully",
        user: userWithoutPassword,
      });
    } else {
      const { error } = newUserResponse;

      if (error === "Mobile number or email is already taken") {
        return res.status(401).json({ error: "User already exists" });
      }

      return res.status(400).json({ error });
    }
  } catch (error) {
    console.error("Error creating user:", error.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const loginUser = async (req, res) => {
  try {
    const loginData = req.body;

    const result = await loginService(loginData);

    if (result.success) {
      const { token, user, userType, collegeName } = result;

      res.status(200).json({
        success: true,
        message: result.message,
        token,
        user,
        userType,
        collegeName,
      });
    } else {
      res.status(401).json({ error: result.error });
    }
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getUsers = async (req, res) => {
  try {
    const users = await getUsersService();

    if (users.success) {
      res.status(200).json({ users: users });
    } else {
      res.status(500).json({ error: users.error });
    }
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const updateUserById = async (req, res) => {
  try {
    const userId = req.params.id;
    const updateData = req.body;
    console.log("req.bodyy", req.body);

    const updatedUser = await updateUserServiceById(userId, updateData);

    if (updatedUser.success) {
      console.log("User updated successfully. Updated User:", updatedUser);
      res.status(200).json({
        message: "User updated successfully",
        updatedUser: updatedUser,
      });
    } else {
      console.error("Error updating user:", updatedUser.error);
      res.status(404).json({ error: updatedUser.error });
    }
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    const result = await deleteUserService(userId);

    if (result) {
      res.status(200).json({ message: "User deleted successfully" });
    } else {
      res.status(404).json({ error: result });
    }
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
};

export const getTeacherConsultancyApplications = async (req, res) => {
  try {
    const userId = req.params.userId; // Fetch userId from URL parameter

    // Check if the user exists
    const user = await UserModel.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if the user is a teacher
    if (user.userType !== 'teacher') {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Fetch applications where referedBy matches collegeName
    const collegeName = user.collegeName;
    console.log(`Fetching applications for collegeName: ${collegeName}`);

    const applications = await Consultancy.find({ referredBy: collegeName });

    console.log(`Found ${applications.length} applications`);

    res.status(200).json({ success: true, applications });
  } catch (error) {
    console.error("Error fetching consultancy applications for teacher:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
