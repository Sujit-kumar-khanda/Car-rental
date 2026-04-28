// services/superAdminService.js

import User from "../models/userModel.js";

// 🟣 6. GET PENDING ADMINS
export const getPendingApprovalsService = async () => {
  return await User.find({
    role: "vendor",
    isApprovedVendor: false,
  }).select("-password");
};

// 🟣 7. SUPERADMIN APPROVE VENDOR
export const approveAdminService = async (id) => {
  const user = await User.findById(id);

  if (!user) {
    throw new Error("User not found");
  }

  if (user.role !== "vendor") {
    throw new Error("User is not an vendor");
  }

  if (user.isApprovedVendor) {
    throw new Error("Already approved");
  }

  user.isApprovedVendor = true;

  await user.save();

  return { message: "vendor approved successfully" };
};

// 🟣 8. SUPERADMIN REJECT VENDOR
export const rejectAdminService = async (id) => {
  
  const user = await User.findById(id);

  if (!user) {
    throw new Error("User not found");
  }

  if (user.role !== "vendor") {
    throw new Error("User is not an vendor");
  }

  user.role = "user"; // demote back to user
  user.isApprovedVendor = false;

  await user.save();

  return { message: "vendor rejected successfully" };
};

// 🟣 9. GET ALL APPROVED VENDORS
export const getAllApprovedVendorsService = async () => {
  return await User.find({
    role: "vendor",
    isApprovedVendor: true,
  }).select("-password");
};

// 🟣 10. GET ALL PENDING VENDORS
export const getAllPendingVendorsService = async () => {
  return await User.find({
    role: "vendor",
    isApprovedVendor: false,
  }).select("-password");
};

// 🟣 11. GET ALL USERS
export const getAllUsersService = async () => {
  return await User.find({
    role: { $ne: "superadmin" },
  }).select("-password");
};

// 🟣 12. DELETE USER
export const deleteUserService = async (id) => {
  const user = await User.findById(id);

  if (!user) {
    throw new Error("User not found");
  }

  await user.deleteOne();

  return { message: "User deleted successfully" };
};