import { Routes, Route } from "react-router-dom";
import { ReactLenis } from "lenis/react";

import "./App.css";

import { Outlet } from "react-router-dom";
import Navbar from "./assets/components/layout/Navbar";
import HeroSection from "./assets/components/layout/Hero";
import FeaturedVehicles from "./assets/components/ui/vehicles/featuredVehicles";
import FeaturedBikes from "./assets/components/ui/vehicles/featureBike";
import Footer from "./assets/components/layout/Footer";
import SignupPage from "./assets/components/ui/feat/auth/signup";
import SignInPage from "./assets/components/ui/feat/auth/login";
import ForgotPasswordPage from "./assets/components/ui/feat/auth/forgotPassword";
import AboutPage from "./assets/components/common/about";

function MainLayout() {
  return (
    <>
      <Navbar />
      <Outlet />
      <Footer />
    </>
  );
}

function HomePage() {
  return (
    <>
      <HeroSection />
      <FeaturedVehicles />
      <FeaturedBikes />
    </>
  );
}

function App() {
  return (
    <ReactLenis root>
      <Routes>

        {/* Pages with Navbar + Footer */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />

          {/* Future pages */}
          {/* <Route path="/vehicles" element={<VehiclesPage />} /> */}
          {/* <Route path="/contact" element={<ContactPage />} /> */}
          {/* <Route path="/list-vehicle" element={<ListVehiclePage />} /> */}
        </Route>

        {/* Auth Pages */}
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<SignInPage />} />
        <Route
          path="/forgot-password"
          element={<ForgotPasswordPage />}
        />

      </Routes>
    </ReactLenis>
  );
}

export default App;