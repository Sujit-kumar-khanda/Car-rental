import Holiday from "./holiday.model.js";

export const addHolidayService = async (holidayData) => {
  const {
    name,
    description,
    startDate,
    endDate,
    year,
    surgeType,
    surgeValue,
    applicableSegments,
  } = holidayData;

  const start = new Date(startDate);

  const end = new Date(endDate);

  if (end <= start) {
    throw new Error("End date must be after start date");
  }

  const existingHoliday = await Holiday.findOne({
    name: name.trim(),

    year,

    isDeleted: false,
  });

  if (existingHoliday) {
    throw new Error("Holiday already exists for this year");
  }

  // OVERLAP VALIDATION

  const overlappingHoliday = await Holiday.findOne({
    isDeleted: false,

    startDate: {
      $lte: end,
    },

    endDate: {
      $gte: start,
    },
  });

  if (overlappingHoliday) {
    throw new Error("Holiday dates overlap");
  }

  // =========================
  // CREATE HOLIDAY
  // =========================

  const holiday = await Holiday.create({
    name: name.trim(),

    description,

    startDate: start,

    endDate: end,

    year,

    surgeType,

    surgeValue,

    applicableSegments,

    createdBy: user._id,
  });

  return holiday;
};

// TOGGLE
export const toggleHolidayService = async (holidayId) => {
  const holiday = await Holiday.findById(holidayId);

  if (!holiday) {
    throw new Error("Holiday not found");
  }

  holiday.isActive = !holiday.isActive;

  await holiday.save();

  return holiday;
};

// SOFT DELETE
export const deleteHolidayService = async (holidayId) => {
  const holiday = await Holiday.findById(holidayId);

  if (!holiday) {
    throw new Error("Holiday not found");
  }

  if (holiday.isDeleted) {
    throw new Error("Holiday already deleted");
  }

  holiday.isDeleted = true;
  holiday.isActive = false;

  await holiday.save();

  return holiday;
};

//RESTORE
export const restoreHolidayService = async (holidayId) => {
  const holiday = await Holiday.findById(holidayId);

  if (!holiday) {
    throw new Error("Holiday not found");
  }

  if (!holiday.isDeleted) {
    throw new Error("Holiday is already active");
  }

  holiday.isDeleted = false;
  holiday.isActive = true;

  await holiday.save();

  return holiday;
};

//UPDATE
export const updateHolidayService = async (holidayId, updateData) => {
  const holiday = await Holiday.findById(holidayId);

  if (!holiday) {
    throw new Error("Holiday not found");
  }

  if (holiday.isDeleted) {
    throw new Error("Cannot update deleted holiday");
  }

  const allowedFields = [
    "name",
    "description",
    "startDate",
    "endDate",
    "year",
    "surgeType",
    "surgeValue",
    "applicableSegments",
  ];

  allowedFields.forEach((field) => {
    if (updateData[field] !== undefined) {
      holiday[field] = updateData[field];
    }
  });

  if (holiday.endDate <= holiday.startDate) {
    throw new Error("End date must be after start date");
  }

  // check for overlapping holidays

  const overlappingHoliday = await Holiday.findOne({
    _id: { $ne: holidayId },

    isDeleted: false,

    startDate: {
      $lte: holiday.endDate,
    },

    endDate: {
      $gte: holiday.startDate,
    },
  });

  if (overlappingHoliday) {
    throw new Error("Holiday dates overlap with another holiday");
  }

  await holiday.save();

  return holiday;
};

// GET ALL HOLIDAYS
export const getAllHolidaysService = async (user) => {
  if (user.role === "user") {
    throw new Error("Not allowed");
  }
  return await Holiday.find({
    isDeleted: false,
  }).sort({
    startDate: 1,
  });
};

// GET HOLIDAY BY ID
export const getHolidayByIdService = async (holidayId, user) => {
  if (user.role === "user") {
    throw new Error("Not allowed");
  }
  const holiday = await Holiday.findById(holidayId);

  if (!holiday) {
    throw new Error("Holiday not found");
  }

  return holiday;
};

// GET ACTIVE HOLIDAYS FOR YEAR
export const getActiveHolidaysService = async (user) => {
  if (user.role === "user") {
    throw new Error("Not allowed");
  }
  return await Holiday.find({
    isActive: true,
    isDeleted: false,
  });
};

// GET CURRENT HOLIDAYS
export const getCurrentHolidayService = async (user) => {
  const now = new Date();
  if (user.role === "user") {
    throw new Error("Not allowed");
  }
  return await Holiday.findOne({
    isActive: true,
    isDeleted: false,
    startDate: { $lte: now },
    endDate: { $gte: now },
  });
};
