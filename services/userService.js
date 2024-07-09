import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import UserModel from "../model/userModel.js";

export const createUserService = async (userData) => {
  try {
    const { password, userType, collegeName, ...userDetails } = userData;

    // Validate user data
    if (!userDetails.mobileNumber || !userDetails.email || !password || !userType) {
      throw new Error("Missing required fields");
    }

    // Check if the mobile number or email is already taken
    const existingUser = await UserModel.findOne({
      $or: [{ mobileNumber: userDetails.mobileNumber }, { email: userDetails.email }],
    });
    if (existingUser) {
      throw new Error("Mobile number or email is already taken");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new UserModel({
      ...userDetails,
      password: hashedPassword,
      userType,
      collegeName: userType === 'teacher' ? collegeName : undefined,
    });

    await newUser.save();

    return { success: true, message: "User created successfully", user: newUser };
  } catch (error) {
    console.error("Error creating user:", error);
    return { success: false, error: error.message || "Internal Server Error" };
  }
};

export const loginService = async (loginData) => {
  try {
    const { mobileNumber, password } = loginData;

    // Validate login data
    if (!mobileNumber || !password) {
      throw new Error("Mobile number and password are required");
    }

    // Find the user by mobile number
    const user = await UserModel.findOne({ mobileNumber });

    // Check if the user exists
    if (!user) {
      throw new Error("Invalid mobile number or password");
    }

    // Compare the provided password with the stored hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new Error("Invalid mobile number or password");
    }

    // Generate a JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: "1d",
    });

    // Include userType and collegeName in the response
    const { userType, collegeName } = user;

    return {
      success: true,
      message: "Login successful",
      token,
      user: {
        _id: user._id,
        mobileNumber: user.mobileNumber,
        email: user.email,
        userType,
        collegeName,
      },
      userType,
      collegeName,
    };
  } catch (error) {
    console.error("Error during login:", error);
    return { success: false, error: error.message || "Internal Server Error" };
  }
};

export const getUsersService = async () => {
  try {
    // Fetch all users from the database
    const users = await UserModel.find({}, { password: 0 }); // Exclude password field

    return { success: true, users };
  } catch (error) {
    console.error("Error fetching users:", error);
    return { success: false, error: "Internal Server Error" };
  }
};

export const updateUserServiceById = async (userId, updateData) => {
  try {
    // Check if the updateData includes a password field
    if ("password" in updateData) {
      // Handle password update separately
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    // Find and update user by userId
    const updatedUser = await UserModel.findByIdAndUpdate(userId, updateData, { new: true });

    if (!updatedUser) {
      return { success: false, error: "User not found", updatedUser };
    }

    return { success: true, updatedUser };
  } catch (error) {
    console.error("Error updating user:", error);
    return { success: false, error: error.message || "Error updating user" };
  }
};

export const deleteUserService = async (userId) => {
  try {
    // Delete user in the database based on userId
    const deletedUser = await UserModel.findByIdAndDelete(userId);

    if (!deletedUser) {
      throw new Error("User not found");
    }

    return { success: true, message: "User deleted successfully" };
  } catch (error) {
    console.error("Error deleting user:", error);
    return { success: false, error: error.message || "Internal Server Error" };
  }
};
