// src/pages/SignUp.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "@/utils/axiosInstance";
import { z } from "zod";

const signUpSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const SignUp = () => {
  const navigate = useNavigate();
  const [error, setError] = useState("");
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
      const validatedData = signUpSchema.parse(data);
      await axiosInstance.post("/auth/register", validatedData);
      navigate("/done");
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        setError(err.errors[0].message);
      } else {
        setError(err.response?.data?.message || "Register failed");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="w-screen h-screen p-10 flex items-center justify-center">
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-white p-8 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-6">Sign Up</h2>
        {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
        <input name="email" placeholder="Email*" className="border w-full p-2 mb-4" />
        <input name="password" type="password" placeholder="Password*" className="border w-full p-2 mb-4" />
        <button type="submit" className="w-full btn-primary" disabled={isLoading}>{isLoading ? "Registering..." : "Sign Up"}</button>
      </form>
    </main>
  );
};

export default SignUp;