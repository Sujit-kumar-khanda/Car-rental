import Review from "../models/Review.js";

import Vehicle from "../models/Vehicle.js";

// Add Review (User Only)
export const addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    const vehicle = await Vehicle.findById(req.params.vehicleId);

    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    // create review
    await Review.create({
      user: req.user.id,
      vehicle: req.params.carId,
      rating,
      comment,
    });

    // get only visible reviews
    const reviews = await Review.find({
      vehicle: req.params.carId,
      isHidden: false,
    });

    const totalReviews = reviews.length;

    const avgRating =
      totalReviews === 0
        ? 0
        : reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews;

    vehicle.totalReviews = totalReviews;
    vehicle.rating = avgRating;

    await vehicle.save();

    res.status(201).json({
      message: "Review added successfully",
      totalReviews,
      rating: avgRating,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Reviews for a vehicle (Public) and show in ui
export const getVehicleReviews = async (req, res) => {
  try {
    const { page = 1, limit = 5 } = req.query; // default page 1, limit 5 reviews per page

    const vehicleId = req.params.vehicleId;

    // convert to numbers
    const pageNumber = parseInt(page); // default 1
    const limitNumber = parseInt(limit); // default 5

    // calculate how many documents to skip for pagination
    const skip = (pageNumber - 1) * limitNumber; //

    // total count (for frontend pagination)
    const totalReviews = await Review.countDocuments({
      // count only reviews which are not hidden and given by users
      vehicle: vehicleId,
      isHidden: false,
    });

    // fetch paginated reviews
    const reviews = await Review.find({
      vehicle: vehicleId,
      isHidden: false,
    })
      .populate("user", "name profileImage")
      .populate("vehicle", "brand model")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNumber); // limit the number of reviews to return

    res.json({
      totalReviews,
      currentPage: pageNumber,
      totalPages: Math.ceil(totalReviews / limitNumber),
      reviews,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Hide Review (Admin Only)
export const hideReview = async (req, res) => {
  try {
    if (req.user.role !== "admin" && req.user.role !== "superadmin") {
      return res.status(403).json({ message: "Access denied" });
    }
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    if (review.isHidden) {
      return res.status(400).json({ message: "Review already hidden" });
    }
     const vehicle = await Vehicle.findById(review.vehicle);

    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }
    if (req.user.role === "admin") {
      if (vehicle.createdBy.toString() !== req.user.id) {
        return res.status(403).json({ message: "Not allowed" });
      }
    }

    review.isHidden = true;
    await review.save();

    // give all documents of review schema which have same vehicle id and isHidden false
    const reviews = await Review.find({
      vehicle: review.vehicle,
      isHidden: false,
    });

    // total number of reviews which are not hidden and given by users

    const totalReviews = reviews.length;
    const avgRating =
      totalReviews === 0
        ? 0
        : reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews;

    vehicle.totalReviews = totalReviews;
    vehicle.rating = avgRating;

    await vehicle.save();

    res.json({ message: "Review hidden successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Unhide Review (Admin Only)
export const unHideReview = async (req, res) => {
  try {
    if (req.user.role !== "admin" && req.user.role !== "superadmin") {
      return res.status(403).json({ message: "Access denied" });
    }
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    if (!review.isHidden) {
      return res.status(400).json({ message: "Review is not hidden" });
    }

    const vehicle = await Vehicle.findById(review.vehicle);

    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    if (req.user.role === "admin") {
      if (vehicle.createdBy.toString() !== req.user.id) {
        return res.status(403).json({ message: "Not allowed" });
      }
    }
    review.isHidden = false;
    await review.save();

    // give all documents of review schema which have same vehicle id and isHidden false
    const reviews = await Review.find({
      vehicle: review.vehicle,
      isHidden: false,
    });

    // total number of reviews which are not hidden and given by users

    const totalReviews = reviews.length;
    const avgRating =
      totalReviews === 0
        ? 0
        : reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews;

    vehicle.totalReviews = totalReviews;
    vehicle.rating = avgRating;

    await vehicle.save();

    res.json({ message: "Review unhidden successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Hidden Reviews for a vehicle (Admin and superadmin only)
export const getHiddenVehicleReviews = async (req, res) => {
  try {
    const { page = 1, limit = 5 } = req.query;
    const vehicleId = req.params.vehicleId;

    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = (pageNumber - 1) * limitNumber;

    // 🔐 optional: admin check
    if (req.user.role !== "admin" && req.user.role !== "superadmin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const filter = {
      vehicle: vehicleId,
      isHidden: true,
    };

    const totalReviews = await Review.countDocuments(filter);

    const reviews = await Review.find(filter)
      .populate("user", "name profileImage")
      .populate("vehicle", "brand model")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNumber);

    res.json({
      totalReviews,
      currentPage: pageNumber,
      totalPages: Math.ceil(totalReviews / limitNumber),
      reviews,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Personal Reviews (User Only)
export const getPersonalReviews = async (req, res) => {
  try {
    const { page = 1, limit = 5 } = req.query;
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = (pageNumber - 1) * limitNumber;

    const totalReviews = await Review.countDocuments({
      user: req.user.id,
      isHidden: false,
    });

    const reviews = await Review.find({ user: req.user.id, isHidden: false })
      .populate("vehicle", "brand model")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNumber);
    res.json({
      totalReviews,
      currentPage: pageNumber,
      totalPages: Math.ceil(totalReviews / limitNumber),
      reviews,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get personalVehicle Reviews (Admin Only)
export const getPersonalVehicleReviews = async (req, res) => {
  try {
    const { page = 1, limit = 5 } = req.query;
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = (pageNumber - 1) * limitNumber;
    if (req.user.role !== "admin" && req.user.role !== "superadmin") {
      return res.status(403).json({ message: "Access denied" });
    }
    // get admin vehicles
    const vehicles = await Vehicle.find({ createdBy: req.user.id });

    if (vehicles.length === 0) {
      return res.json({
        totalReviews: 0,
        currentPage: pageNumber,
        totalPages: 0,
        reviews: [],
      });
    }

    // extract ids
    const vehicleIds = vehicles.map((v) => v._id);

    // count
    const totalReviews = await Review.countDocuments({
      vehicle: { $in: vehicleIds },
    });

    // fetch reviews
    const reviews = await Review.find({
      vehicle: { $in: vehicleIds },
    })
      .populate("vehicle", "brand model")
      .populate("user", "name profileImage email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNumber);

    res.json({
      totalReviews,
      currentPage: pageNumber,
      totalPages: Math.ceil(totalReviews / limitNumber),
      reviews,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
