import User from "../models/userModel.js";

// GET PROFILE
export const getUserProfileService = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};

// UPDATE PROFILE
export const updateUserProfileService = async (
  userId,
  body,
  file
) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  const {
    phone,
    dateOfBirth,
    street,
    city,
    state,
    country,
    zipCode,
    licenseNumber,
    licenseExpiryDate,
  } = body;

  // phone update
  if (phone) user.phone = phone;

  // dob update
  if (dateOfBirth) user.dateOfBirth = dateOfBirth;

  // address update
  user.address.street = street || user.address.street;
  user.address.city = city || user.address.city;
  user.address.state = state || user.address.state;
  user.address.country = country || user.address.country;
  user.address.zipCode = zipCode || user.address.zipCode;

  // driving license
  if (licenseNumber) {
    user.drivingLicense.number = licenseNumber;
  }

  if (licenseExpiryDate) {
    user.drivingLicense.expiryDate = licenseExpiryDate;
  }

  // profile image upload
  if (file) {
    user.profileImage = `uploads/${file.filename}`;
  }

  await user.save();

  return user;
};

// REQUEST VENDOR ROLE
export const requestVendorService = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  if (user.role === "superadmin") {
    throw new Error("Superadmin already has highest access");
  }

  if (user.role === "vendor" && user.isApprovedVendor) {
    throw new Error("You are already an approved vendor");
  }

  if (user.role === "vendor" && !user.isApprovedVendor) {
    throw new Error("vendor request already pending");
  }

  user.role = "vendor";
  user.isApprovedVendor = false;

  await user.save();

  return {
    message: "vendor request submitted successfully",
  };
};