import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axiosInstance from "@/utils/axiosInstance";

const ConfirmRegister = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token") || "";
  const [message, setMessage] = useState("Confirming your registration...");

  useEffect(() => {
    const confirm = async () => {
      try {
        const res = await axiosInstance.get(`/auth/confirm-register?token=${token}`);
        setMessage(res.data.message || "🎉 Registration complete! Redirecting...");

        if (res.data.success) {
          setTimeout(() => {
            navigate("/signin");
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

export default ConfirmRegister;
