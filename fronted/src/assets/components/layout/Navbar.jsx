import { Menu, X, User } from "lucide-react";
import { useState } from "react";
import blackLogo from "../../logo/blackLogo.png";
import whiteLogo from "../../logo/whiteLogo.png";
import { Link } from "react-router-dom";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Navbar */}
      <nav className="fixed top-0 left-0 w-full z-50 bg-white/50backdrop-blur-md ">
        <div className="h-20 flex items-center justify-center relative px-6">
          {/* Hamburger */}
          <button
            onClick={() => setOpen(true)}
            className="absolute left-6 text-black"
          >
            <Menu size={20} />
          </button>

          {/* Center Logo */}
          <img
            src={blackLogo}
            alt="Logo"
            className="h-18 w-auto object-contain"
          />
        </div>
      </nav>

      {/* Overlay */}
      <div
        onClick={() => setOpen(false)}
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          open ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
      />

      {/* Side Menu */}
      <aside
        className={`fixed top-0 left-0 h-screen w-[320px] bg-white text-black z-50 transform transition-transform duration-500 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <span className="uppercase tracking-[4px] text-sm">Menu</span>

          <button onClick={() => setOpen(false)}>
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <div className="flex flex-col mt-10">
          {["Vehicles", "Locations", "Services", "About", "Contact"].map(
            (item) => (
              <Link
                key={item}
                to={`/${item.toLowerCase()}`}
                className="px-8 py-5 text-lg tracking-wide border-b border-white/5 hover:bg-black/5 transition"
              >
                {item}
              </Link>
            ),
          )}
        </div>

        {/* Account Section */}
        <div className="absolute bottom-0 w-full p-6 border-t border-white/10">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-full bg-black/10 flex items-center justify-center">
              <User size={20} />
            </div>

            <div>
              <p className="font-medium">Guest User</p>
              <p className="text-sm text-gray-400">Sign in to continue</p>
            </div>
          </div>

          <Link
            to="/signup"
            className="
    flex
    items-center
    justify-center
    w-full
    py-4
    border
    border-black
    rounded-full
    uppercase
    tracking-[3px]
    text-sm
    font-medium
    text-black
    hover:bg-black
    hover:text-white
    transition-all
    duration-300
  "
          >
            Create Account
          </Link>
        </div>
      </aside>
    </>
  );
}
