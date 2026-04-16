// if role is admin and approved by superAdmin or if role is superAdmin then only access the route

export const isVendorOrSuperAdmin = (req, res, next) => {
  if (
    (req.user.role == "admin" && req.user.isApprovedVendor) ||
    req.user.role == "superadmin"
  ) {
    return next();
  } else {
    return res
      .status(403)
      .json({ message: "Access denied. Approved vendor or Super Admin only." });
  }

  
};
