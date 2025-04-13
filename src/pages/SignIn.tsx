// src/pages/SignIn.tsx
import React, { useState } from "react";
import logo from "@/assets/logo.png";
import { z } from "zod";
import axiosInstance from "@/utils/axiosInstance";
import { jwtDecode } from "jwt-decode";
import { GoogleLogin } from '@react-oauth/google';
import { CredentialResponse } from '@react-oauth/google';
import { Link, useNavigate } from "react-router-dom";
import { sendMessageToExtension } from "@/utils/utils";

const signInSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const SignIn = () => {
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();

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
      const validatedData = signInSchema.parse(data);
      const res = await axiosInstance.post("/auth/login", {
        ...validatedData,
        rememberMe,
      });
      localStorage.setItem("accessToken", res.data.accessToken);
      localStorage.setItem("userId", res.data.userId);
      sendMessageToExtension({
        email: '',
        picture: '',
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
        email: '',
        picture: '',
        accessToken: res.data.accessToken,
      });
      navigate("/done");
    } catch (error) {
      setError("Google authentication failed. Please try again.");
    }
  };

  return (
    <main className="w-screen h-screen p-10 bg-[url('/bg-hero.svg')] bg-fixed bg-center font-poppins">
      <div className="flex items-center gap-2">
        <Link to="https://www.faishion.ai/">
          <img className="w-[80px]" src={logo} alt="fAIshion" />
        </Link>
        <Link to="https://www.faishion.ai/">
          <h1 className="text-2xl font-bold text-[#1C1D20]">fAIshion</h1>
        </Link>
      </div>
      <div className="w-full flex items-center justify-center">
        <div className="w-full text-center bg-white rounded-3xl p-10 flex flex-col justify-center items-center">
          <h2 className="font-bold text-2xl text-[#1C1D20]">Sign In</h2>
          <p className="text-sm text-[#5F6166] mt-2">The new user will be automatically registered</p>
          <GoogleLogin onSuccess={handleGoogleLoginSuccess} onError={() => setError("Google Sign-In failed")}/>
          <form onSubmit={handleSubmit} className="mt-10 w-full md:max-w-[350px] flex flex-col gap-2">
            {error && <div className="text-red-500 text-sm mb-0">{error}</div>}
            <input name="email" placeholder="Email*" className="border-[1px] border-[#eeeeee] rounded-sm w-full py-2 px-4 mt-2" />
            <input name="password" type="password" placeholder="Password*" className="border-[1px] border-[#eeeeee] rounded-sm w-full py-2 px-4 mt-2" />
            <label className="flex gap-2 items-center mt-2">
              <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} /> Remember Me
            </label>
            <button type="submit" className="w-full btn-primary mt-6" disabled={isLoading}>{isLoading ? "Signing in..." : "Sign In"}</button>
            <div className="flex items-center justify-center mt-4">
              <p className="text-sm text-[#5F6166]">Don't have an account? </p>
              <Link className="text-[#27CA44] text-sm ml-1" to="/signup">Sign Up</Link>
            </div>
            <div className="flex items-center justify-center mt-2">
              <Link className="text-[#27CA44] text-sm" to="/forgot-password">Forgot Password?</Link>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
};

export default SignIn;
