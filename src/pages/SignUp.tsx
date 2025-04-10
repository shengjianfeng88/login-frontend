import React, { useState, useEffect, useRef, useCallback } from "react";
// import google from "@/public/auth/google.svg";
// import linkedin from "@/public/auth/linkedin.svg";
// import twitter from "@/public/auth/twitter.svg";
import axios from "axios";
import { z } from "zod";
import { jwtDecode } from "jwt-decode";
import { GoogleLogin } from "@react-oauth/google";
import { CredentialResponse } from "@react-oauth/google";
import { useDispatch } from "react-redux";
import { setUser } from "@/store/features/userSlice";
import { Link, useNavigate } from "react-router-dom";
import { sendMessageToExtension } from "@/utils/utils";
import backgroundImage from "@/assets/Background.png";
import image1 from "@/assets/image_1.jpg";
import image2 from "@/assets/image_2.jpg";
import image3 from "@/assets/image_3.jpg";

const SignUp = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Carousel related states
  const [activeSlide, setActiveSlide] = useState<number>(0);
  const images = [
    { left: image3, center: image1, right: image2 },
    { left: image1, center: image2, right: image3 },
    { left: image2, center: image3, right: image1 },
  ];
  const carouselRef = useRef<HTMLDivElement>(null);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);

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

    const changeSlide = useCallback(
      (index: number) => {
        if (!isTransitioning) {
          setIsTransitioning(true);
          setTimeout(() => {
            setActiveSlide(index);
            setTimeout(() => {
              setIsTransitioning(false);
            }, 50);
          }, 200);
        }
      },
      [isTransitioning]
    );

  // Set up autoplay for carousel
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isTransitioning && !isPaused) {
        changeSlide((activeSlide + 1) % 3);
      }
    }, 3000);

    // Clean up the interval on component unmount
    return () => clearInterval(interval);
  }, [activeSlide, isTransitioning, isPaused, changeSlide]);

  const validateForm = () => {
    try {
      userSchema.parse(formData);
      setErrors({
        email: "",
        password: "",
        confirmPassword: "",
      });
      setError("");
      return true;
    } catch (err) {
      if (err instanceof z.ZodError) {
        const newErrors = {
          email: "",
          password: "",
          confirmPassword: "",
        };
        err.errors.forEach((error) => {
          const field = error.path[0] as keyof typeof newErrors;
          newErrors[field] = error.message;
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const apiUrl = "https://api-auth.faishion.ai";
      const response = await axios.post(apiUrl + "/api/auth/register", {
        email: formData.email,
        password: formData.password,
      });
      if (response.data) {
        localStorage.setItem("accessToken", response.data.accessToken);
        const accessToken = response.data.accessToken;
        localStorage.setItem("accessToken", accessToken);

        const decodedToken = jwtDecode(accessToken);
        const userData = decodedToken as {
          email: string;
          picture?: string;
        };

        dispatch(
          setUser({
            email: userData.email,
            picture: userData.picture || "",
          })
        );

        sendMessageToExtension({
          email: userData.email,
          picture: userData.picture || "",
          accessToken: accessToken,
        });

        navigate("/done");
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.errors[0].message);
      } else if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "Invalid email or password");
      } else {
        setError("An error occurred. Please try again.");
      }
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
      const apiUrl = "https://api-auth.faishion.ai";

      const res = await axios.post(apiUrl + "/api/auth/google-auth", { token });

      if (res.data) {
        const accessToken = res.data.accessToken;
        // Store token in localStorage
        localStorage.setItem("accessToken", accessToken);

        sendMessageToExtension({
          email: "",
          picture: "",
          accessToken: accessToken,
        });

        navigate("/done");
      }
    } catch (error) {
      console.error("Google authentication failed:", error);
      setError("Google authentication failed. Please try again.");
    }
  };

  const handleError = () => {
    console.log("Google Sign-In was unsuccessful. Try again later.");
  };

  return (
    <main>
      <div className="flex h-screen">
        {/* Left side (for the form) */}
        <div className="w-[45%]">
          <div className="p-10 flex flex-col h-full">
            {/* Logo area */}
            <Link
              to="https://www.faishion.ai/"
              className="mb-16 flex items-center"
            >
              <div className="w-9 h-9 rounded-full bg-blue-200 flex items-center justify-center"></div>
              <span className="ml-3 font-bold text-xl text-gray-800">
                fAIshion.AI
              </span>
            </Link>

            {/* Form content */}
            <div
              className="max-w-lg mx-auto mt-20"
              style={{ marginLeft: "25%" }}
            >
              {/* Welcome text */}
              <div className="mb-10">
                <h1 className="font-semibold text-[44px] text-[#2F2F2F]">
                  Sign Up
                </h1>
                <div className="max-w-[400px]">
                  <p className="font-normal text-[13px] text-[#A6A6A6] mt-2">
                    By signing up, you agree to Final Round's Terms of Service
                    and Privacy Policy. Your privacy is our top priority. Learn
                    more about the steps we take to protect it.
                  </p>
                </div>
              </div>

              {error && (
                <div className="text-red-500 text-[15.4px] mb-4">{error}</div>
              )}

              <form onSubmit={handleSubmit}>
                {/* Email input */}
                <div className="mb-4">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Email"
                    className="w-[400px] h-[50px] border border-[#DADCE0] rounded-[10px] px-5 text-[17.6px]"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-xs mt-1 text-left max-w-[400px]">
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Password input */}
                <div className="mb-4">
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Password"
                    className="w-[400px] h-[45px] border border-[#DADCE0] rounded-[10px] px-5"
                  />{" "}
                  {errors.password && (
                    <p className="text-red-500 text-xs mt-1 text-left max-w-[400px]">
                      {errors.password}
                    </p>
                  )}
                </div>

                {/* Confirm Password input */}
                <div className="mb-6">
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm Password"
                    className="w-[400px] h-[45px] border border-[#DADCE0] rounded-[10px] px-5"
                  />

                  {errors.confirmPassword && (
                    <p className="text-red-500 text-xs mt-1 text-left max-w-[400px]">
                      {errors.confirmPassword}
                    </p>
                  )}
                 
                </div>

                {/* Sign Up button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-[400px] h-[45px] bg-[#2F2F2F] rounded-[10px] text-white font-bold text-base flex items-center justify-center"
                >
                  {isLoading ? "Signing up..." : "SIGN UP"}
                </button>
              </form>

              {/* Or divider */}
              <div
                className="flex items-center my-6"
                style={{ width: "400px" }}
              >
                <div className="flex-grow h-px bg-[#2E2E2E]"></div>
                <span className="mx-4 text-[17px] font-medium text-[#2E2E2E]">
                  or
                </span>
                <div className="flex-grow h-px bg-[#2E2E2E]"></div>
              </div>

              {/* Google login */}
              <div className="mb-6" style={{ width: "400px" }}>
                <GoogleLogin
                  shape="circle"
                  onSuccess={handleGoogleLoginSuccess}
                  onError={handleError}
                  text="continue_with"
                  width="130%"
                  theme="outline"
                  logo_alignment="left"
                  type="standard"
                />
              </div>

              {/* Sign in link */}
              <div
                style={{
                  width: "400px",
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <p className="text-[14px] text-[#A6A6A6]">
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
          className="w-[55%] relative"
          style={{
            backgroundImage: `url(${backgroundImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {/* Carousel container */}
          <div className="absolute top-[40%] left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div
              ref={carouselRef}
              className="flex items-center"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              {/* Left blurred image */}
              <div className="relative -mr-16 z-0">
                <div className="w-[280px] h-[422px] rounded-3xl overflow-hidden opacity-70 blur-[2px]">
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
                <div className="w-96 h-[576px] rounded-3xl overflow-hidden shadow-xl transition-all duration-300 hover:shadow-2xl">
                  <img
                    src={images[activeSlide].center}
                    alt="Fashion model center"
                    className={`w-full h-full object-cover transition-opacity duration-300 ease-in-out 
      ${isTransitioning ? "opacity-70" : "opacity-100"}`}
                  />
                </div>
              </div>

              {/* Right blurred image */}
              <div className="relative -ml-16 z-0">
                <div className="w-[280px] h-[422px] rounded-3xl overflow-hidden opacity-70 blur-[2px]">
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

          {/* Bottom text content - Modified to align text left and shifted right */}
          <div className="absolute bottom-20 px-24 w-full text-left">
            <div className="ml-8">
              <h2 className="mb-1">
                <span className="text-4xl font-bold text-gray-800 block">
                  Welcome to
                </span>
                <span className="text-7xl font-bold text-gray-800 block">
                  fAIshion.AI
                </span>
              </h2>
              <p className="text-gray-600 max-w-lg">
                Your AI shopping assistant for all apparel brands—try on
                virtually, find your perfect size, and grab the best deals!
              </p>
            </div>

            {/* Pagination dots - keeping these centered */}
            <div className="flex justify-center mt-8 space-x-3">
              <button
                onClick={() => changeSlide(0)}
                className={`w-2.5 h-2.5 rounded-full transition-colors duration-300 ${
                  activeSlide === 0 ? "bg-gray-800" : "bg-gray-400"
                }`}
                aria-label="Show slide 1"
              ></button>
              <button
                onClick={() => changeSlide(1)}
                className={`w-2.5 h-2.5 rounded-full transition-colors duration-300 ${
                  activeSlide === 1 ? "bg-gray-800" : "bg-gray-400"
                }`}
                aria-label="Show slide 2"
              ></button>
              <button
                onClick={() => changeSlide(2)}
                className={`w-2.5 h-2.5 rounded-full transition-colors duration-300 ${
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
