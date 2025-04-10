import React, { useState, useEffect, useRef, useCallback } from "react";

// import google from "@/public/auth/google.svg";
// import linkedin from "@/public/auth/linkedin.svg";
// import twitter from "@/public/auth/twitter.svg";
import { z } from "zod";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { GoogleLogin } from "@react-oauth/google";
import { CredentialResponse } from "@react-oauth/google";
import { Link, useNavigate } from "react-router-dom";
import { sendMessageToExtension } from "@/utils/utils";
import backgroundImage from "@/assets/Background.png";
import image1 from "@/assets/image_1.jpg";
import image2 from "@/assets/image_2.jpg";
import image3 from "@/assets/image_3.jpg";

// Add this type declaration at the top of the file, after the imports
declare global {
  interface Window {
    chrome: typeof chrome;
  }
}

const signInSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const SignIn = () => {
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [activeSlide, setActiveSlide] = useState<number>(0);
  const images = [
    { left: image3, center: image1, right: image2 },
    { left: image1, center: image2, right: image3 },
    { left: image2, center: image3, right: image1 },
  ];
  const carouselRef = useRef<HTMLDivElement>(null);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  //Google remember me password
  const [rememberMe, setRememberMe] = useState(false);

  // // Inside your SignIn component, add this hook:
  // const login = useGoogleLogin({
  //   onSuccess: handleGoogleLoginSuccess,
  //   onError: handleError,
  // });

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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    const data = {
      email: formData.get("email"),
      password: formData.get("password"),
      rememberMe: rememberMe,
    };

    try {
      // Validate form data
      const validatedData = signInSchema.parse(data);
      const apiUrl = "https://api-auth.faishion.ai";

      // Call login API using axios
      const response = await axios.post(
        apiUrl + "/api/auth/login",
        validatedData
      );

      if (response.data) {
        const accessToken = response.data.accessToken;
        // Store token in localStorage
        localStorage.setItem("accessToken", accessToken);

        // Decode token and log the contents
        const decodedToken = jwtDecode(accessToken);
        console.log("Decoded token:", decodedToken);

        sendMessageToExtension({
          email: "",
          picture: "",
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

  const handleGoogleLoginSuccess = async (response: CredentialResponse) => {
    try {
      const token = response.credential;
      const apiUrl = "https://api-auth.faishion.ai";
      const res = await axios.post(apiUrl + "/api/auth/google-auth", {
        token,
        rememberMe: rememberMe,
      });

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
      {/* Left side page (for the form) */}

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
                  Welcome back
                </h1>
                <p className="font-normal text-[15.4px] text-[#A6A6A6] mt-2">
                  Choose one of the options to go.
                </p>
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
                    placeholder="Email"
                    className="w-[130%] h-[50px] border border-[#DADCE0] rounded-[10px] px-5 text-[17.6px]"
                  />
                </div>

                {/* Password input */}
                <div className="mb-4">
                  <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    className="w-[130%] h-[45px] border border-[#DADCE0] rounded-[10px] px-5"
                  />
                </div>

                {/* Remember me and Forgot password */}
                <div className="relative mb-6" style={{ width: "130%" }}>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="remember"
                      checked={rememberMe}
                      onChange={() => setRememberMe(!rememberMe)}
                      className="w-[14px] h-[14px] border-[0.5px] border-[#A6A6A6] rounded-[2px]"
                    />
                    <label
                      htmlFor="remember"
                      className="ml-2 text-[14px] font-medium text-[#A6A6A6]"
                    >
                      Remember me
                    </label>
                  </div>
                  {/* <a
                    href="#"
                    className="text-[14px] font-bold text-[#2F2F2F] underline absolute right-0 top-0"
                  >
                    Forgot your password?
                  </a> */}
                  <Link
                    to="/forgot-password"
                    className="text-[14px] font-bold text-[#2F2F2F] underline absolute right-0 top-0"
                  >
                    Forgot your password?
                  </Link>
                </div>

                {/* Login button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-[130%] h-[45px] bg-[#2F2F2F] rounded-[10px] text-white font-bold text-base flex items-center justify-center"
                >
                  {isLoading ? "Signing in..." : "LOGIN"}
                </button>
              </form>

              {/* Or divider */}
              <div className="flex items-center my-6" style={{ width: "130%" }}>
                <div className="flex-grow h-px bg-[#2E2E2E]"></div>
                <span className="mx-4 text-[17px] font-medium text-[#2E2E2E]">
                  or
                </span>
                <div className="flex-grow h-px bg-[#2E2E2E]"></div>
              </div>

              {/* Google login */}
              <div className="mb-6" style={{ width: "130%" }}>
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

              {/* Sign up link */}
              <div
                style={{
                  width: "130%",
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <p className="text-[14px] text-[#A6A6A6]">
                  Don't have an account?{" "}
                  <Link to="/signup" className="font-bold text-[#2F2F2F]">
                    Sign up
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

export default SignIn;
