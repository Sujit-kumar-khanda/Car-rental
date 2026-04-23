import Booking from "../models/Booking.js";
import User from "../models/User.js";
import Vehicle from "../models/Vehicle.js";
import { calculatePrice } from "../services/pricingService.js";

// Create Booking (User Only)
export const createBooking = async (req, res) => {
  try {
    const {
      vehicleId,
      startDate,
      endDate,
      bookingType,
      pickupLocation,
      dropLocation,
    } = req.body;

    const vehicle = await Vehicle.findById(vehicleId);

    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    if (!vehicle.isAvailable) {
      return res.status(400).json({ message: "Vehicle not available" });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // calculate days
    const start = new Date(startDate);
    const end = new Date(endDate);

    // validate dates
    if (end <= start) {
      return res.status(400).json({ message: "Invalid time range" });
    }

    // 5. 🔥 CHECK OVERLAP (IMPORTANT)
    const existingBooking = await Booking.findOne({
      vehicle: vehicleId,
      status: { $in: ["pending", "approved", "confirmed", "ongoing"] }, // only consider active bookings

      // overlap condition: existing start <= new end AND existing end >= new start
      $or: [
        {
          startDate: { $lt: end },
          endDate: { $gt: start },
        },
      ],
    });

    if (existingBooking) {
      return res.status(400).json({
        message: `Vehicle already booked for ${existingBooking.startDate} to ${existingBooking.endDate}`,
      });
    }

    const { totalPrice, surgeAmount } = await calculatePrice(
      vehicle,
      start,
      end,
      bookingType,
    );

    const basePrice = totalPrice - surgeAmount;

    // Night time logic
    const startHour = start.getHours(); // 0-23
    const isNightPickup = startHour >= 20 || startHour < 6; // 8 PM to 6 AM

    let extraCharges = 0;
    // Flat fee for pickup
    if (pickupLocation && pickupLocation.address) {
      extraCharges += 50;
    }
    // night time pickup charge
    if (isNightPickup) {
      extraCharges += 100;
    }

    let discount = 0;

    // discount based on surge amount
    if (surgeAmount > 0) {
      discount = Math.min(surgeAmount * 0.1, 300); // max 10% of surge or 300 flat
    }

    // tax calculation (e.g. 18% GST)
    const tax = Math.round(totalPrice * 0.18);
    // final price given by the customer
    const finalPrice = Math.round(totalPrice + extraCharges + tax - discount);

    const booking = await Booking.create({
      user: req.user.id,
      vehicle: vehicleId,
      startDate,
      endDate,
      bookingType,
      pricePaidByCustomer: finalPrice,

      priceBreakdown: {
        basePrice,
        surgeAmount,
        extraCharges,
        tax,
        discount,
        finalPrice,
      },

      customerDetails: {
        name: user.name,
        email: user.email,
        phone: user.phone,
      },

      vehicleSnapshot: {
        name: vehicle.name,
        brand: vehicle.brand,
        pricePerDay: vehicle.pricePerDay,
        pricePerHour: vehicle.pricePerHour,
        image: vehicle.images.length > 0 ? vehicle.images[0] : null,
      },

      pickupLocation,
      dropLocation,
      status: "pending",
    });

    res.status(201).json({
      message: "Booking created successfully",
      booking,
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
    booking.approvedAt = new Date();
    booking.approvedBy = req.user.id;

    await booking.save();

    res.json({
      message: "Booking approved",
      booking,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Cancel Booking (User or Admin or superAdmin)
export const cancelBooking = async (req, res) => {
  try {
    const { cancelReason } = req.body;
    const booking = await Booking.findById(req.params.id).populate(
      "vehicle",
      "createdBy",
    ); // get vehicle's createdBy for admin check

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // 👇 permission check
    const isUser = booking.user.toString() === req.user.id;
    const isAuthorizedAdmin = booking.approvedBy?.toString() === req.user.id;
    const isVehicleOwnerAdmin =
      !booking.approvedBy &&
      booking.vehicle?.createdBy?.toString() === req.user.id;
    const isSuperAdmin = req.user.role === "superadmin";

    const canCancel =
      isUser || isAuthorizedAdmin || isVehicleOwnerAdmin || isSuperAdmin;

    if (!canCancel) {
      return res.status(403).json({ message: "Not allowed to cancel" });
    }

    // optional: prevent re-cancel
    if (booking.status === "cancelled") {
      return res.status(400).json({ message: "Already cancelled" });
    }

    booking.status = "cancelled";
    booking.cancelledAt = new Date();
    booking.cancelReason = cancelReason || "No reason provided";
    await booking.save();

    res.json({
      message: "Booking cancelled",
      booking,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get User's Bookings (User only)
export const getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id }) // give all documents of booking schema which have user id same as req.user.id
      .populate("vehicle") // convert vehicle id to vehicle document and give all elements of vehicle schema
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 }); // sort by createdAt in descending order (latest first)

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Vehicle's Bookings (admin only)
export const getVehicleBookings = async (req, res) => {
  try {
    const vehicles = await Vehicle.find({ createdBy: req.user.id });

    if (vehicles.length === 0) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    // extract vehicle ids from the array of vehicles
    const vehicleIds = vehicles.map((v) => v._id);
    // find bookings for those vehicle ids
    const bookings = await Booking.find({ vehicle: { $in: vehicleIds } })
      .populate("user", "-password") // convert user id to user document and give all elements of user schema except password
      .populate("vehicle") // convert vehicle id to vehicle document and give all elements of vehicle schema
      .sort({ createdAt: -1 }); // sort by createdAt in descending order (latest first)

    if (bookings.length === 0) {
      return res
        .status(404)
        .json({ message: "No bookings found for this vehicle" });
    }

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Booking by ID (for user, admin, superadmin) - with role checks)
export const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("user", "-password")
      .populate("vehicle");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // 👇 role checks
    const isOwner = booking.user._id.toString() === req.user.id;
    const isAdmin = req.user.role === "admin";
    const isSuperAdmin = req.user.role === "superadmin";

    // admin owns vehicle?
    const isVehicleOwner =
      isAdmin && booking.vehicle.createdBy.toString() === req.user.id;

    if (!isOwner && !isVehicleOwner && !isSuperAdmin) {
      return res.status(403).json({ message: "Not allowed" });
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

    booking.isDeleted = true;

    res.json({ message: "Booking deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

