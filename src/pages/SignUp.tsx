import React from "react";
import logo from "@/assets/logo.png";
// import google from "@/public/auth/google.svg";
// import linkedin from "@/public/auth/linkedin.svg";
// import twitter from "@/public/auth/twitter.svg";
import axios from "axios";
import { useState } from "react";
import { z } from "zod";
import { jwtDecode } from "jwt-decode";
import { GoogleLogin } from '@react-oauth/google'
import { CredentialResponse } from '@react-oauth/google';
import { useDispatch } from 'react-redux';
import { setUser } from '@/store/features/userSlice';
import { Link, useNavigate } from "react-router-dom";
import { sendMessageToExtension } from "@/utils/utils";

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

  const userSchema = z.object({
    email: z.string().email("Invalid email format"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string()
  }).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

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
      const response = await axios.post(
        apiUrl + "/api/auth/register",
        {email: formData.email, password: formData.password}
      );
      if (response.data) {
        localStorage.setItem("accessToken", response.data.accessToken);
        const accessToken = response.data.accessToken;
        localStorage.setItem("accessToken", accessToken);
        
        const decodedToken = jwtDecode(accessToken);
        const userData = decodedToken as { 
          email: string; 
          picture?: string;
        };

        dispatch(setUser({
          email: userData.email,
          picture: userData.picture || '',
        }));

        sendMessageToExtension({
          email: userData.email,
          picture: userData.picture || '',
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
          <h2 className="font-bold text-2xl text-[#1C1D20]">Sign Up</h2>
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
          <div className="w-full md:max-w-[350px] mt-5 flex flex-col gap-2">
            <form onSubmit={handleSubmit}>
              {error && (
                <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
              )}
              <div className="">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="border-[1px] border-[#eeeeee] rounded-sm w-full py-2 px-4 mt-2"
                  placeholder="Email*"
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1 text-left">
                    {errors.email}
                  </p>
                )}
              </div>
              <div className="">
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="border-[1px] border-[#eeeeee] rounded-sm w-full py-2 px-4 mt-2"
                  placeholder="Password*"
                />
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1 text-left">
                    {errors.password}
                  </p>
                )}
              </div>
              <div className="">
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="border-[1px] border-[#eeeeee] rounded-sm w-full py-2 px-4 mt-2"
                  placeholder="Confirm Password*"
                />
                {errors.confirmPassword && (
                  <p className="text-red-500 text-xs mt-1 text-left">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary mt-6 w-full"
              >
                {isLoading ? "Signing up..." : "Sign Up"}
              </button>
            </form>
            <div className="flex items-center justify-center mt-4">
              <p className="text-sm text-[#5F6166]">
                Already have an account?{" "}
              </p>
              <Link className="text-[#27CA44] text-sm ml-1" to={"/signin"}>
                Sign In
              </Link>
            </div>
          </div>

          <p className="max-w-[600px] text-[12px] text-[#5F6166] mt-2">
            By signing up, you agree to Final Round&apos;s Terms of Service and
            Privacy Policy. Your privacy is our top priority. Learn more about
            the steps we take to protect it.
          </p>
        </div>
      </div>
    </main>
  );
};

export default SignUp;
