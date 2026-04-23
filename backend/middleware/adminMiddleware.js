// if role is admin and approved by superAdmin or if role is superAdmin then only access the route

export const isVendorOrSuperAdmin = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (
      (req.user.role === "admin" && req.user.isApprovedVendor) ||
      req.user.role === "superadmin"
    ) {
      return next();
    }

    return res.status(403).json({
      message: "Access denied. Approved vendor or Super Admin only.",
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};