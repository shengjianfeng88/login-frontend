import React, { useState } from "react";
import { z } from "zod";
import axios from "axios";
import { Link } from "react-router-dom";

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      // Validate email
      forgotPasswordSchema.parse({ email });

      const apiUrl = "https://api-auth.faishion.ai";
      await axios.post(apiUrl + "/api/auth/forgot-password", { email });

      setSuccess(
        "If an account exists with this email, you will receive password reset instructions."
      );
      setEmail(""); 
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.errors[0].message);
      } else {
        // Still show success even if there's an error to prevent email enumeration
        setSuccess(
          "If an account exists with this email, you will receive password reset instructions."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

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
              Reset your password
            </h1>
            <p className="font-normal text-[15.4px] text-[#A6A6A6] mt-2">
              Enter your email address and we'll send you instructions to reset
              your password.
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
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="w-full h-[50px] border border-[#DADCE0] rounded-[10px] px-5 text-[17.6px]"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-[45px] bg-[#2F2F2F] rounded-[10px] text-white font-bold text-base flex items-center justify-center"
            >
              {isLoading ? "Sending..." : "SEND RESET INSTRUCTIONS"}
            </button>
          </form>

          <div className="mt-4 text-center">
            <Link to="/signin" className="text-[14px] font-bold text-[#2F2F2F]">
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
};

export default ForgotPassword;
