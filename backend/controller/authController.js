import {
  registerUserService,
  loginUserService,
} from "../services/authService.js";

import { generateToken } from "../config/jwt.js";

export const registerUser = async (req, res) => {
  try {
    const user = await registerUserService(req.body);

    generateToken(user._id, res);

    res.status(201).json({
      message: "User registered successfully",
      user,
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

export const loginUser = async (req, res) => {
  try {
    const user = await loginUserService(req.body);

    generateToken(user._id, res);

    res.status(200).json({
      message: "Login successful",
      user,
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

export const logoutUser = async (req, res) => {
  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(0),
  });

  res.status(200).json({
    message: "Logged out successfully",
  });
};