

import { motion, useScroll, useTransform } from "framer-motion";
import ReactLenis from "lenis/react";
import { useRef } from "react";

const vehicles = [
  {
    id: 1,
    name: "Porsche 911",
    price: "₹12,000/day",
    image:
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70",
  },
  {
    id: 2,
    name: "Lamborghini Huracan",
    price: "₹18,000/day",
    image:
      "https://images.unsplash.com/photo-1544636331-e26879cd4d9b",
  },
  {
    id: 3,
    name: "Range Rover Sport",
    price: "₹10,000/day",
    image:
      "https://images.unsplash.com/photo-1494976388531-d1058494cdd8",
  },
  {
    id: 4,
    name: "Ducati Panigale",
    price: "₹8,000/day",
    image:
      "https://images.unsplash.com/photo-1558981806-ec527fa84c39",
  },
  {
    id: 5,
    name: "BMW S1000RR",
    price: "₹7,000/day",
    image:
      "https://images.unsplash.com/photo-1558980394-0c7c9299fe96",
  },
];

function VehicleCard({
  i,
  vehicle,
  progress,
  range,
  targetScale,
}) {
  const scale = useTransform(
    progress,
    range,
    [1, targetScale]
  );

  return (
    <div className="sticky top-0 flex items-center justify-center">
      <motion.div
        style={{
          scale,
          top: `calc(-5vh + ${i * 25 + 180}px)`,
        }}
        className="relative -top-1/4 h-[500px] w-[90%] max-w-5xl overflow-hidden rounded-3xl shadow-2xl"
      >
        {/* Image */}
        <img
          src={vehicle.image}
          alt={vehicle.name}
          className="h-full w-full object-cover"
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />

        {/* Content */}
        <div className="absolute bottom-0 left-0 p-8 text-white">
          <h2 className="text-3xl md:text-5xl font-light">
            {vehicle.name}
          </h2>

          <p className="mt-3 text-lg text-gray-300">
            {vehicle.price}
          </p>

          <button className="mt-6 border border-white px-6 py-3 uppercase tracking-wider hover:bg-white hover:text-black transition">
            Rent Now
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default function FeaturedVehicles() {
  const container = useRef(null);

  const { scrollYProgress } = useScroll({
    target: container,
    offset: ["start start", "end end"],
  });

  return (
    <ReactLenis root>
      <section
        ref={container}
        className="relative bg-black pb-[100vh] pt-[40vh]"
      >
        {/* Section Heading */}
        <div className="absolute left-1/2 top-24 -translate-x-1/2 text-center">
          <p className="uppercase tracking-[8px] text-gray-500">
            Featured Collection
          </p>

          <h2 className="mt-4 text-4xl md:text-6xl font-light text-white">
            Luxury Fleet
          </h2>
        </div>

        {vehicles.map((vehicle, i) => {
          const targetScale = Math.max(
            0.6,
            1 - (vehicles.length - i - 1) * 0.08
          );

          return (
            <VehicleCard
              key={vehicle.id}
              i={i}
              vehicle={vehicle}
              progress={scrollYProgress}
              range={[i * 0.25, 1]}
              targetScale={targetScale}
            />
          );
        })}
      </section>
    </ReactLenis>
  );
}