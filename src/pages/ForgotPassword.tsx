import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "@/utils/axiosInstance";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [isSent, setIsSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email) {
      alert("Please enter your email");
      return;
    }

    try {
      setIsLoading(true);
      await axiosInstance.post("/auth/forgot-password", { email });
      setIsSent(true);
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to send reset link");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="w-screen h-screen p-10 flex items-center justify-center">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-6">Forgot Password</h2>

        {isSent ? (
          <div>
            <p className="mb-4 text-green-600">
              Reset link sent! Please check your email.
            </p>
            <button
              className="w-full btn-primary"
              onClick={() => navigate("/signin")}
            >
              Back to Sign In
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              type="email"
              placeholder="Your Email*"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border w-full p-2"
              required
            />
            <button
              type="submit"
              className="w-full btn-primary"
              disabled={isLoading}
            >
              {isLoading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
};

export default ForgotPassword;
