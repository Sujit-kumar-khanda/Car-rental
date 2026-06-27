import * as userManagementService from "./userManagement.service.js";

export const getUsers = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);

    const limit = Math.max(1, parseInt(req.query.limit) || 10);

    const search = req.query.search || "";

    const status  = req.query.status || "";

    const result = await userManagementService.getUsersService(page, limit, search, status);

    return res.status(200).json({
      success: true,
      message: "Users fetched successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getUserDetails = async (req, res, next) => {
  try {
    const result = await userManagementService.getUserDetailsService(req.params.userId);

    return res.status(200).json({
      success: true,
      message: "User details fetched successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};


export const blockUser = async (req, res, next) => {
  try {
    await userManagementService.blockUserService(req.params.userId);

    return res.status(200).json({
      success: true,
      message: "User blocked successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const unblockUser = async (req, res, next) => {
  try {
    await userManagementService.unblockUserService(req.params.userId);

    return res.status(200).json({
      success: true,
      message: "User unblocked successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    await userManagementService.deleteUserService(req.params.userId);

    return res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const restoreUser = async (req, res, next) => {
  try {
    await userManagementService.restoreUserService(req.params.userId);

    return res.status(200).json({
      success: true,
      message: "User restored successfully",
    });
  } catch (error) {
    next(error);
  }
};
