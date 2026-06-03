import * as holidayService from "./holiday.services.js";

export const addHoliday = async (req, res) => {
  try {
    // only superadmin
    if (req.user.role !== "superadmin") {
      return res.status(403).json({
        success: false,
        message: "Only superadmin can add holidays",
      });
    }

    const holiday = await holidayService.addHolidayService(req.body, req.user);

    res.status(201).json({
      success: true,
      message: "Holiday added successfully",
      holiday,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// TOGGLE
export const toggleHoliday = async (req, res) => {
  try {
    if (req.user.role !== "superadmin") {
      return res.status(403).json({
        success: false,
        message: "Only superadmin can toggle holidays",
      });
    }

    const holiday = await holidayService.toggleHolidayService(req.params.id);

    res.status(200).json({
      success: true,
      message: holiday.isActive ? "Holiday activated" : "Holiday deactivated",
      holiday,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// SOFT DELETE
export const deleteHoliday = async (req, res) => {
  try {
    if (req.user.role !== "superadmin") {
      return res.status(403).json({
        success: false,
        message: "Only superadmin can delete holidays",
      });
    }

    await holidayService.deleteHolidayService(req.params.id);

    res.status(200).json({
      success: true,
      message: "Holiday deleted successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

//RESTORE
export const restoreHoliday = async (req, res) => {
  try {
    if (req.user.role !== "superadmin") {
      return res.status(403).json({
        success: false,
        message: "Only superadmin can restore holidays",
      });
    }

    const holiday = await holidayService.restoreHolidayService(req.params.id);

    res.status(200).json({
      success: true,
      message: "Holiday restored successfully",
      holiday,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

//UPDATE
export const updateHoliday = async (req, res) => {
  try {
    if (req.user.role !== "superadmin") {
      return res.status(403).json({
        success: false,
        message: "Only superadmin can update holidays",
      });
    }

    const holiday = await holidayService.updateHolidayService(
      req.params.id,
      req.body,
    );

    res.status(200).json({
      success: true,
      message: "Holiday updated successfully",
      holiday,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// GET ALL HOLIDAYS
export const getAllHolidays = async (req, res) => {
  try {
    const holidays = await holidayService.getAllHolidaysService(req.user);

    res.status(200).json({
      success: true,
      holidays,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET HOLIDAY BY ID
export const getHolidayById = async (req, res) => {
  try {
    const holiday = await holidayService.getHolidayByIdService(
      req.params.id,
      req.user,
    );

    res.status(200).json({
      success: true,
      holiday,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

// GET ACTIVE HOLIDAYS
export const getActiveHolidays = async (req, res) => {
  try {
    const holidays = await holidayService.getActiveHolidaysService(req.user);

    if (!holidays) {
      return res.status(404).json({
        success: false,
        message: "No active holidays found",
      });
    }

    res.status(200).json({
      success: true,
      holidays,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET CURRENT HOLIDAYS
export const getCurrentHoliday = async (req, res) => {
  try {
    const holiday = await holidayService.getCurrentHolidayService(req.user);

    if (!holiday) {
      return res.status(404).json({
        success: false,
        message: "No current holiday found",
      });
    }

    res.status(200).json({
      success: true,
      holiday,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
