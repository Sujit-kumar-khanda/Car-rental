import Booking from "../models/Booking.js";
import Vehicle from "../models/Vehicle.js";

// Create Booking (User Only)
export const createBooking = async (req, res) => {
  try {
    const { vehicleId, startDate, endDate, bookingType } = req.body;

    const vehicle = await Vehicle.findById(vehicleId);

    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    if (!vehicle.isAvailable) {
      return res.status(400).json({ message: "Vehicle not available" });
    }

    // calculate days
    const start = new Date(startDate);
    const end = new Date(endDate);
    let totalPrice = 0;

    //  HOURLY BOOKING
    if ( bookingType === "hourly") {
      const hours = (end - start) / (1000 * 60 * 60);

      if (hours <= 0) {
        return res.status(400).json({ message: "Invalid time range" });
      }

      totalPrice = hours * vehicle.pricePerHour;
    }

    // DAILY BOOKING (default)
    else {
      const days = (end - start) / (1000 * 60 * 60 * 24);

      if (days <= 0) {
        return res.status(400).json({ message: "Invalid dates" });
      }

      totalPrice = days * vehicle.pricePerDay;
    }


    const booking = await Booking.create({
      bookingId: "BK" + Math.floor(100000 + Math.random() * 900000),
      user: req.user.id,
      vehicle: vehicleId,
      startDate,
      endDate,
      totalPrice,
      status: "pending"
    });

    res.status(201).json({
      message: "Booking created successfully",
      booking
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Approve Booking (Admin Only)
export const approveBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    booking.status = "approved";

    // optional: make vehicle unavailable
    await Vehicle.findByIdAndUpdate(booking.vehicle, { // give one document of vehicle schema which have same id as booking.vehicle and update isAvailable to false
      isAvailable: false
    });

    await booking.save();

    res.json({
      message: "Booking approved",
      booking
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Cancel Booking (User or Admin)
export const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    booking.status = "cancelled";

    // make vehicle available again
    await Vehicle.findByIdAndUpdate(booking.vehicle, {
      isAvailable: true
    });

    await booking.save();

    res.json({
      message: "Booking cancelled",
      booking
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get User's Bookings ()
export const getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id }) // give all documents of booking schema which have user id same as req.user.id
      .populate("vehicle") // convert vehicle id to vehicle document and give all elements of vehicle schema
      .sort({ createdAt: -1 }); // sort by createdAt in descending order (latest first)

    res.json(bookings);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get All Bookings (Admin Only)
export const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find() // get every document of booking schema
      .populate("user") // convert user id to user document and give all elements of user schema
      .populate("vehicle") // convert vehicle id to vehicle document and give all elements of vehicle schema
      .sort({ createdAt: -1 }); // sort by createdAt in descending order (latest first)

    res.json(bookings);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Booking by ID (Admin Only)
export const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id) // give one document of booking schema which have same id as req.params.id
      .populate("user") // convert user id to user document and give all elements of user schema
      .populate("car"); // convert car id to car document and give all elements of car schema

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.json(booking);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// DELETE BOOKING (optional admin)
export const deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    await booking.deleteOne(); // delete the booking document

    res.json({ message: "Booking deleted successfully" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};