import User from "../models/userModel";

// 🟣 6. GET PENDING ADMINS

export const getPendingApprovals = async (req, res) => {
  try {
    const pendingApprovals = await User.find({
      role: "admin",
      isApprovedVendor: false,
    }).select("-password");

    return res.status(200).json({ pendingApprovals });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🟣 7. SUPERADMIN APPROVE VENDOR

export const approveAdmin = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.role !== "admin") {
      return res.status(400).json({ message: "User is not an admin" });
    }

    if (user.isApprovedVendor) {
      return res.status(400).json({ message: "Already approved" });
    }

    user.isApprovedVendor = true;
    await user.save();

    return res.json({ message: "Admin approved successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🟣 8. SUPERADMIN REJECT VENDOR
export const rejectAdmin = async (req, res) => {
  try {
    // find the user by id from the request parameters bcz fronted only store token of superadmin after login and when superadmin click on approve or reject button then send the user id of the admin to be approved or rejected in the request parameters
    const user = await User.findById(req.params.id);

    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.role !== "admin") {
      return res.status(400).json({ message: "User is not an admin" });
    }

    user.role = "user"; // demote back to user
    user.isApprovedVendor = false;

    await user.save();

    return res.json({ message: "Admin rejected successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🟣 9. GET ALL APPROVED VENDORS
export const getAllApprovedVendors = async (req, res) => {
  try {
    const approvedVendors = await User.find({
      role: "admin",
      isApprovedVendor: true,
    }).select("-password");
    return res.status(200).json({ approvedVendors });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🟣 10. GET ALL PENDING VENDORS
export const getAllPendingVendors = async (req, res) => {
  try {
    const pendingVendors = await User.find({
      role: "admin",
      isApprovedVendor: false,
    }).select("-password");
    return res.status(200).json({ pendingVendors });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🟣 11. GET ALL USERS
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: { $ne: "superadmin" } }).select(
      "-password",
    );
    return res.status(200).json({ users });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🟣 12. DELETE USER (SUPERADMIN ONLY)
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    await user.deleteOne();
    return res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
