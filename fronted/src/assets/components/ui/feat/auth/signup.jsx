import { User, Mail, Lock, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function SignupPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (formData.password !== formData.confirmPassword) {
      return setError("Passwords do not match");
    }

    try {
      setLoading(true);

      const response = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.fullName,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      alert("Account created successfully!");

      navigate("/login");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <section className="min-h-screen grid lg:grid-cols-2">
      {/* Left Side */}
      <div className="relative hidden lg:block">
        <img
          src="https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=1600"
          alt="Luxury Car"
          className="absolute inset-0 h-full w-full object-cover"
        />

        {/* Premium Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/10" />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between h-full p-16 text-white">
          {/* Top */}
          <div>
            <p className="uppercase tracking-[10px] text-xs text-gray-300">
              Premium Rentals
            </p>
          </div>

          {/* Bottom */}
          <div>
            <h1 className="text-7xl xl:text-8xl font-extralight leading-none">
              DRIVE
              <br />
              WITHOUT
              <br />
              <span className="font-semibold">LIMITS</span>
            </h1>

            <div className="w-20 h-[1px] bg-white/50 my-8"></div>

            <p className="max-w-md text-gray-300 text-lg leading-relaxed">
              Experience the world's most iconic cars and superbikes, available
              on demand for every journey.
            </p>
          </div>
        </div>
      </div>

      {/* Right Side */}
      <div className="bg-[#F7F1EA] flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <Link
            to="/"
            className="
             inline-flex
      items-center
      gap-2
      mb-8
      text-gray-600
      hover:text-black
      transition
    "
          >
            <ArrowLeft size={18} />
            Back to Home
          </Link>
          <div className="mb-10">
            <h2 className="text-5xl font-light text-black">Create Account</h2>

            <p className="mt-4 text-gray-500">
              Join our premium rental platform.
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="relative">
              <User
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="text"
                placeholder="Full Name"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className="
                  w-full
                  pl-12
                  py-4
                  rounded-2xl
                  border
                  border-black/10
                  bg-white
                  outline-none
                  focus:border-black
                "
              />
            </div>

            <div className="relative">
              <Mail
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="email"
                placeholder="Email Address"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="
                  w-full
                  pl-12
                  py-4
                  rounded-2xl
                  border
                  border-black/10
                  bg-white
                  outline-none
                  focus:border-black
                "
              />
            </div>

            <div className="relative">
              <Lock
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="password"
                placeholder="Password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="
                  w-full
                  pl-12
                  py-4
                  rounded-2xl
                  border
                  border-black/10
                  bg-white
                  outline-none
                  focus:border-black
                "
              />
            </div>

            <div className="relative">
              <Lock
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="password"
                placeholder="Confirm Password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="
                  w-full
                  pl-12
                  py-4
                  rounded-2xl
                  border
                  border-black/10
                  bg-white
                  outline-none
                  focus:border-black
                "
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-full bg-black text-white uppercase tracking-[4px] hover:bg-[#8B7355] transition disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Account"}
            </button>
          </form>

          <p className="mt-8 text-center text-gray-500">
            Already have an account?{" "}
            <a href="/login" className="text-black font-medium">
              Sign In
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
