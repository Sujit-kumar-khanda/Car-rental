// if role is vendor and approved by superAdmin or if role is superAdmin then only access the route
    
export const isVendorOrSuperAdmin = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const isApprovedVendor =
      req.user.role === "vendor" &&
      req.user.isApprovedVendor;

    const isSuperAdmin =
      req.user.role === "superadmin";

    if (isApprovedVendor || isSuperAdmin) {
      return next();
    }

    return res.status(403).json({
      message:
        "Access denied. Approved vendor or superadmin only.",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
    });
  }
};