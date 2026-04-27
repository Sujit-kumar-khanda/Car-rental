// controllers/superAdminController.js

import {
  getPendingApprovalsService,
  approveAdminService,
  rejectAdminService,
  getAllApprovedVendorsService,
  getAllPendingVendorsService,
  getAllUsersService,
  deleteUserService,
} from "../services/superAdminService.js";

// 🟣 6. GET PENDING ADMINS
export const getPendingApprovals = async (req, res) => {
  try {
    const pendingApprovals = await getPendingApprovalsService();

    return res.status(200).json({ pendingApprovals });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🟣 7. SUPERADMIN APPROVE VENDOR
export const approveAdmin = async (req, res) => {
  try {
    const result = await approveAdminService(req.params.id);

    return res.json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// 🟣 8. SUPERADMIN REJECT VENDOR
export const rejectAdmin = async (req, res) => {
  try {
    const result = await rejectAdminService(req.params.id);

    return res.json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// 🟣 9. GET ALL APPROVED VENDORS
export const getAllApprovedVendors = async (req, res) => {
  try {
    const approvedVendors = await getAllApprovedVendorsService();

    return res.status(200).json({ approvedVendors });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🟣 10. GET ALL PENDING VENDORS
export const getAllPendingVendors = async (req, res) => {
  try {
    const pendingVendors = await getAllPendingVendorsService();

    return res.status(200).json({ pendingVendors });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🟣 11. GET ALL USERS
export const getAllUsers = async (req, res) => {
  try {
    const users = await getAllUsersService();

    return res.status(200).json({ users });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🟣 12. DELETE USER
export const deleteUser = async (req, res) => {
  try {
    const result = await deleteUserService(req.params.id);

    return res.json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};