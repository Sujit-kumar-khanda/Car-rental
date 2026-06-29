import whiteLogo from "../../logo/whiteLogo.png";
export default function Footer() {
  return (
    <footer className="bg-black text-white border-t border-white/10">
      <div className="max-w-7xl mx-auto px-6 py-24">

        {/* Logo */}
        <div className="flex justify-center">
          <img
            src={whiteLogo}
            alt="RentX"
            className="h-15 object-contain"
          />
        </div>

        {/* Tagline */}
        <p className="text-center mt-6 text-zinc-400 uppercase tracking-[6px] text-sm">
          Premium Car & Bike Rentals
        </p>

        {/* Navigation */}
        <div className="flex flex-wrap justify-center gap-10 mt-14 uppercase tracking-[3px] text-sm">
          <a href="#" className="hover:text-zinc-400 transition">
            Home
          </a>

          <a href="#" className="hover:text-zinc-400 transition">
            Fleet
          </a>

          <a href="#" className="hover:text-zinc-400 transition">
            Bikes
          </a>

          <a href="#" className="hover:text-zinc-400 transition">
            Cars
          </a>

          <a href="#" className="hover:text-zinc-400 transition">
            About
          </a>

          <a href="#" className="hover:text-zinc-400 transition">
            Contact
          </a>
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-white/10 my-16" />

        {/* Bottom */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">

          <p className="text-zinc-500 text-sm">
            © 2026 RENTX. All rights reserved.
          </p>

          <div className="flex gap-8 text-sm text-zinc-500">
            <a href="#" className="hover:text-white transition">
              Privacy Policy
            </a>

            <a href="#" className="hover:text-white transition">
              Terms & Conditions
            </a>
          </div>

        </div>

      </div>
    </footer>
  );
}