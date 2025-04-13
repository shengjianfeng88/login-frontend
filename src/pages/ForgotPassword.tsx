import React, { useState } from "react";
import axiosInstance from "@/utils/axiosInstance";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await axiosInstance.post("/auth/forgot-password", { email });
      setMessage("Reset email sent successfully");
    } catch (error: any) {
      setMessage(error.response?.data?.message || "Failed to send reset email");
    }
  };

  return (
    <main className="w-screen h-screen p-10 flex items-center justify-center">
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-white p-8 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-6">Forgot Password</h2>
        {message && <div className="text-green-500 text-sm mb-2">{message}</div>}
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email*" className="border w-full p-2 mb-4" />
        <button type="submit" className="w-full btn-primary">Send Reset Link</button>
      </form>
    </main>
  );
};

export default ForgotPassword;