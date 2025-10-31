import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axiosInstance from "@/utils/axiosInstance";

const ConfirmSignup = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token") || "";
  const [message, setMessage] = useState("Confirming your registration...");

  useEffect(() => {
    const confirm = async () => {
      try {
        console.log("sending token")
        const res = await axiosInstance.get(`/auth/verify-signup?token=${token}`);
        setMessage(res.data.message || "🎉 Registration complete! Redirecting...");

        if (res) {
          setTimeout(() => {
            navigate("/Done");      
          }, 2000);
        }
      } catch (err: any) {
        console.error("Confirm register error", err);
        setMessage(err.response?.data?.message || "Registration failed. Invalid or expired link.");
      }
    };

    if (token) confirm();
    else setMessage("Missing token in URL.");
  }, [token, navigate]);

  return (
    <main className="w-screen h-screen flex items-center justify-center">
      <div className="text-xl font-semibold px-4 text-center">{message}</div>
    </main>
  );
};

export default ConfirmSignup;
