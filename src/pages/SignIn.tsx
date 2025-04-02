import React, { useState } from "react";
import logo from "@/assets/logo.png";
// import google from "@/public/auth/google.svg";
// import linkedin from "@/public/auth/linkedin.svg";
// import twitter from "@/public/auth/twitter.svg";
import { z } from "zod";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { GoogleLogin } from '@react-oauth/google'
import { CredentialResponse } from '@react-oauth/google';
import { Link, useNavigate } from "react-router-dom";
import { sendMessageToExtension } from "@/utils/utils";

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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    const data = {
      email: formData.get("email"),
      password: formData.get("password"),
    };

    try {
      // Validate form data
      const validatedData = signInSchema.parse(data);
      const apiUrl = "https://api-auth.faishion.ai";

      // Call login API using axios
      const response = await axios.post(
        apiUrl + "/api/auth/login",
        validatedData,
      );

      if (response.data) {
        const accessToken = response.data.accessToken;
        // Store token in localStorage
        localStorage.setItem("accessToken", accessToken);
        
        // Decode token and log the contents
        const decodedToken = jwtDecode(accessToken);
        console.log('Decoded token:', decodedToken);

        sendMessageToExtension({
          email: '',
          picture: '',
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
      const res = await axios.post(
        apiUrl + "/api/auth/google-auth",
        { token },
      );

      if (res.data) {
        const accessToken = res.data.accessToken;
        // Store token in localStorage
        localStorage.setItem("accessToken", accessToken);
        
        
        sendMessageToExtension({
          email: '',
          picture: '',
          accessToken: accessToken,
        });

        navigate("/done");
      }
    } catch (error) {
      console.error('Google authentication failed:', error);
      setError("Google authentication failed. Please try again.");
    }
  };

  const handleError = () => {
    console.log('Google Sign-In was unsuccessful. Try again later.');
  };

  return (
    <main className="w-screen h-screen p-10 bg-[url('/bg-hero.svg')] bg-fixed bg-center font-poppins">
      <div className="flex items-center gap-2">
        <Link className="flex items-center gap-2" to={"https://www.faishion.ai/"}>
          <img className="w-[80px]" src={logo} alt="fAIshion" />
        </Link>
        <Link className="flex items-center gap-2" to={"https://www.faishion.ai/"}>
          <h1 className="text-2xl font-bold text-[#1C1D20]">fAIshion</h1>
        </Link>
      </div>
      <div className="w-full flex items-center justify-center">
        <div className="w-full text-center bg-white rounded-3xl p-10 flex flex-col justify-center items-center">
          <h2 className="font-bold text-2xl text-[#1C1D20]">Sign In</h2>
          <p className="text-sm text-[#5F6166] mt-2">
            The new user will be automatically registered
          </p>
          <div className="w-full md:max-w-[350px] flex justify-between items-center gap-2 mt-5">
          <GoogleLogin width={350} shape="circle"
                onSuccess={handleGoogleLoginSuccess}
                onError={handleError}
            />
            {/* <Image
              className="flex-1 cursor-pointer w-[30%]"
              src={google}
              alt=""
            />
            <Image
              className="flex-1 cursor-pointer w-[30%]"
              src={linkedin}
              alt=""
            />
            <Image
              className="flex-1 cursor-pointer w-[30%]"
              src={twitter}
              alt=""
            /> */}
          </div>
          <form
            onSubmit={handleSubmit}
            className="mt-10 w-full md:max-w-[350px] flex flex-col gap-2"
          >
            {error && <div className="text-red-500 text-sm mb-0">{error}</div>}
            <input
              type="text"
              name="email"
              className="border-[1px] border-[#eeeeee] rounded-sm w-full py-2 px-4 mt-2"
              placeholder="Email*"
            />
            <input
              type="password"
              name="password"
              className="border-[1px] border-[#eeeeee] rounded-sm w-full py-2 px-4 mt-2"
              placeholder="Password*"
            />
            <button type="submit" className="w-full block btn-primary mt-6" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign In"}
            </button>
            <div className="flex items-center justify-center mt-4">
              <p className="text-sm text-[#5F6166]">
                Don&apos;t have an account?{" "}
              </p>
              <Link className="text-[#27CA44] text-sm ml-1" to={"/signup"}>
                Sign Up
              </Link>
            </div>
          </form>
          <p className="max-w-[600px] text-[12px] text-[#5F6166] mt-4">
            By signing up, you agree to Final Round&apos;s Terms of Service and
            Privacy Policy. Your privacy is our top priority. Learn more about
            the steps we take to protect it.
          </p>
        </div>
      </div>
    </main>
  );
};

export default SignIn;
