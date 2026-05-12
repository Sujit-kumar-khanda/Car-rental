// check for who access the rescources is it vendor or superadmin if they not they can't access the resources

export const canManageResource = (resourceUser, user) => {
  if (!resourceUser || !user) return false;

  const ownerId =
    resourceUser?._id?.toString?.() ||
    resourceUser?.toString?.();

  const userId = user._id?.toString?.();

  if (!ownerId || !userId) return false;

  return (
    user.role === "superadmin" ||
    ownerId === userId
  );
};
