import React, { useState, useEffect } from "react";
import {
  User,
  Copy,
  UserPlus,
  FileStack,
  PackageCheck,
  Share2,
  Gift,
  Info,
} from "lucide-react";
import { message } from "antd";
import AccountSidebar from "../components/AccountSidebar";
import axiosInstance from "@/utils/axiosInstance";
import { getApiUrl } from "../config/api";

const ReferralPage: React.FC = () => {
  // Referral link state
  const [referralData, setReferralData] = useState<{
    referralCode: string;
    referralLink: string;
  } | null>(null);
  const [isReferralLoading, setIsReferralLoading] = useState(true);
  const [referralError, setReferralError] = useState<string | null>(null);
  const [copyButtonText, setCopyButtonText] = useState("Copy Link");
  const copyTimeoutRef = React.useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) {
        window.clearTimeout(copyTimeoutRef.current);
      }
    };
  }, []);

  // Fetch referral info on component mount
  useEffect(() => {
    const fetchReferralInfo = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
          setReferralError("No authentication token found");
          setIsReferralLoading(false);
          return;
        }

        const response = await axiosInstance.get(
          getApiUrl("AUTH_API", "/auth/referral-info"),
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.data.success) {
          setReferralData({
            referralCode: response.data.referralCode,
            referralLink: response.data.referralLink,
          });
          setReferralError(null);
        } else {
          setReferralError("Failed to load referral information");
        }
      } catch (error) {
        console.error("Referral info error:", error);
        setReferralError("Failed to load referral information");
      } finally {
        setIsReferralLoading(false);
      }
    };

    fetchReferralInfo();
  }, []);

  const copyReferralLink = () => {
    if (!referralData?.referralLink) {
      message.error("Referral link not available");
      return;
    }
    navigator.clipboard.writeText(referralData.referralLink);
    setCopyButtonText("Copied");
    if (copyTimeoutRef.current) {
      window.clearTimeout(copyTimeoutRef.current);
    }
    copyTimeoutRef.current = window.setTimeout(() => {
      setCopyButtonText("Copy Link");
      copyTimeoutRef.current = null;
    }, 3000);
  };

  const steps = [
    {
      icon: <Share2 className="text-gray-500" size={20} />,
      title: "Share Your Link",
      description: "Copy and share your unique referral link with friends",
    },
    {
      icon: <UserPlus className="text-gray-500" size={20} />,
      title: "Friend Sign Up",
      description: "Your friend creates an account using your referral link",
    },
    {
      icon: <FileStack className="text-gray-500" size={20} />,
      title: "You Both Gain Credits",
      description: "Instant bonus credits added to both accounts automatically",
    },
    {
      icon: <PackageCheck className="text-gray-500" size={20} />,
      title: "Start Using",
      description: "Use your credits for try-ons and size recommendations",
    },
  ];

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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          <AccountSidebar activeTab="referral" />

          <div className="flex-1">
            <div className="mb-8">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">Referral Program</h1>
              </div>
            </div>

            <div className="bg-[linear-gradient(252.2deg,#FDE9FF_3.17%,#DDF8FB_99.32%)] rounded-lg p-8 mb-8 max-w-4xl w-full mx-auto border border-gray-200">
              <div className="text-center mb-8">
                <div className="text-center mb-10">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-violet-600 rounded-full mb-5 shadow-md shadow-violet-200">
                    <Share2 size={40} className="text-white" />
                  </div>
                  <h1 className="text-3xl font-bold text-gray-800 mb-2">
                    Refer Friends & Earn Credits
                  </h1>
                  <p className="text-gray-500 max-w-md mx-auto">
                    Share your referral link and both you and your friends will receive bonus credits
                  </p>
                </div>

                <div className="space-y-6 mb-12 text-left max-w-md mx-auto">
                  {steps.map((step, index) => (
                    <div key={index} className="flex items-start gap-4">
                      <div className="flex items-center justify-center w-8 h-8 text-gray-500 font-medium text-sm">
                        {index + 1}
                      </div>
                      <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-white rounded-full shadow-sm">
                        {step.icon}
                      </div>
                      <div className="text-left">
                        <h3 className="font-semibold text-gray-800 mb-1">
                          {step.title}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50 shadow-inner shadow-gray-100/50">
                  <h2 className="text-xl font-bold text-gray-800 text-center mb-6">
                    Referral Rewards
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="bg-violet-100/60 rounded-lg p-4 flex items-center gap-4 border border-violet-200/80">
                      <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                        <User className="text-violet-600" size={20} />
                      </div>
                      <div className="text-left">
                        <div className="font-semibold text-gray-800">
                          You Get
                        </div>
                        <div className="text-sm text-violet-700 font-medium">
                          +20 credits per friend
                        </div>
                      </div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4 flex items-center gap-4 border border-green-200/80">
                      <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                        <Gift className="text-green-600" size={20} />
                      </div>
                      <div className="text-left">
                        <div className="font-semibold text-gray-800">
                          Friend Receives
                        </div>
                        <div className="text-sm text-green-700 font-medium">
                          +20 welcome credits
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-100/60 border border-blue-200/80 rounded-lg p-4 flex items-start gap-4 mb-8">
                    <Info
                      className="text-blue-600 mt-0.5 flex-shrink-0"
                      size={16}
                    />
                    <div className="text-left">
                      <div className="font-semibold text-gray-800 mb-1">
                        Plus Member Bonus
                      </div>
                      <p className="text-sm text-blue-800">
                        If your friend upgrades to Plus:{" "}
                        <span className="font-medium">
                          Automatic 20% off for next billing cycle + 20 bonus
                          credits
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <input
                      type="text"
                      value={isReferralLoading ? "Loading..." : referralError ? "Not available" : referralData?.referralLink || ""}
                      readOnly
                      className="w-full sm:w-auto flex-grow px-4 py-2.5 border border-gray-300 rounded-lg text-sm bg-gray-50/80 text-center sm:text-left focus:ring-2 focus:ring-violet-300 focus:outline-none transition-shadow"
                    />
                    <button
                      onClick={copyReferralLink}
                      disabled={isReferralLoading || !referralData?.referralLink}
                      className="w-full sm:w-auto bg-violet-600 hover:bg-violet-700 disabled:bg-violet-400 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-lg flex items-center justify-center gap-2 font-semibold transition-all shadow-md hover:shadow-lg active:scale-95"
                    >
                      <Copy size={16} />
                      {copyButtonText}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReferralPage;