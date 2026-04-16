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
      comment
    });

    // get only visible reviews
    const reviews = await Review.find({
      vehicle: req.params.carId,
      isHidden: false
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
      rating: avgRating
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Reviews for a vehicle (Public) and show in ui
export const getVehicleReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ // give all elements of review schema which have vehicle id and isHidden false
      vehicle: req.params.vehicleId,
      isHidden: false
    })
      .populate("user", "name profileImage") // only show user name and profile image
      .sort({ createdAt: -1 }); // latest first

    res.json(reviews);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Hide Review (Admin Only)
export const hideReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    review.isHidden = true;
    await review.save();

    // give all documents of review schema which have same vehicle id and isHidden false
    const reviews = await Review.find({
      vehicle: review.vehicle,
      isHidden: false
    });

    // get only one document of vehicle schema which have same id as review.vehicle
    const vehicle = await Vehicle.findById(review.vehicle);

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

