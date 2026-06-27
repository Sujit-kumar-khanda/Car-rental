export const getVendorDetails = async (
  req,
  res,
  next,
) => {
  try {
    const result =
      await getVendorDetailsService(
        req.params.vendorId,
      );

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getVendors = async (
  req,
  res,
  next,
) => {
  try {
    const page = Math.max(
      1,
      parseInt(req.query.page) || 1,
    );

    const limit = Math.max(
      1,
      parseInt(req.query.limit) || 10,
    );

    const search = req.query.search || "";

    const result = await getVendorsService(
      page,
      limit,
      search,
    );

    return res.status(200).json({
      success: true,
      message: "Vendors fetched successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const blockVendor = async (
  req,
  res,
  next,
) => {
  try {
    await blockVendorService(
      req.params.vendorId,
      req.user._id,
    );

    return res.status(200).json({
      success: true,
      message:
        "Vendor blocked successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const unblockVendor = async (
  req,
  res,
  next,
) => {
  try {
    await unblockVendorService(
      req.params.vendorId,
    );

    return res.status(200).json({
      success: true,
      message:
        "Vendor unblocked successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const deleteVendor = async (
  req,
  res,
  next,
) => {
  try {
    await deleteVendorService(
      req.params.vendorId,
    );

    return res.status(200).json({
      success: true,
      message:
        "Vendor deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const restoreVendor = async (
  req,
  res,
  next,
) => {
  try {
    await restoreVendorService(
      req.params.vendorId,
    );

    return res.status(200).json({
      success: true,
      message:
        "Vendor restored successfully",
    });
  } catch (error) {
    next(error);
  }
};