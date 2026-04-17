import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import {generateToken} from "../config/jwt.js";
import * as validator from "validator";

// 🔐 Generate Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

// 🟢 1. REGISTER USER (ONLY BASIC INFO)
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // check user exists
    if (!name || !email || !password ) {
      return res.status(400).json({ error: "All fields are required" });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    // check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    if (!validator.isStrongPassword(password)) {
      return res.status(400).json({
        error:
          "Password is not strong enough. It should be at least 8 characters long and include uppercase letters, lowercase letters, numbers, and special characters.",
      });
    }

    if (password.length < 8) {
      return res
        .status(400)
        .json({ error: "Password must be at least 8 characters long" });
    }

    
    

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // create user (ONLY BASIC DATA)
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "user", // default role is user, can be changed to admin by superadmin later
    });

    const userData = await User.findById(user._id).select("-password");

    // set cookie
    generateToken(user._id, res);

    res.status(201).json({
      message: "User registered successfully",
      user: userData,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🔵 2. LOGIN USER
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // find user
    const user = await User.findOne({ email }); // give all fields of one user document which matches the email 
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // set cookie
    generateToken(user._id, res);
    const userData = await User.findById(user._id).select("-password");
    res.json({
      message: "Login successful",
      user: userData,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🟡 3. GET USER PROFILE (AFTER LOGIN)
export const getUserProfile = async (req, res) => {
  try {
    // give one document of user collection which matches the id and exclude the password field from the result
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🟠 4. UPDATE USER PROFILE (AFTER LOGIN)
export const updateUserProfile = async (req, res) => {
  try {
    const { phone, age, address, drivingLicense } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 🚗 Driving License Validation
    if (drivingLicense) {
      const dlRegex = /^[A-Z]{2}\d{1,2}\s?\d{4}\s?\d{4,7}$/;

      if (!dlRegex.test(drivingLicense)) {
        return res.status(400).json({
          message: "Invalid driving license format",
        });
      }
    }

    // 🎂 Age Validation (basic rule: minimum 18)
    if (age) {
      if (age < 18 || age > 100) {
        return res.status(400).json({
          message: "Age must be between 18 and 100",
        });
      }
    }

    // 🖼️ Profile Image (Multer file upload)
    const profileImage = req.file
      ? `uploads/${req.file.filename}`
      : user.profileImage;

    // 📝 Update only provided fields
    user.phone = phone || user.phone;
    user.age = age || user.age;
    user.address = address || user.address;
    user.drivingLicense = drivingLicense || user.drivingLicense;
    user.profileImage = profileImage;

    await user.save();

    const updatedUser = await User.findById(user._id).select("-password");

    res.json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// 🟣 5. REQUEST ADMIN ROLE
export const requestAdmin = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.role == "admin" && user.isApprovedVendor) {
      return res.status(400).json({ message: "You are already an admin" });
    }

    if (user.role == "admin" && !user.isApprovedVendor) {
      return res
        .status(400)
        .json({ message: "Admin role already requested. Awaiting approval." });
    }

    user.role = "admin";
    user.isApprovedVendor = false; // reset approval status when requesting admin role
    await user.save();

    return res.json({
      message: "Admin role requested. Awaiting superadmin approval.",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 6. Logout user
export const LogoutUser = async (req, res) => {
  res.cookie("jwt", "", {
    maxAge:0,
  });

  res.json({message: "Logged out successfully"});
}