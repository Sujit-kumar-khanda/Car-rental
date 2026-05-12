export const checkVendorApproval = (req, res, next) => {
  if (req.user.role === "vendor" && !req.user.isApprovedVendor) {
    return res.status(403).json({
      message: "Vendor not approved yet",
    });
  }
}
