import React from "react";
import { useNavigate } from "react-router-dom";
import unsuccessImage from "@/assets/failed_rabbit.png";

const SubscriptionCancel: React.FC = () => {
  const navigate = useNavigate();

  const handleTryAgain = () => {
    navigate("/upgrade-plan");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                fAIshion.AI
              </h1>
            </div>
          </div>
        </div>
      </header>

      <div className="bg-gradient-to-br from-[#FDE9FF] via-white to-[#DDF8FB] flex items-center justify-center p-4 sm:p-6 lg:p-8 min-h-[calc(100vh-5rem)]">
        <div className="max-w-md w-full text-center">
          <img
            src={unsuccessImage}
            alt="Payment Unsuccessful Illustration"
            className="w-52 mx-auto mb-6"
          />

          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Payment Unsuccessful
          </h1>
          <p className="text-gray-600 mb-8">
            We couldn't process your payment. You can try again later or use a different payment method.
          </p>

          <div className="flex flex-col gap-3">
            <button
              onClick={handleTryAgain}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Retry Payment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionCancel;