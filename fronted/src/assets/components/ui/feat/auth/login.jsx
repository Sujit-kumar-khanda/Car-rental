import { useState } from "react";
import { Mail, Lock, ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../../../../../context/AuthContext";

export default function SignInPage() {
  const navigate = useNavigate();
  const { dispatch } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
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

    try {
      setLoading(true);
      setError("");

      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      localStorage.setItem("token", data.token);

      localStorage.setItem("user", JSON.stringify(data.user));

      dispatch({
        type: "LOGIN",
        payload: data.user,
      });

      navigate("/");
    } catch (err) {
      setError(err.message || "Login Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen bg-[#F5F5F7] grid lg:grid-cols-2">
      {/* Left Side */}
      <div className="relative hidden lg:flex items-center justify-center overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=1600"
          alt="Luxury Car"
          className="absolute inset-0 h-full w-full object-cover"
        />

        <div className="absolute inset-0 bg-black/50" />

        <div className="relative z-10 p-16 text-white">
          <p className="uppercase tracking-[8px] text-sm">DriveEase</p>

          <h1 className="mt-6 text-7xl font-light leading-none">
            WELCOME
            <br />
            <span className="font-semibold">BACK</span>
          </h1>

          <p className="mt-6 max-w-md text-gray-300">
            Access your account and continue your journey.
          </p>
        </div>
      </div>

      {/* Right Side */}
      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white rounded-[32px] shadow-2xl p-8 md:p-10">
          {/* Back Button */}
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-gray-500 hover:text-black transition"
          >
            <ArrowLeft size={18} />
            Back
          </Link>

          {/* Heading */}
          <div className="mt-8">
            <h2 className="text-4xl font-semibold text-black">Sign In</h2>

            <p className="mt-2 text-gray-500">Welcome back to DriveEase.</p>
          </div>

          {error && <p className="mt-4 text-red-500 text-sm">{error}</p>}

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div className="relative">
              <Mail
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email Address"
                required
                className="
                  w-full
                  pl-12
                  py-4
                  rounded-2xl
                  bg-gray-50
                  border
                  border-gray-200
                  focus:border-black
                  outline-none
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
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
                required
                className="
                  w-full
                  pl-12
                  py-4
                  rounded-2xl
                  bg-gray-50
                  border
                  border-gray-200
                  focus:border-black
                  outline-none
                "
              />
            </div>

            <div className="flex justify-end">
              <Link
                to="/forgot-password"
                className="text-sm text-gray-500 hover:text-black"
              >
                Forgot Password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="
                w-full
                py-4
                rounded-2xl
                bg-black
                text-white
                font-medium
                hover:bg-[#8B7355]
                transition
                disabled:opacity-50
              "
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-8">
            <div className="h-px bg-gray-200 flex-1"></div>
            <span className="text-sm text-gray-400">OR</span>
            <div className="h-px bg-gray-200 flex-1"></div>
          </div>

          {/* Google Button */}
          <button
            className="
              w-full
              py-4
              rounded-2xl
              border
              border-gray-200
              hover:bg-gray-50
              transition
            "
          >
            Continue with Google
          </button>

          {/* Footer */}
          <p className="text-center text-gray-500 mt-8">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="text-black font-medium hover:underline"
            >
              Create Account
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
