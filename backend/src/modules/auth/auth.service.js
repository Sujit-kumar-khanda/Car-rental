import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import validator from "validator";

import { generateToken } from "./auth.utils.js";

// Register
export const register = async (data, res) => {
  const { name, email, password } = data;

  if (!name || !email || !password) {
    throw new Error("All fields are required");
  }

  if (!validator.isEmail(email)) {
    throw new Error("Invalid email format");
  }

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new Error("User already exists");
  }

  if (!validator.isStrongPassword(password)) {
    throw new Error(
      "Password must contain uppercase, lowercase, number and symbol",
    );
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    role: "user",
  });

  // remove password
  const userData = await User.findById(user._id).select("-password");

  // generate token
  generateToken(user._id, res);

  return userData;
};

// Login
export const login = async (data, res) => {
  const { email, password } = data;

  if (!email || !password) {
    throw new Error("All fields are required");
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    throw new Error("Invalid credentials");
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new Error("Invalid credentials");
  }

  // remove password
  const userData = await User.findById(user._id).select("-password");

  // generate token
  generateToken(user._id, res);

  return userData;
};
