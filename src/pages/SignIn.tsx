import React, { useState, useEffect, useRef, useCallback } from "react";
// import google from "@/public/auth/google.svg";
// import linkedin from "@/public/auth/linkedin.svg";
// import twitter from "@/public/auth/twitter.svg";
// import axios from "axios";
// import { jwtDecode } from "jwt-decode";
import { boolean, z } from "zod";
import axiosInstance from "@/utils/axiosInstance";
import { validateEmail } from "@/utils/validation";
import { useGoogleLogin } from "@react-oauth/google";
import { CredentialResponse } from "@react-oauth/google";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { RootState } from "@/store/store";
import { resetAuth, setAuthMethod, setAuthState, setError, setFormData, setLoading } from "@/store/features/authSlice";
import { useSelector, useDispatch } from "react-redux";
import { sendMessageToExtension } from "@/utils/utils";
import { setUser } from "@/store/features/userSlice";
import backgroundImage from "@/assets/Background.png";
import image1 from "@/assets/image_1.jpg";
import image2 from "@/assets/image_2.jpg";
import image3 from "@/assets/image_3.jpg";
import googleLogo from "@/assets/g-logo.png";
import SigninTabs from "@/components/auth/SigninTabs";


const SignIn = () => {
  const { formData, authMode, authMethod, authState, error } = useSelector(
      (state: RootState) => state.auth
    );
  const location = useLocation();
  const [emailError, setEmailError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

    
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
  
  //reset auth state and code based login
  useEffect(() => {
   if (!location.state?.fromSignupRedirect) {
    dispatch(resetAuth());
    dispatch(setAuthMethod("code"));
  }
  }, [dispatch]);

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

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const email = e.target.value;

    if (email && !validateEmail(email)) {
      setEmailError("Please enter a valid email address");
    } else {
      setEmailError("");
    }
  };

  const saveUserInfo=(res:any) =>{
    
    localStorage.setItem("accessToken", res.data.accessToken);
    localStorage.setItem("refreshToken", res.data.refreshToken);
    localStorage.setItem("userId", res.data.userId);

    // Decode JWT to get user info including picture
    let userEmail = res.data.email || '';
    let userPicture = '';
    try {
      const decoded = JSON.parse(atob(res.data.accessToken.split('.')[1]));
      userEmail = decoded.email || res.data.email || '';
      userPicture = decoded.picture || '';
    } catch (error) {
      console.error('Failed to decode JWT:', error);
    }

    // Update Redux store with complete user information
    dispatch(setUser({
      email: userEmail,
      picture: userPicture
    }));

    sendMessageToExtension({
      email: res.data.email,
      picture: res.data.picture,
      accessToken: res.data.accessToken,
    });

  }
  
  const handleRequestCode = async (email: string) => {
  try {
    dispatch(setLoading(true));
    alert("Sending login req")
    console.log(authMethod)
    await axiosInstance.post("/auth/request-auth", { email });
    dispatch(setAuthState("sent"));
  } catch (err: any) {
    console.error("Error sending code:", err);
    dispatch(setError("Please try again later"))
  } finally {
    dispatch(setLoading(false));
  }
};

  const handleSubmitCode = async (email: string, code: string) => {
    try {
      setIsLoading(true);
      const res = await axiosInstance.post("/auth/verify-code", {
        email,
        code,
      });
      //save user information
      saveUserInfo(res);
      navigate("/done");
    } catch (err: any) {
      console.error("Verification failed:", err);
      dispatch(setError(err.response?.data?.message || "Invalid or expired code"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {

      dispatch(setLoading(true));
      dispatch(setError(null));
    try {
      let endpoint = "";
      const requestData: any = {
        email: formData.email,
      };
      let rememberMe = true
      if (authMethod === "password") {
        endpoint = "/auth/login";
        requestData.password = formData.password;
        requestData.rememberMe = rememberMe
      } else {
        endpoint = "/auth/request-auth";
      }
      const res = await axiosInstance.post(endpoint, requestData);

      saveUserInfo(res)

      navigate("/done");
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        dispatch(setError(err.errors[0].message));
      } else {
        dispatch(setError(err.response?.data?.message || "Login failed"));
      }
    } finally {
      dispatch(setLoading(false))
    }
  };

  const handleGoogleLoginSuccess = async (response: CredentialResponse) => {
    try {
      const token = response.credential;
      const res = await axiosInstance.post("/auth/google-auth", { token });
      localStorage.setItem("accessToken", res.data.accessToken);
      localStorage.setItem("refreshToken", res.data.refreshToken);

      // Decode JWT to get user info including picture
      let userEmail = res.data.email || '';
      let userPicture = '';
      try {
        const decoded = JSON.parse(atob(res.data.accessToken.split('.')[1]));
        userEmail = decoded.email || res.data.email || '';
        userPicture = decoded.picture || '';
      } catch (error) {
        console.error('Failed to decode JWT:', error);
      }

      // Update Redux store with complete user information
      dispatch(setUser({
        email: userEmail,
        picture: userPicture
      }));

      sendMessageToExtension({
        email: userEmail,
        picture: userPicture,
        accessToken: res.data.accessToken,
      });
      navigate("/done");
    } catch {
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
              <SigninTabs
                handleSubmit={handleSubmit}
                handleRequestCode={handleRequestCode}
                handleSubmitCode={handleSubmitCode}
                />

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
