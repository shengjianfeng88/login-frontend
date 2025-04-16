import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axiosInstance from "@/utils/axiosInstance"



const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token") || "";
  const [message, setMessage] = useState("Verifying...");

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        await axiosInstance.get(`/auth/verify-email?token=${token}`);
        setMessage("Email Verified Successfully!");
        setTimeout(() => {
          navigate("/signin");
        }, 1500);
      } catch (error: any) {
        setMessage(error.response?.data?.message || "Verification Failed");
      }
    };

    if (token) verifyEmail();
  }, [token, navigate]);

  return (
    <main className="w-screen h-screen flex items-center justify-center">
      <div className="text-2xl">{message}</div>
    </main>
  );
};

export default VerifyEmail;
