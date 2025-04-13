
import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axiosInstance from "@/utils/axiosInstance";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [newPassword, setNewPassword] = useState("");
  const token = searchParams.get("token") || "";

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await axiosInstance.post("/auth/reset-password", { token, newPassword });
      alert("Password reset successfully");
      navigate("/signin");
    } catch (error: any) {
      alert(error.response?.data?.message || "Reset password failed");
    }
  };

  return (
    <main className="w-screen h-screen p-10 flex items-center justify-center">
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-white p-8 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-6">Reset Password</h2>
        <input value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="New Password*" className="border w-full p-2 mb-4" />
        <button type="submit" className="w-full btn-primary">Reset Password</button>
      </form>
    </main>
  );
};

export default ResetPassword;
