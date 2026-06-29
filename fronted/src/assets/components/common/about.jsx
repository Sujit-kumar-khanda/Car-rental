import { Link } from "react-router-dom";

export default function AboutPage() {
  return (
    <main className="bg-[#F7F1EA] text-black">

      {/* Hero */}
      <section className="relative h-[80vh]">
        <img
          src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1600"
          alt="Luxury Vehicle"
          className="absolute inset-0 h-full w-full object-cover"
        />

        <div className="absolute inset-0 bg-black/50" />

        <div className="relative z-10 flex h-full items-end px-8 md:px-16 pb-20">
          <div>
            <p className="uppercase tracking-[8px] text-white/80">
              About DriveEase
            </p>

            <h1 className="mt-4 text-5xl md:text-7xl font-light text-white leading-none">
              DRIVING THE
              <br />
              FUTURE OF
              <br />
              <span className="font-semibold">
                VEHICLE SHARING
              </span>
            </h1>
          </div>
        </div>
      </section>

      {/* Intro */}
      <section className="max-w-7xl mx-auto px-6 py-28">
        <div className="grid lg:grid-cols-2 gap-16">

          <div>
            <p className="uppercase tracking-[6px] text-[#8B7355]">
              Who We Are
            </p>

            <h2 className="mt-4 text-5xl font-light">
              Built For Owners.
              <br />
              Designed For Renters.
            </h2>
          </div>

          <div>
            <p className="text-lg text-gray-700 leading-relaxed">
              DriveEase is a vehicle rental marketplace that connects
              vehicle owners with customers looking for convenient,
              reliable transportation.
            </p>

            <p className="mt-6 text-lg text-gray-700 leading-relaxed">
              We help owners earn from their unused vehicles while
              giving renters access to a wide range of cars and bikes
              through a seamless booking experience.
            </p>
          </div>

        </div>
      </section>

      {/* How It Works */}
      <section className="bg-black text-white py-28">
        <div className="max-w-7xl mx-auto px-6">

          <p className="uppercase tracking-[6px] text-gray-400 text-center">
            How DriveEase Works
          </p>

          <div className="grid md:grid-cols-2 gap-12 mt-16">

            <div className="border border-white/10 rounded-3xl p-10">
              <h3 className="text-3xl font-light">
                For Vehicle Owners
              </h3>

              <div className="mt-8 space-y-4 text-gray-300">
                <p>01. List your vehicle</p>
                <p>02. Accept bookings</p>
                <p>03. Earn money</p>
              </div>
            </div>

            <div className="border border-white/10 rounded-3xl p-10">
              <h3 className="text-3xl font-light">
                For Customers
              </h3>

              <div className="mt-8 space-y-4 text-gray-300">
                <p>01. Browse vehicles</p>
                <p>02. Book instantly</p>
                <p>03. Drive with confidence</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-6 py-28">

        <div className="text-center">
          <p className="uppercase tracking-[6px] text-[#8B7355]">
            Why Choose DriveEase
          </p>

          <h2 className="mt-4 text-5xl font-light">
            More Than Just Rentals
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mt-20">

          <div className="bg-white rounded-3xl p-8 shadow-lg">
            <h3 className="text-xl font-semibold">
              Earn More
            </h3>

            <p className="mt-4 text-gray-600">
              Turn idle vehicles into a source of income.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-lg">
            <h3 className="text-xl font-semibold">
              Verified Users
            </h3>

            <p className="mt-4 text-gray-600">
              Trusted owners and renters on one platform.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-lg">
            <h3 className="text-xl font-semibold">
              Easy Booking
            </h3>

            <p className="mt-4 text-gray-600">
              Fast, secure and hassle-free rentals.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-lg">
            <h3 className="text-xl font-semibold">
              Flexible Options
            </h3>

            <p className="mt-4 text-gray-600">
              Cars and bikes for every type of journey.
            </p>
          </div>

        </div>
      </section>

      {/* Stats */}
      <section className="bg-white py-24">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-4 gap-10 text-center">

          <div>
            <h3 className="text-5xl font-light">500+</h3>
            <p className="mt-2 text-gray-500">Vehicles</p>
          </div>

          <div>
            <h3 className="text-5xl font-light">20K+</h3>
            <p className="mt-2 text-gray-500">Bookings</p>
          </div>

          <div>
            <h3 className="text-5xl font-light">10K+</h3>
            <p className="mt-2 text-gray-500">Customers</p>
          </div>

          <div>
            <h3 className="text-5xl font-light">50+</h3>
            <p className="mt-2 text-gray-500">Cities</p>
          </div>

        </div>
      </section>

      {/* Vision */}
      <section className="max-w-6xl mx-auto px-6 py-28 text-center">

        <p className="uppercase tracking-[6px] text-[#8B7355]">
          Our Vision
        </p>

        <h2 className="mt-6 text-5xl md:text-6xl font-light leading-tight">
          Creating A Smarter
          <br />
          Mobility Ecosystem
        </h2>

        <p className="max-w-3xl mx-auto mt-8 text-lg text-gray-600">
          We envision a future where every vehicle can create value,
          helping owners earn while giving customers greater access
          to transportation whenever they need it.
        </p>

      </section>

      {/* CTA */}
      <section className="bg-black text-white py-28 text-center">

        <p className="uppercase tracking-[6px] text-gray-400">
          Start Today
        </p>

        <h2 className="mt-4 text-5xl md:text-6xl font-light">
          Ready To Start
          <br />
          Your Journey?
        </h2>

        <div className="mt-10 flex flex-wrap justify-center gap-4">

          <Link
            to="/list-vehicle"
            className="px-8 py-4 bg-white text-black rounded-full font-medium"
          >
            List Your Vehicle
          </Link>

          <Link
            to="/vehicles"
            className="px-8 py-4 border border-white rounded-full"
          >
            Explore Rentals
          </Link>

        </div>

      </section>

    </main>
  );
}