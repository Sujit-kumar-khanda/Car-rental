import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Swiper, SwiperSlide } from "swiper/react";
import {
  EffectCoverflow,
  Pagination,
  Navigation,
  Autoplay,
} from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-coverflow";

export default function FeaturedBikes() {
  const bikes = [
    {
      id: 1,
      name: "Ducati Panigale V4",
      category: "Superbike",
      price: "₹4,500/day",
      engine: "998cc",
      power: "215 HP",
      feature: "ABS",
      image:
        "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=1200&q=80&auto=format",
    },
    {
      id: 2,
      name: "BMW S1000RR",
      category: "Sports Bike",
      price: "₹5,000/day",
      engine: "999cc",
      power: "210 HP",
      feature: "Quick Shifter",
      image:
        "https://images.unsplash.com/photo-1558980394-0c7c9299fe96?w=1200&q=80&auto=format",
    },
    {
      id: 3,
      name: "Kawasaki Ninja ZX10R",
      category: "Superbike",
      price: "₹4,200/day",
      engine: "998cc",
      power: "203 HP",
      feature: "Launch Control",
      image:
        "https://images.unsplash.com/photo-1609630875171-b1321377ee65?w=1200&q=80&auto=format",
    },
    {
      id: 4,
      name: "Yamaha R1",
      category: "Sports Bike",
      price: "₹4,000/day",
      engine: "998cc",
      power: "200 HP",
      feature: "Traction Control",
      image:
        "https://images.unsplash.com/photo-1611241443704-7d1e6f7fd6b8?w=1200&q=80&auto=format",
    },
    {
      id: 5,
      name: "Suzuki Hayabusa",
      category: "Hyperbike",
      price: "₹6,000/day",
      engine: "1340cc",
      power: "190 HP",
      feature: "Cruise Control",
      image:
        "https://images.unsplash.com/photo-1580310614729-ccd69652491d?w=1200&q=80&auto=format",
    },
  ];

  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <section className="bg-[#F7F1EA] py-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        {/* Heading */}
        <div className="text-center mb-16">
          <p className="uppercase tracking-[8px] text-[#8B7355]">
            Premium Collection
          </p>

          <h2 className="mt-4 text-5xl md:text-7xl font-light text-black">
            Featured Bikes
          </h2>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          {/* Carousel */}
          <Swiper
            effect="coverflow"
            centeredSlides
            loop
            grabCursor={false}
            speed={800}
            autoplay={{
              delay: 3500,
              disableOnInteraction: false,
            }}
            slidesPerView={1.8}
            spaceBetween={-80}
            breakpoints={{
              768: {
                slidesPerView: 2.5,
              },
              1024: {
                slidesPerView: 3,
              },
            }}
            coverflowEffect={{
              rotate: 0,
              stretch: 0,
              depth: 60,
              modifier: 1,
              slideShadows: false,
            }}
            pagination={{
              clickable: true,
            }}
            navigation={{
              nextEl: ".bike-next",
              prevEl: ".bike-prev",
            }}
            onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
            modules={[EffectCoverflow, Pagination, Navigation, Autoplay]}
            className="bike-slider"
          >
            {bikes.map((bike) => (
              <SwiperSlide key={bike.id} className="!h-[380px] md:!h-[420px]">
                <div
                  className="
      h-full
      overflow-hidden
      rounded-[24px]
      shadow-2xl
      bg-white
    "
                >
                  <img
                    src={bike.image}
                    alt={bike.name}
                    loading="lazy"
                    className="
        h-full
        w-full
        object-cover
      "
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Navigation */}
          <div className="mt-10 flex justify-center gap-5">
            <button className="bike-prev w-14 h-14 rounded-full border border-black/20 flex items-center justify-center hover:bg-black hover:text-white transition">
              <ChevronLeft size={22} />
            </button>

            <button className="bike-next w-14 h-14 rounded-full border border-black/20 flex items-center justify-center hover:bg-black hover:text-white transition">
              <ChevronRight size={22} />
            </button>
          </div>

          {/* Active Bike Details */}
          <motion.div
            key={bikes[activeIndex].id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mt-16 text-center"
          >
            <p className="uppercase tracking-[6px] text-[#8B7355]">
              {bikes[activeIndex].category}
            </p>

            <h3 className="mt-4 text-4xl md:text-6xl font-light text-black">
              {bikes[activeIndex].name}
            </h3>

            <p className="mt-5 text-2xl font-semibold text-black">
              {bikes[activeIndex].price}
            </p>

            <div className="mt-10 flex flex-wrap justify-center gap-10">
              <div>
                <p className="text-xs uppercase tracking-[3px] text-gray-500">
                  Engine
                </p>
                <p className="mt-1 text-lg font-medium">
                  {bikes[activeIndex].engine}
                </p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-[3px] text-gray-500">
                  Power
                </p>
                <p className="mt-1 text-lg font-medium">
                  {bikes[activeIndex].power}
                </p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-[3px] text-gray-500">
                  Feature
                </p>
                <p className="mt-1 text-lg font-medium">
                  {bikes[activeIndex].feature}
                </p>
              </div>
            </div>

            <button
              className="
                mt-10
                px-10
                py-4
                bg-black
                text-white
                rounded-full
                uppercase
                tracking-[3px]
                hover:bg-[#8B7355]
                transition-all
                duration-300
              "
            >
              Book Experience
            </button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
