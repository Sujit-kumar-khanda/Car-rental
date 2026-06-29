import Review from "./review.model.js";
import Vehicle from "../vehicles/vehicle.model.js";
import Booking from "../bookings/booking.model.js";

export const addReviewService = async (vehicleId, user, rating, comment) => {
  const vehicle = await Vehicle.findById(vehicleId).populate("owner", "_id");

  if (!vehicle) {
    throw new Error("Vehicle not found");
  }

  if (vehicle.owner._id.toString() === user._id) {
    throw new Error("You cannot review your own vehicle");
  }

  const existingReview = await Review.findOne({
    vehicle: vehicleId,
    user: user._id,
  });

  if (existingReview) {
    throw new Error("You have already reviewed this vehicle");
  }

  const booking = await Booking.findOne({
    vehicle: vehicleId,
    user: user._id,
    status: "completed",
    isDeleted: false,
  });

  if (!booking) {
    throw new Error("You can review only after completing a booking");
  }

  await Review.create({
    user: user._id,
    vehicle: vehicleId,
    rating,
    comment,
  });

  const stats = await Review.aggregate([
    // aggregate used for complex data processing and calculations on reviews collection , it return an array
    {
      $match: {
        // work same as find but used in aggregation pipeline to filter documents
        vehicle: vehicle._id,
        isHidden: false,
      },
    },
    {
      $group: {
        // combine all matched reviews into a single result
        _id: null,
        totalReviews: { $sum: 1 }, // for each review, add 1 to totalReviews
        avgRating: { $avg: "$rating" }, // calculate average of rating field across all reviews for this vehicle
      },
    },
  ]);

  vehicle.totalReviews = stats[0]?.totalReviews || 0;

  vehicle.rating = Number((stats[0]?.avgRating || 0).toFixed(1));

  await vehicle.save();

  return {
    totalReviews: vehicle.totalReviews,
    rating: vehicle.rating,
  };
};

export const getVehicleReviewsService = async (
  vehicleId,
  page = 1,
  limit = 5,
) => {
  const vehicle = await Vehicle.findById(vehicleId);

  if (!vehicle) {
    throw new Error("Vehicle not found");
  }

  const skip = (page - 1) * limit;

  const [totalReviews, reviews] = await Promise.all([
    Review.countDocuments({
      vehicle: vehicleId,
      isHidden: false,
    }),

    Review.find({
      vehicle: vehicleId,
      isHidden: false,
    })
      .populate("user", "name profileImage")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
  ]);

  return {
    reviews,
    pagination: {
      page,
      limit,
      totalReviews,
      totalPages: Math.ceil(totalReviews / limit),
    },
  };
};

// Hide Reviews
export const hideReviewService = async (reviewId, user) => {
  const review = await Review.findById(reviewId);

  if (!review) {
    throw new Error("Review not found");
  }

  if (review.isHidden) {
    throw new Error("Review already hidden");
  }

  const vehicle = await Vehicle.findById(review.vehicle);

  if (!vehicle) {
    throw new Error("Vehicle not found");
  }

  if (
    user.role === "admin" &&
    vehicle.createdBy.toString() !== user._id.toString()
  ) {
    throw new Error("Not allowed");
  }

  review.isHidden = true;
  await review.save();

  const stats = await Review.aggregate([
    {
      $match: {
        vehicle: vehicle._id,
        isHidden: false,
      },
    },
    {
      $group: {
        _id: null,
        totalReviews: { $sum: 1 },
        avgRating: { $avg: "$rating" },
      },
    },
  ]);

  vehicle.totalReviews = stats[0]?.totalReviews || 0;

  vehicle.rating = Number((stats[0]?.avgRating || 0).toFixed(1));

  await vehicle.save();

  return {
    totalReviews: vehicle.totalReviews,
    rating: vehicle.rating,
  };
};

export const unHideReviewService = async (reviewId, user) => {
  const review = await Review.findById(reviewId);

  if (!review) {
    throw new Error("Review not found");
  }

  if (!review.isHidden) {
    throw new Error("Review is not hidden");
  }

  const vehicle = await Vehicle.findById(review.vehicle);

  if (!vehicle) {
    throw new Error("Vehicle not found");
  }

  if (
    user.role === "admin" &&
    vehicle.createdBy.toString() !== user._id.toString()
  ) {
    throw new Error("Not allowed");
  }

  review.isHidden = false;
  await review.save();

  const stats = await Review.aggregate([
    {
      $match: {
        vehicle: vehicle._id,
        isHidden: false,
      },
    },
    {
      $group: {
        _id: null,
        totalReviews: { $sum: 1 },
        avgRating: { $avg: "$rating" },
      },
    },
  ]);

  vehicle.totalReviews = stats[0]?.totalReviews || 0;

  vehicle.rating = Number((stats[0]?.avgRating || 0).toFixed(1));

  await vehicle.save();

  return {
    totalReviews: vehicle.totalReviews,
    rating: vehicle.rating,
  };
};

// Get Hidden Reviews for a vehicle (Admin and superadmin only)
export const getHiddenVehicleReviewsService = async (
  vehicleId,
  page = 1,
  limit = 5,
) => {
  const vehicle = await Vehicle.findById(vehicleId);

  if (!vehicle) {
    throw new Error("Vehicle not found");
  }

  const skip = (page - 1) * limit;

  const filter = {
    vehicle: vehicleId,
    isHidden: true,
  };

  const [totalReviews, reviews] = await Promise.all([
    Review.countDocuments(filter),

    Review.find(filter)
      .populate("user", "name profileImage")
      .populate("vehicle", "brand model")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
  ]);

  return {
    reviews,
    pagination: {
      page,
      limit,
      totalReviews,
      totalPages: Math.ceil(totalReviews / limit),
    },
  };
};

// Get Personal Reviews (User Only)
export const getPersonalReviewsService = async (
  userId,
  page = 1,
  limit = 5,
) => {
  const skip = (page - 1) * limit;

  const filter = {
    user: userId,
    isHidden: false,
  };

  const [totalReviews, reviews] = await Promise.all([
    Review.countDocuments(filter),

    Review.find(filter)
      .populate("vehicle", "brand model")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
  ]);

  return {
    reviews,
    pagination: {
      page,
      limit,
      totalReviews,
      totalPages: Math.ceil(totalReviews / limit),
    },
  };
};

// Get Personal Vehicle Reviews (vendor Only)
export const getPersonalVehicleReviewsService = async (
  user,
  page = 1,
  limit = 5,
) => {
  const skip = (page - 1) * limit;

  let filter = {};

  if (user.role === "admin") {
    const vehicles = await Vehicle.find({
      createdBy: user._id,
    }).select("_id");

    const vehicleIds = vehicles.map((vehicle) => vehicle._id);

    if (!vehicleIds.length) {
      return {
        reviews: [],
        pagination: {
          page,
          limit,
          totalReviews: 0,
          totalPages: 0,
        },
      };
    }

    filter.vehicle = {
      $in: vehicleIds,
    };
  }

  const [totalReviews, reviews] = await Promise.all([
    Review.countDocuments(filter),

    Review.find(filter)
      .populate("vehicle", "brand model")
      .populate("user", "name profileImage email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
  ]);

  return {
    reviews,
    pagination: {
      page,
      limit,
      totalReviews,
      totalPages: Math.ceil(totalReviews / limit),
    },
  };
};
