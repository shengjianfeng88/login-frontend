import React, { useState, useEffect, useRef, useCallback } from "react";

// import google from "@/public/auth/google.svg";
// import linkedin from "@/public/auth/linkedin.svg";
// import twitter from "@/public/auth/twitter.svg";
// import axios from "axios";
// import { jwtDecode } from "jwt-decode";
import { z } from "zod";
import axiosInstance from "@/utils/axiosInstance";
import { useGoogleLogin } from "@react-oauth/google";
import { CredentialResponse } from "@react-oauth/google";
import { Link, useNavigate } from "react-router-dom";
import { sendMessageToExtension } from "@/utils/utils";
import backgroundImage from "@/assets/Background.png";
import image1 from "@/assets/image_1.jpg";
import image2 from "@/assets/image_2.jpg";
import image3 from "@/assets/image_3.jpg";
import googleLogo from "@/assets/g-logo.png";

const signInSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const SignIn = () => {
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();

  //Image carrousel
  const [activeSlide, setActiveSlide] = useState<number>(0);
  const images = [
    { left: image3, center: image1, right: image2 },
    { left: image1, center: image2, right: image3 },
    { left: image2, center: image3, right: image1 },
  ];
  const carouselRef = useRef<HTMLDivElement>(null);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);

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
      const validatedData = signInSchema.parse(data);
      // <<<<<<< HEAD
      //       const apiUrl = "https://api-auth.faishion.ai";

      //       // Call login API using axios
      //       const response = await axios.post(
      //         apiUrl + "/api/auth/login",
      //         validatedData
      //       );

      //       if (response.data) {
      //         const accessToken = response.data.accessToken;
      //         // Store token in localStorage
      //         localStorage.setItem("accessToken", accessToken);

      //         // Decode token and log the contents
      //         const decodedToken = jwtDecode(accessToken);
      //         console.log("Decoded token:", decodedToken);

      //         sendMessageToExtension({
      //           email: "",
      //           picture: "",
      //           accessToken: accessToken,
      //         });

      //         navigate("/done");
      //       }
      //     } catch (err) {
      //       if (err instanceof z.ZodError) {
      //         setError(err.errors[0].message);
      //       } else if (axios.isAxiosError(err)) {
      //         setError(err.response?.data?.message || "Invalid email or password");
      //       } else {
      //         setError("An error occurred. Please try again.");
      // =======
      const res = await axiosInstance.post("/auth/login", {
        ...validatedData,
        rememberMe,
      });
      localStorage.setItem("accessToken", res.data.accessToken);
      localStorage.setItem("userId", res.data.userId);
      sendMessageToExtension({
        email: res.data.email,
        picture: res.data.picture,
        accessToken: res.data.accessToken,
      });
      navigate("/done");
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        setError(err.errors[0].message);
      } else {
        setError(err.response?.data?.message || "Login failed");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLoginSuccess = async (response: CredentialResponse) => {
    try {
      const token = response.credential;
      const res = await axiosInstance.post("/auth/google-auth", { token });
      localStorage.setItem("accessToken", res.data.accessToken);
      sendMessageToExtension({
        email: res.data.email,
        picture: res.data.picture,
        accessToken: res.data.accessToken,
      });
      navigate("/done");
    } catch (error) {
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
      {/* Left side page (for the form) */}

      <div className="flex flex-col md:flex-row h-screen">
        {/* Left side (for the form) */}
        <div className="w-full md:w-[40%] lg:w-[35%] overflow-auto relative">
          {/* Logo area */}
          <Link
            to="https://www.faishion.ai/"
            className="flex items-center absolute top-8 left-8"
          >
            <div className="w-9 h-9 rounded-full bg-blue-200 flex items-center justify-center"></div>
            <span className="ml-3 font-bold text-xl text-gray-800">
              fAIshion.AI
            </span>
          </Link>

          <div className="p-4 md:p-6 lg:p-8 flex flex-col w-full h-full justify-center pt-16">
            {/* Form content */}
            <div className="w-full max-w-[90%] mx-auto">
              {/* Welcome text */}
              <div className="mb-5">
                <h1 className="font-semibold text-2xl md:text-3xl text-[#2F2F2F]">
                  Welcome back
                </h1>
                <p className="font-normal text-xs text-[#A6A6A6] mt-1">
                  Choose one of the options to go.
                </p>
              </div>

              {error && (
                <div className="text-red-500 text-xs mb-3">{error}</div>
              )}

              <form onSubmit={handleSubmit} className="w-full">
                {/* Email input */}
                <div className="mb-3">
                  <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    className="w-full h-10 border border-[#DADCE0] rounded-lg px-4 text-sm"
                    autoComplete="email"
                  />
                </div>

                {/* Password input */}
                <div className="mb-3">
                  <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    className="w-full h-10 border border-[#DADCE0] rounded-lg px-4 text-sm"
                    autoComplete="current-password"
                  />
                </div>

                {/* Remember me and Forgot password */}
                <div className="relative mb-4 w-full">
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
                      className="ml-2 text-xs font-medium text-[#A6A6A6]"
                    >
                      Remember me
                    </label>
                  </div>
                  <Link
                    to="/forgot-password"
                    className="text-xs font-bold text-[#2F2F2F] underline absolute right-0 top-0"
                  >
                    Forgot your password?
                  </Link>
                </div>

                {/* Login button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-10 bg-[#2F2F2F] rounded-lg text-white font-bold text-sm flex items-center justify-center"
                >
                  {isLoading ? "Signing in..." : "LOGIN"}
                </button>
              </form>

              {/* Or divider */}
              <div className="flex items-center my-4 w-full">
                <div className="flex-grow h-px bg-[#2E2E2E]"></div>
                <span className="mx-3 text-sm font-medium text-[#2E2E2E]">
                  or
                </span>
                <div className="flex-grow h-px bg-[#2E2E2E]"></div>
              </div>

              {/* Google button */}
              <div className="mb-4 w-full">
                <button
                  onClick={() => login()}
                  className="w-full h-10 bg-white border border-[#DADCE0] rounded-lg text-sm font-medium flex items-center justify-center gap-2 text-[#2F2F2F] hover:bg-gray-100"
                >
                  <img src={googleLogo} alt="Google" className="w-5 h-5" />
                  <span>Continue with Google</span>
                </button>
              </div>

              {/* Sign up link */}
              <div className="w-full flex justify-center">
                <p className="text-xs text-[#A6A6A6]">
                  Don't have an account?{" "}
                  <Link to="/signup" className="font-bold text-[#2F2F2F]">
                    SIGN UP
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
              <div className="relative -mr-2 xs:-mr-3 sm:-mr-4 md:-mr-12 lg:-mr-24 z-0">
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
              <div className="relative -ml-2 xs:-ml-3 sm:-ml-4 md:-ml-12 lg:-ml-24 z-0">
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
          <div className="absolute bottom-0 px-4 md:px-8 lg:px-16 w-full text-left">
            <div className="ml-0 md:ml-4 lg:ml-8 pb-4 scale-[0.85] md:scale-90 lg:scale-100 origin-bottom-left">
              <h2 className="mb-1">
                <span className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-800 block">
                  Welcome to
                </span>
                <span className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 block">
                  fAIshion.AI
                </span>
              </h2>
              <p className="text-xs sm:text-xs md:text-sm text-gray-600 max-w-lg">
                Your AI shopping assistant for all apparel brands—try on
                virtually, find your perfect size, and grab the best deals!
              </p>
            </div>

            {/* Pagination dots */}
            <div className="flex justify-center pb-4 md:pb-6 space-x-3 md:space-x-4 lg:space-x-5">
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

export default SignIn;
