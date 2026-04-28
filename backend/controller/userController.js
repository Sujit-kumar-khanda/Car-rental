import {
  getUserProfileService,
  updateUserProfileService,
  requestVendorService,
} from "../services/userService.js";

// GET PROFILE
export const getUserProfile = async (req, res) => {
  try {
    const user = await getUserProfileService(req.user._id);

    res.status(200).json(user);
  } catch (error) {
    res.status(404).json({
      message: error.message,
    });
  }
};

// UPDATE PROFILE
export const updateUserProfile = async (req, res) => {
  try {
    const user = await updateUserProfileService(
      req.user._id,
      req.body,
      req.file
    );

    res.status(200).json({
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

// REQUEST ADMIN ROLE
export const requestVendorAccess = async (req, res) => {
  try {
    const result = await requestAdminService(req.user._id);

    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};