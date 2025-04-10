// src/pages/ResetPassword.tsx
import React, { useState, useEffect } from "react";
import { z } from "zod";
import axios from "axios";
import { Link, useParams, useNavigate } from "react-router-dom";

const resetPasswordSchema = z
  .object({
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z
      .string()
      .min(6, "Password must be at least 6 characters"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isTokenValid, setIsTokenValid] = useState(false);
  const [isTokenChecking, setIsTokenChecking] = useState(true);

  // Verify token validity when component mounts
  useEffect(() => {
    const verifyToken = async () => {
      try {
        const apiUrl = "https://api-auth.faishion.ai";
        await axios.get(`${apiUrl}/api/auth/reset-password/verify/${token}`);
        setIsTokenValid(true);
      } catch {
        setIsTokenValid(false);
        setError("This password reset link is invalid or has expired.");
      } finally {
        setIsTokenChecking(false);
      }
    };

    verifyToken();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      // Validate passwords
      resetPasswordSchema.parse({ password, confirmPassword });

      const apiUrl = "https://api-auth.faishion.ai";
      await axios.post(`${apiUrl}/api/auth/reset-password/${token}`, {
        password,
      });

      setSuccess("Your password has been successfully reset.");

      // Redirect to sign in page after a short delay
      setTimeout(() => {
        navigate("/signin");
      }, 3000);
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.errors[0].message);
      } else if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.message ||
            "Failed to reset password. Please try again."
        );
      } else {
        setError("An error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isTokenChecking) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Verifying reset link...</p>
      </div>
    );
  }

  if (!isTokenValid) {
    return (
      <div className="flex flex-col justify-center items-center h-screen">
        <div className="text-red-500 mb-4">{error}</div>
        <Link
          to="/forgot-password"
          className="text-[14px] font-bold text-[#2F2F2F]"
        >
          Request a new password reset link
        </Link>
      </div>
    );
  }

  return (
    <main>
      <div className="flex justify-center items-center h-screen">
        <div className="w-full max-w-md p-8">
          <Link to="/" className="mb-8 flex items-center">
            <div className="w-9 h-9 rounded-full bg-blue-200 flex items-center justify-center"></div>
            <span className="ml-3 font-bold text-xl text-gray-800">
              fAIshion.AI
            </span>
          </Link>

          <div className="mb-8">
            <h1 className="font-semibold text-3xl text-[#2F2F2F]">
              Set new password
            </h1>
            <p className="font-normal text-[15.4px] text-[#A6A6A6] mt-2">
              Create a new password for your account.
            </p>
          </div>

          {error && (
            <div className="text-red-500 text-[15.4px] mb-4">{error}</div>
          )}

          {success && (
            <div className="text-green-500 text-[15.4px] mb-4">{success}</div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="New Password"
                className="w-full h-[50px] border border-[#DADCE0] rounded-[10px] px-5 text-[17.6px]"
              />
            </div>

            <div className="mb-6">
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm New Password"
                className="w-full h-[50px] border border-[#DADCE0] rounded-[10px] px-5 text-[17.6px]"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-[45px] bg-[#2F2F2F] rounded-[10px] text-white font-bold text-base flex items-center justify-center"
            >
              {isLoading ? "Setting password..." : "RESET PASSWORD"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
};

export default ResetPassword;
