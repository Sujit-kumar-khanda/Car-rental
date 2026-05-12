// services/superAdminService.js

import User from "../models/userModel.js";

// 4 -  GET PENDING ADMINS
export const getPendingApprovalsService = async () => {
  return await User.find({
    role: "vendor",
    isApprovedVendor: false,
  }).select("-password");
};

// 5 -  SUPERADMIN APPROVE VENDOR
export const approveVendorService = async (userId) => {
  const user = await User.findById(userId);

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

  return {
    success: true, 
    message: "vendor approved successfully" };
};

// 6 -  SUPERADMIN REJECT VENDOR
export const rejectVendorService = async (id) => {
  
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

// 7 -  GET ALL APPROVED VENDORS
export const getAllApprovedVendorsService = async () => {
  return await User.find({
    role: "vendor",
    isApprovedVendor: true,
  }).select("-password");
};

// 8 -  GET ALL PENDING VENDORS
export const getAllPendingVendorsService = async () => {
  return await User.find({
    role: "vendor",
    isApprovedVendor: false,
  }).select("-password");
};

// 9 -  GET ALL USERS
export const getAllUsersService = async () => {
  return await User.find({
    role: { $ne: "superadmin" },
  }).select("-password");
};

// 10 -  DELETE USER
export const deleteUserService = async (id) => {
  const user = await User.findById(id);

  if (!user) {
    throw new Error("User not found");
  }

  await user.deleteOne();

  return { message: "User deleted successfully" };
};

// Get all bookings (admin)

export const getAllBookingService = async (req, res) => {
  const booking = await Booking.find() // get every doucment of booking schema
      .populate("user", "-password") // convert user id to user document and give all elements of user schema except password
      .populate("vehicle") // convert vehicle id to vehicle document and give all elements of vehicle schema
      .populate("createdBy", "-password")
      .sort({ createdAt: -1 }); // sort by createdAt in descending order (latest first)

  return booking;

}

// Get all deleted bookings (admin)
export const getAllDeletedBookingsService =
  async () => {
    const bookings = await Booking.find({isDeleted: true})
      .populate("user", "-password")
      .populate("vehicle")
      .populate("createdBy", "-password")
      .sort({ createdAt: -1 });

    return bookings;
  };

