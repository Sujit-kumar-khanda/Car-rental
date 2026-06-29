// utils/permissions.js
export const canManageResource = (resourceUser, user) => {
  if (!resourceUser || !user) return false;

  const ownerId =
    resourceUser?._id?.toString?.() ||
    resourceUser?.toString?.();

  const userId = user?._id?.toString?.() || user.id?.toString?.();

  if (!ownerId || !userId) return false;

  return (
    user.role === "superadmin" ||
    ownerId === userId
  );
};

export const isBookingCustomer = (bookingUser, user) => {
  if (!bookingUser || !user) return false;

  const bookingUserId =
    bookingUser?._id?.toString?.() ||
    bookingUser?.toString?.();

  const userId = user?._id?.toString?.() || user.id?.toString?.();

  if (!bookingUserId || !userId) return false;

  return bookingUserId === userId;
};