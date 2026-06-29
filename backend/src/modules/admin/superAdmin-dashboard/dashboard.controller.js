export const getDashboardStats = async (
  req,
  res,
  next,
) => {
  try {
    const stats =
      await getDashboardStatsService();

    return res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};