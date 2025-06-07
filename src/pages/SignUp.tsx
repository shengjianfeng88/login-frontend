import React, { useState, useEffect, useRef, useCallback } from "react";
import axiosInstance from "@/utils/axiosInstance";
import { z } from "zod";
import { useGoogleLogin } from "@react-oauth/google";
import { CredentialResponse } from "@react-oauth/google";
import { useDispatch } from "react-redux";

import { Link, useNavigate } from "react-router-dom";
import { sendMessageToExtension } from "@/utils/utils";
import backgroundImage from "@/assets/Background.png";
import image1 from "@/assets/image_1.jpg";
import image2 from "@/assets/image_2.jpg";
import image3 from "@/assets/image_3.jpg";
import googleLogo from "@/assets/g-logo.png";

//This user schema does not include the confimPassword, I stick to the original userSchema
// const signUpSchema = z.object({
//   email: z.string().email("Please enter a valid email address"),
//   password: z.string().min(6, "Password must be at least 6 characters"),
// });

const userSchema = z
  .object({
    email: z.string().email("Invalid email format"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

const SignUp = () => {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });

  // Carousel state
  const [activeSlide, setActiveSlide] = useState<number>(0);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const carouselRef = useRef<HTMLDivElement>(null);
  const images = [
    { left: image3, center: image1, right: image2 },
    { left: image1, center: image2, right: image3 },
    { left: image2, center: image3, right: image1 },
  ];

  const changeSlide = useCallback(
    (index: number) => {
      if (!isTransitioning) {
        setIsTransitioning(true);
        setTimeout(() => {
          setActiveSlide(index);
          setTimeout(() => setIsTransitioning(false), 50);
        }, 200);
      }
    },
    [isTransitioning]
  );

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isPaused && !isTransitioning) {
        changeSlide((activeSlide + 1) % 3);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [activeSlide, isPaused, isTransitioning, changeSlide]);

  const validateForm = () => {
    try {
      userSchema.parse(formData);
      setErrors({ email: "", password: "", confirmPassword: "" });
      setError("");
      return true;
    } catch (err) {
      if (err instanceof z.ZodError) {
        const newErrors = { email: "", password: "", confirmPassword: "" };
        err.errors.forEach((e) => {
          const field = e.path[0] as keyof typeof newErrors;
          newErrors[field] = e.message;
        });
        setErrors(newErrors);
      }
      return false;
    }
  };


  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
  
    try {
      await axiosInstance.post("/auth/request-register", {
        email: formData.email,
        password: formData.password,
      });
      alert("Verification email sent! Check your inbox.");
    } catch (err) {
      setError("Registration failed");
    } finally {
      setIsLoading(false);
    }
  };
  

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleGoogleLoginSuccess = async (response: CredentialResponse) => {
    try {
      const token = response.credential;
      const res = await axiosInstance.post("/auth/google-auth", { token });
      
      localStorage.setItem("accessToken", res.data.accessToken);
      if (res.data.userId) {
        localStorage.setItem("userId", res.data.userId);
      }
      
      sendMessageToExtension({
        email: res.data.email,
        picture: res.data.picture,
        accessToken: res.data.accessToken,
        userId: res.data.userId
      });

      navigate("/done");
    } catch (error) {
      console.error("Google authentication failed:", error);
      setError("Google authentication failed. Please try again.");
    }
  };

  const handleError = () => {
    console.log("Google Sign-In was unsuccessful. Try again later.");
  };

  const login = useGoogleLogin({
    flow: "implicit",
    onSuccess: async (tokenResponse) => {
      const fakeCredentialResponse: CredentialResponse = {
        credential: tokenResponse.access_token,
        select_by: "auto",
        clientId: "",
      };
      await handleGoogleLoginSuccess(fakeCredentialResponse);
    },
    onError: handleError,
  });

  return (
    <main className="min-h-screen">
      <div className="flex flex-col h-screen md:flex-row">
        {/* Left side (for the form) */}
        <div className="w-full md:w-[40%] lg:w-[35%] overflow-auto relative">
          {/* Logo area */}
          <Link
            to="https://www.faishion.ai/"
            className="absolute flex items-center top-8 left-8"
          >
            <div className="flex items-center justify-center bg-blue-200 rounded-full w-9 h-9"></div>
            <span className="ml-3 text-xl font-bold text-gray-800">
              fAIshion.AI
            </span>
          </Link>

          <div className="flex flex-col justify-center w-full h-full p-4 pt-16 md:p-6 lg:p-8">
            {/* Form content */}
            <div className="w-full max-w-[90%] mx-auto">
              {/* Welcome text */}
              <div className="mb-5">
                <h1 className="font-semibold text-2xl md:text-3xl text-[#2F2F2F]">
                  Sign Up
                </h1>
                <div className="w-full">
                  <p className="font-normal text-xs text-[#A6A6A6] mt-1">
                    By signing up, you agree to Final Round's Terms of Service
                    and Privacy Policy. Your privacy is our top priority. Learn
                    more about the steps we take to protect it.
                  </p>
                </div>
              </div>

              {error && (
                <div className="w-full mb-3 text-xs text-red-500">{error}</div>
              )}

              <form onSubmit={handleSubmit} className="w-full">
                {/* Email input */}
                <div className="mb-3">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Email"
                    className="w-full h-10 border border-[#DADCE0] rounded-lg px-4 text-sm"
                    autoComplete="email"
                  />
                  {errors.email && (
                    <p className="mt-1 text-xs text-left text-red-500">
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Password input */}
                <div className="mb-3">
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Password"
                    className="w-full h-10 border border-[#DADCE0] rounded-lg px-4 text-sm"
                    autoComplete="new-password"
                  />
                  {errors.password && (
                    <p className="mt-1 text-xs text-left text-red-500">
                      {errors.password}
                    </p>
                  )}
                </div>

                {/* Confirm Password input */}
                <div className="mb-4">
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm Password"
                    className="w-full h-10 border border-[#DADCE0] rounded-lg px-4 text-sm"
                    autoComplete="new-password"
                  />
                  {errors.confirmPassword && (
                    <p className="mt-1 text-xs text-left text-red-500">
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>

                {/* Sign Up button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-10 bg-[#2F2F2F] rounded-lg text-white font-bold text-sm flex items-center justify-center"
                >
                  {isLoading ? "Signing up..." : "SIGN UP"}
                </button>
              </form>

              {/* Or divider */}
              <div className="flex items-center w-full my-4">
                <div className="flex-grow h-px bg-[#2E2E2E]"></div>
                <span className="mx-3 text-sm font-medium text-[#2E2E2E]">
                  or
                </span>
                <div className="flex-grow h-px bg-[#2E2E2E]"></div>
              </div>

              {/* Google button */}
              <div className="w-full mb-4">
                <button
                  onClick={() => login()}
                  className="w-full h-10 bg-white border border-[#DADCE0] rounded-lg text-sm font-medium flex items-center justify-center gap-2 text-[#2F2F2F] hover:bg-gray-100"
                >
                  <img src={googleLogo} alt="Google" className="w-5 h-5" />
                  <span>Sign up with Google</span>
                </button>
              </div>

              {/* Sign in link */}
              <div className="flex justify-center w-full">
                <p className="text-xs text-[#A6A6A6]">
                  Already have an account?{" "}
                  <Link to="/signin" className="font-bold text-[#2F2F2F]">
                    LOGIN
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right side (for the picture and other stuff) */}
        <div
          className="hidden md:block md:w-[60%] lg:w-[65%] relative"
          style={{
            backgroundImage: `url(${backgroundImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {/* Carousel container */}
          <div className="absolute top-[42%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-[90%] md:max-w-[95%] lg:max-w-[90%]">
            <div
              ref={carouselRef}
              className="flex items-center justify-center scale-[0.65] md:scale-[0.8] lg:scale-95"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              {/* Left blurred image */}
              <div className="relative z-0 -mr-2 xs:-mr-3 sm:-mr-4 md:-mr-12 lg:-mr-24">
                <div className="w-24 xs:w-28 sm:w-36 md:w-52 lg:w-72 h-44 xs:h-56 sm:h-64 md:h-80 lg:h-[28rem] rounded-3xl overflow-hidden opacity-60 blur-[3px]">
                  <img
                    src={images[activeSlide].left}
                    alt="Fashion model left"
                    className={`w-full h-full object-cover transition-opacity duration-200 ease-in-out ${
                      isTransitioning ? "opacity-60" : "opacity-100"
                    }`}
                  />
                </div>
              </div>

              {/* Center focused image */}
              <div className="relative z-10 transition-all duration-300 hover:scale-105">
                <div className="w-44 xs:w-52 sm:w-64 md:w-80 lg:w-[30rem] h-64 xs:h-72 sm:h-96 md:h-[28rem] lg:h-[36rem] rounded-3xl overflow-hidden shadow-2xl transition-all duration-300 hover:shadow-2xl">
                  <img
                    src={images[activeSlide].center}
                    className={`w-full h-full object-cover object-center transition-opacity duration-300 ease-in-out 
                    ${isTransitioning ? "opacity-70" : "opacity-100"}`}
                    alt="Fashion model center"
                  />
                </div>
              </div>

              {/* Right blurred image */}
              <div className="relative z-0 -ml-2 xs:-ml-3 sm:-ml-4 md:-ml-12 lg:-ml-24">
                <div className="w-24 xs:w-28 sm:w-36 md:w-52 lg:w-72 h-44 xs:h-56 sm:h-64 md:h-80 lg:h-[28rem] rounded-3xl overflow-hidden opacity-60 blur-[3px]">
                  <img
                    src={images[activeSlide].right}
                    alt="Fashion model right"
                    className={`w-full h-full object-cover transition-opacity duration-200 ease-in-out ${
                      isTransitioning ? "opacity-60" : "opacity-100"
                    }`}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Bottom text content - positioned at the very bottom */}
          <div className="absolute bottom-0 w-full px-4 text-left md:px-8 lg:px-16">
            <div className="ml-0 md:ml-4 lg:ml-8 pb-4 scale-[0.85] md:scale-90 lg:scale-100 origin-bottom-left">
              <h2 className="mb-1">
                <span className="block text-lg font-bold text-gray-800 sm:text-xl md:text-2xl lg:text-3xl">
                  Welcome to
                </span>
                <span className="block text-2xl font-bold text-gray-800 sm:text-3xl md:text-4xl lg:text-5xl">
                  fAIshion.AI
                </span>
              </h2>
              <p className="max-w-lg text-xs text-gray-600 sm:text-xs md:text-sm">
                Your AI shopping assistant for all apparel brands—try on
                virtually, find your perfect size, and grab the best deals!
              </p>
            </div>

            {/* Pagination dots */}
            <div className="flex justify-center pb-4 space-x-3 md:pb-6 md:space-x-4 lg:space-x-5">
              <button
                onClick={() => changeSlide(0)}
                className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full transition-colors duration-300 ${
                  activeSlide === 0 ? "bg-gray-800" : "bg-gray-400"
                }`}
                aria-label="Show slide 1"
              ></button>
              <button
                onClick={() => changeSlide(1)}
                className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full transition-colors duration-300 ${
                  activeSlide === 1 ? "bg-gray-800" : "bg-gray-400"
                }`}
                aria-label="Show slide 2"
              ></button>
              <button
                onClick={() => changeSlide(2)}
                className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full transition-colors duration-300 ${
                  activeSlide === 2 ? "bg-gray-800" : "bg-gray-400"
                }`}
                aria-label="Show slide 3"
              ></button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default SignUp;