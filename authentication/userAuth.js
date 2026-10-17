import jwt from "jsonwebtoken";
import UserModel from "../model/userModel.js";

export const authenticateToken = (req, res, next) => {
  const authHeader = req.header("Authorization");

  if (!authHeader) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  // Handle both "Bearer <token>" and raw token
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7).trim()
    : authHeader.trim();

  jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: "Access denied. Invalid or expired token." });
    }

    req.user = decoded;
    next();
  });
};

export const requireAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required." });
    }

    // Direct check if userType is encoded in JWT
    if (req.user.userType === "admin") {
      return next();
    }

    // Verify against database for security
    const userId = req.user.userId || req.user._id || req.user.id;
    if (userId) {
      const user = await UserModel.findById(userId);
      if (user && user.userType === "admin") {
        req.user = user;
        return next();
      }
    }

    return res.status(403).json({
      error: "Access denied. Only authorized admins can perform this action.",
    });
  } catch (err) {
    console.error("requireAdmin error:", err.message);
    return res.status(500).json({ error: "Internal authorization error." });
  }
};

export default authenticateToken;
