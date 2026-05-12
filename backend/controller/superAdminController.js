// controllers/superAdminController.js

import {
  getPendingApprovalsService,
  approveVendorService,
  rejectVendorService,
  getAllApprovedVendorsService,
  getAllPendingVendorsService,
  getAllUsersService,
  deleteUserService,
  getAllBookingService,
  allDeletedBookingsService,
} from "../services/superAdminService.js";

//  4 - GET PENDING ADMINS
export const getPendingApprovals = async (req, res) => {
  try {
    const pendingApprovals = await getPendingApprovalsService();

    return res.status(200).json({ pendingApprovals });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 5 -  SUPERADMIN APPROVE VENDOR
export const approveVendor = async (req, res) => {
  try {
    const result = await approveVendorService(req.params.id);

    return res.json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// 6 -  SUPERADMIN REJECT VENDOR
export const rejectAdmin = async (req, res) => {
  try {
    const result = await rejectVendorService(req.params.id);

    return res.json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// 7 -  GET ALL APPROVED VENDORS
export const getAllApprovedVendors = async (req, res) => {
  try {
    const approvedVendors = await getAllApprovedVendorsService();

    return res.status(200).json({ approvedVendors });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 8 -  GET ALL PENDING VENDORS
export const getAllPendingVendors = async (req, res) => {
  try {
    const pendingVendors = await getAllPendingVendorsService();

    return res.status(200).json({ pendingVendors });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 9 -  GET ALL USERS
export const getAllUsers = async (req, res) => {
  try {
    const users = await getAllUsersService();

    return res.status(200).json({ users });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 10 -  DELETE USER
export const deleteUser = async (req, res) => {
  try {
    const result = await deleteUserService(req.params.id);

    return res.json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


// 11 - GET ALL BOOKINGS (ADMIN)
export const getAllBookings = async (
  req,
  res
) => {
  try {
    const bookings =
      await bookingService.getAllBookingsService();

    return res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// 12 - GET ALL DELETED BOOKINGS (ADMIN)
export const getAllDeletedBookings = async (req,res) => {
  try {
    const bookings = await bookingService.allDeletedBookingsService();

    return res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



