import * as userServices from "./user.services.js";

// GET PROFILE
export const getUserProfile = async (req, res) => {
  try {
    const user = await userServices.getUserProfile(req.user.id);

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
    const user = await userServices.updateUserProfile(
      req.user.id,
      req.body,
      req.file,
    );

    res.status(200).json({
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// REQUEST VENDOR ROLE
export const requestVendorAccess = async (req, res) => {
  try {
    const result = await userServices.requestVendor(req.user.id);

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
