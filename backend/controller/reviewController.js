import Review from "../models/reviewModel.js";
import Vehicle from "../models/vechileModel.js";

// ⭐ Common Helper Function
const updateVehicleReviewStats = async (vehicleId) => {
  // get only visible reviews
  const reviews = await Review.find({
    vehicle: vehicleId,
    isHidden: false,
  });

  const totalReviews = reviews.length;

  const avgRating =
    totalReviews === 0
      ? 0
      : reviews.reduce((sum, review) => sum + review.rating, 0) /
        totalReviews;

  const vehicle = await Vehicle.findById(vehicleId);

  if (vehicle) {
    vehicle.totalReviews = totalReviews;
    vehicle.rating = avgRating;

    await vehicle.save();
  }

  return {
    totalReviews,
    rating: avgRating,
  };
};

// Add Review (User Only)
export const addReview = async (req, res) => {
  try {
    const { rating, comment, booking } = req.body;
    const { vehicleId } = req.params;

    const vehicle = await Vehicle.findById(vehicleId);

    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        message: "Rating must be between 1 and 5",
      });
    }

    // create review
    await Review.create({
      user: req.user.id,
      vehicle: vehicleId,
      booking,
      rating,
      comment,
    });

    const stats = await updateVehicleReviewStats(vehicleId);

    res.status(201).json({
      message: "Review added successfully",
      totalReviews: stats.totalReviews,
      rating: stats.rating,
    });
  } catch (error) {
    // duplicate review error
    if (error.code === 11000) {
      return res.status(409).json({
        message: "You already reviewed this vehicle",
      });
    }

    res.status(500).json({ message: error.message });
  }
};

// Get Reviews for a vehicle (Public) and show in ui
export const getVehicleReviews = async (req, res) => {
  try {
    const { vehicleId } = req.params;

    const reviews = await Review.find({
      // give all elements of review schema which have vehicle id and isHidden false
      vehicle: vehicleId,
      isHidden: false,
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

    await updateVehicleReviewStats(review.vehicle);

    res.json({
      message: "Review hidden successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};