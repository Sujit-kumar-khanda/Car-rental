import User from "./user.model.js";

// 1 - GET PROFILE
export const getUserProfile = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};

// 2 - UPDATE PROFILE
export const updateUserProfile = async (userId, body, file) => {
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
  if (dateOfBirth) {
    user.dateOfBirth = dateOfBirth;

    const dob = new Date(dateOfBirth);
    const today = new Date();

    let age = today.getFullYear() - dob.getFullYear();

    if (
      today.getMonth() < dob.getMonth() ||
      (today.getMonth() === dob.getMonth() && today.getDate() < dob.getDate())
    ) {
      age--;
    }

    if (age < 18) {
      throw new Error("You must be at least 18 years old");
    } else {
      user.age = age;
    }
  }

  // address update
  user.address.street = street || user.address.street;
  user.address.city = city || user.address.city;
  user.address.state = state || user.address.state;
  user.address.country = country || user.address.country;
  user.address.zipCode = zipCode || user.address.zipCode;

  // driving license
  if (licenseNumber) {
    const dlRegex = /^[A-Z]{2}\d{1,2}\s?\d{4}\s?\d{4,7}$/;

    if (!dlRegex.test(licenseNumber)) {
      return res.status(400).json({
        message: "Invalid driving license format",
      });
    } else {
      user.drivingLicense.number = licenseNumber;
    }
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

// 3 - REQUEST VENDOR ROLE
export const requestVendor = async (userId) => {
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
  user.vendorApprovalStatus = "pending";

  await user.save();

  return {
    message: "vendor request submitted successfully",
  };
};
