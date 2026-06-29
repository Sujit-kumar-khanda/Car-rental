
import { useState } from "react";
import { ArrowLeft, Mail } from "lucide-react";
import { Link } from "react-router-dom";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const response = await fetch(
        "http://localhost:5000/api/auth/forgot-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      setSuccess(
        "Password reset link has been sent to your email."
      );
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen bg-[#F5F5F7] flex items-center justify-center px-6">
      <div className="w-full max-w-md">

        <Link
          to="/signin"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-black transition"
        >
          <ArrowLeft size={18} />
          Back to Sign In
        </Link>

        <div className="mt-6 bg-white rounded-[32px] shadow-2xl p-8 md:p-10">

          <p className="uppercase tracking-[6px] text-xs text-gray-400">
            DriveEase
          </p>

          <h1 className="mt-4 text-4xl font-semibold text-black">
            Forgot Password?
          </h1>

          <p className="mt-3 text-gray-500 leading-relaxed">
            Enter your email address and we'll send you a link to reset your
            password.
          </p>

          {error && (
            <p className="mt-4 text-red-500 text-sm">
              {error}
            </p>
          )}

          {success && (
            <p className="mt-4 text-green-600 text-sm">
              {success}
            </p>
          )}

          <form
            onSubmit={handleSubmit}
            className="mt-8 space-y-5"
          >
            <div className="relative">
              <Mail
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="email"
                name="email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
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
                  outline-none
                  focus:border-black
                "
              />
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
                uppercase
                tracking-[2px]
                hover:bg-[#8B7355]
                transition
                disabled:opacity-50
              "
            >
              {loading
                ? "Sending..."
                : "Send Reset Link"}
            </button>
          </form>

          <p className="mt-8 text-center text-gray-500">
            Remember your password?{" "}
            <Link
              to="/signin"
              className="text-black font-medium hover:underline"
            >
              Sign In
            </Link>
          </p>

        </div>
      </div>
    </section>
  );
}

