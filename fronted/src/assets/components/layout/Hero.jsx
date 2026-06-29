import { useEffect, useState } from "react";
import axios from "axios";
import porsche from "../../image/porsche.jpg";

export default function HeroSection() {
  const [vehicles, setVehicles] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchVehicles = async () => {
    try {
      const res = await axios.get("/api/vehicles");

      // Example:
      // [{ _id, name, brand, images, category }]
      setVehicles(res.data.data || []);
    } catch (error) {
      console.error("Failed to fetch vehicles:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  // Auto Slider
  useEffect(() => {
    if (vehicles.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % vehicles.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [vehicles]);

  // Loading State
  if (loading) {
    return (
      <section className="h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl tracking-widest animate-pulse">
          LOADING VEHICLES...
        </div>
      </section>
    );
  }

  // Empty State
  if (!vehicles.length) {
    return (
      <section className="relative h-screen overflow-hidden mt-15">
        {/* Porsche Background */}
        <img
          src={porsche}
          alt="Porsche"
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/60" />

        {/* Content */}
        <div className="absolute top-20 left-8 md:left-16 z-20">
          <p className="uppercase tracking-[8px] text-gray-300 text-sm">
            Premium Rentals
          </p>
        </div>

        <div className="absolute bottom-16 left-8 md:left-16 z-20">
          <h1 className="text-3xl md:text-5xl lg:text-7xl font-light text-white">
            DRIVE WITHOUT
            <span className="block font-semibold">LIMITS</span>
          </h1>

          <p className="mt-6 max-w-xl text-gray-300 text-lg">
            Explore luxury cars and superbikes crafted for unforgettable
            journeys.
          </p>

          <button
            className="mt-8 px-8 py-4 border border-white text-white
               uppercase tracking-widest
               hover:bg-white hover:text-black
               transition-all duration-300"
          >
            Explore More
          </button>
        </div>
      </section>
    );
  }

  const currentVehicle = vehicles[currentIndex];

  return (
    <section className="relative h-screen overflow-hidden">
      {/* Background Image */}
      <img
        src={currentVehicle?.images?.[0]}
        alt={currentVehicle?.name}
        className="absolute inset-0 h-full w-full object-cover transition-all duration-1000"
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/55" />

      {/* Content */}
      <div className="relative z-10 flex h-full flex-col items-center justify-center text-center px-6">
        <p className="uppercase tracking-[8px] text-gray-300 mb-4">
          {currentVehicle?.category || "Premium Vehicle"}
        </p>

        <h1 className="text-5xl md:text-7xl lg:text-8xl font-light text-white">
          {currentVehicle?.brand}
          <span className="block font-semibold">{currentVehicle?.name}</span>
        </h1>

        <p className="mt-6 text-gray-300 max-w-xl">
          Experience luxury, performance and comfort with our premium rental
          collection.
        </p>

        <div className="mt-10 flex gap-4">
          <button className="border border-white px-8 py-4 text-white uppercase tracking-widest hover:bg-white hover:text-black transition duration-300">
            Rent Now
          </button>

          <button className="bg-white text-black px-8 py-4 uppercase tracking-widest hover:scale-105 transition duration-300">
            View Details
          </button>
        </div>

        {/* Slider Indicators */}
        <div className="absolute bottom-10 flex gap-3">
          {vehicles.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                currentIndex === index ? "w-10 bg-white" : "w-2 bg-white/40"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
