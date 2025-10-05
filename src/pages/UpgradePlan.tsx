import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  User,
  CreditCard,
  Check,
  Crown,
  Copy,
  UserPlus,
  FileStack,
  PackageCheck,
  Share2,
  Gift,
  Info,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "@/utils/axiosInstance";
import { getApiUrl } from "../config/api";
import axios from "axios";

const UpgradePlan: React.FC = () => {
  const navigate = useNavigate();
  const [billingCycle, setBillingCycle] = useState<"annual" | "monthly">(
    "annual"
  );
  const [referralLink] = useState("https://fAIshion.AI.com/referMe/AI");
  const [isLoading, setIsLoading] = useState(false);
  const [copyButtonText, setCopyButtonText] = useState("Copy Link");
  const copyTimeoutRef = React.useRef<number | null>(null);

  // Subscription status state
  const [subscriptionData, setSubscriptionData] = useState<{
    has_subscription: boolean;
    subscription: {
      plan_type: string;
      status: string;
    } | null;
  }>({
    has_subscription: false,
    subscription: null,
  });
  const [isSubscriptionLoading, setIsSubscriptionLoading] = useState(true);
  const [subscriptionError, setSubscriptionError] = useState<string | null>(
    null
  );

  // Credit balance state
  const [credits, setCredits] = useState(0);
  const [isCreditsLoading, setIsCreditsLoading] = useState(true);
  const [creditsError, setCreditsError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCredits = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
          setCreditsError("No authentication token found");
          setIsCreditsLoading(false);
          return;
        }

        const response = await axiosInstance.get(
          getApiUrl("AUTH_API", "/api/auth/credits/balance"),
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        setCredits(response.data.credits);
        setCreditsError(null);
      } catch (error) {
        console.error("Credits error:", error);
        setCreditsError("Failed to load credits");
      } finally {
        setIsCreditsLoading(false);
      }
    };

    fetchCredits();
  }, []);

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) {
        window.clearTimeout(copyTimeoutRef.current);
      }
    };
  }, []);

  // Fetch subscription status on component mount
  useEffect(() => {
    const fetchSubscriptionStatus = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
          console.error("No authentication token found");
          setSubscriptionError("No authentication token found");
          setIsSubscriptionLoading(false);
          return;
        }

        const response = await axiosInstance.get(
          getApiUrl("SUBSCRIPTION_API", "/api/subscription/status"),
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        setSubscriptionData(response.data);
        console.log("Subscription data:", response.data);
        setSubscriptionError(null);
      } catch (error: unknown) {
        console.error("Subscription status error:", error);
        setSubscriptionError("Failed to load subscription status");

        // // Handle authentication errors
        // if (error && typeof error === 'object' && 'response' in error &&
        //     error.response && typeof error.response === 'object' && 'status' in error.response &&
        //     error.response.status === 401) {
        //   alert('Session expired. Please login again.');
        //   navigate('/signin');
        // }
      } finally {
        setIsSubscriptionLoading(false);
      }
    };

    fetchSubscriptionStatus();
  }, [navigate]);

  // Helper function to get display plan name
  const getDisplayPlanName = () => {
    if (isSubscriptionLoading) return "Loading...";
    if (subscriptionError) return "Free user";
    if (!subscriptionData.has_subscription) return "Free user";
    return "Plus user";
  };

  // Helper function to check if user has plus plan
  const hasPlusPlan = () => {
    return (
      !isSubscriptionLoading &&
      !subscriptionError &&
      subscriptionData.has_subscription
    );
  };

  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopyButtonText("Copied");
    if (copyTimeoutRef.current) {
      window.clearTimeout(copyTimeoutRef.current);
    }
    copyTimeoutRef.current = window.setTimeout(() => {
      setCopyButtonText("Copy Link");
      copyTimeoutRef.current = null;
    }, 3000);
  };

  const handleChoosePlan = async () => {
    setIsLoading(true);

    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        alert("Please login first");
        navigate("/signin");
        return;
      }

      const response = await axiosInstance.post(
        getApiUrl("SUBSCRIPTION_API", "/api/create-checkout-session"),
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.url) {
        // Redirect to Stripe checkout
        window.location.href = response.data.url;
      }
    } catch (error: unknown) {
      console.error("Checkout error:", error);

      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          alert("Session expired. Please login again.");
          navigate("/signin");
        } else if (error.response?.status === 400) {
          alert(
            error.response.data?.message ||
              "You already have a subscription or there was an error creating the checkout session."
          );
        } else {
          alert("Failed to create checkout session. Please try again.");
        }
      } else {
        alert("Failed to create checkout session. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
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
            <div className="text-sm text-gray-600">
              Current Credits:{" "}
              <span className="font-medium">
                {isCreditsLoading ? "..." : creditsError ? "N/A" : credits}
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          <div className="w-80 bg-white rounded-lg shadow-sm border border-gray-200 h-fit">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-300 rounded-full flex-shrink-0"></div>
                <div>
                  <h3 className="font-medium text-gray-900">Anna Wang</h3>
                  <p className="text-sm text-gray-500">
                    {isSubscriptionLoading ? (
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></span>
                        Loading...
                      </span>
                    ) : (
                      getDisplayPlanName()
                    )}
                  </p>
                </div>
              </div>
            </div>

            <nav className="p-6">
              <div className="space-y-2">
                <div
                  className="flex items-center gap-3 p-3 text-gray-700 hover:bg-gray-50 rounded-lg cursor-pointer"
                  onClick={() => navigate("/account-settings")}
                >
                  <User size={20} />
                  <span>Account</span>
                </div>
                <div
                  className="flex items-center gap-3 p-3 bg-blue-50 text-blue-700 rounded-lg cursor-pointer"
                  onClick={() => navigate("/billing")}
                >
                  <CreditCard size={20} />
                  <span className="font-medium">Billing</span>
                </div>
              </div>
            </nav>
          </div>

          <div className="flex-1">
            <div className="mb-8">
              <button
                onClick={() => navigate("/billing")}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
              >
                <ArrowLeft size={20} />
                <span>Go back to Billing</span>
              </button>
            </div>

            <div className="bg-[linear-gradient(252.2deg,#FDE9FF_3.17%,#DDF8FB_99.32%)] rounded-lg p-8 mb-8 max-w-4xl w-full mx-auto border border-gray-200">
              <div className="text-center mb-8">
                <div className="text-center mb-10">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-violet-600 rounded-full mb-5 shadow-md shadow-violet-200">
                    <Crown size={40} className="text-white" />
                  </div>
                  <h1 className="text-3xl font-bold text-gray-800 mb-2">
                    How to Earn Free Credits
                  </h1>
                  <p className="text-gray-500 max-w-md mx-auto">
                    Get unlimited access to all features, remove ads, and unlock
                    advanced capabilities
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
                      value={referralLink}
                      readOnly
                      className="w-full sm:w-auto flex-grow px-4 py-2.5 border border-gray-300 rounded-lg text-sm bg-gray-50/80 text-center sm:text-left focus:ring-2 focus:ring-violet-300 focus:outline-none transition-shadow"
                    />
                    <button
                      onClick={copyReferralLink}
                      className="w-full sm:w-auto bg-violet-600 hover:bg-violet-700 text-white px-5 py-2.5 rounded-lg flex items-center justify-center gap-2 font-semibold transition-all shadow-md hover:shadow-lg active:scale-95"
                    >
                      <Copy size={16} />
                      {copyButtonText}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8 max-w-4xl w-full mx-auto">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Plans</h2>
                <h3 className="text-xl text-gray-700 mb-4">
                  Upgrade to a Higher Plan
                </h3>
                <p className="text-gray-600">
                  Get unlimited access with our Plus Subscription
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="border border-gray-200 rounded-lg p-6 flex flex-col">
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      Free Plan
                    </h3>
                    <div className="text-3xl font-bold text-gray-900">$0</div>
                    <div className="text-gray-500">/account</div>
                    <div className="mt-2 text-sm text-gray-600 font-medium">
                      Always free
                    </div>
                  </div>

                  <div className="space-y-3 mb-6 flex-grow">
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Check size={16} className="text-green-600" />
                      <span>50 credits / month</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Check size={16} className="text-green-600" />
                      <span>~10 try-ons (5 credits each)</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Check size={16} className="text-green-600" />
                      <span>~50 size reca (1 credit each)</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Check size={16} className="text-green-600" />
                      <span>Limited History (last 5 items)</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Check size={16} className="text-green-600" />
                      <span>Basic Prompts</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Check size={16} className="text-green-600" />
                      <span>Ads shown</span>
                    </div>
                  </div>

                  {!hasPlusPlan() ? (
                    <button className="w-full bg-gray-300 text-gray-500 py-3 rounded-lg font-medium cursor-not-allowed">
                      Current Plan
                    </button>
                  ) : (
                    <button
                      onClick={handleChoosePlan}
                      disabled={isLoading || isSubscriptionLoading}
                      className="w-full bg-gray-300 hover:bg-gray-400 disabled:bg-gray-300 disabled:cursor-not-allowed text-gray-700 py-3 rounded-lg font-medium transition-colors"
                    >
                      {isLoading ? "Processing..." : "Choose Plan"}
                    </button>
                  )}
                </div>

                <div className="border-2 border-blue-500 rounded-lg p-6 relative flex flex-col">
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                    Limited Time Special!
                  </div>

                  <div className="text-center mb-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      Plus Plan
                    </h3>
                    <div className="text-3xl font-bold text-gray-900">
                      $6.99
                    </div>
                    <div className="text-gray-500">/Month</div>

                    <div className="flex items-center justify-center gap-2 mt-3">
                      <span className="text-sm text-gray-500">
                        150 credits = $8.99/mo (Regular price)
                      </span>
                    </div>

                    <div className="mt-3">
                      <div className="flex items-center justify-center gap-4">
                        <span
                          className={`text-sm ${
                            billingCycle === "annual"
                              ? "text-gray-500"
                              : "font-medium text-gray-900"
                          }`}
                        >
                          Annual
                        </span>
                        <button
                          onClick={() =>
                            setBillingCycle(
                              billingCycle === "annual" ? "monthly" : "annual"
                            )
                          }
                          className={`w-12 h-6 rounded-full relative transition-colors ${
                            billingCycle === "annual"
                              ? "bg-blue-600"
                              : "bg-gray-300"
                          }`}
                        >
                          <div
                            className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
                              billingCycle === "annual"
                                ? "translate-x-6"
                                : "translate-x-0.5"
                            }`}
                          />
                        </button>
                        <span
                          className={`text-sm ${
                            billingCycle === "monthly"
                              ? "text-gray-500"
                              : "font-medium text-gray-900"
                          }`}
                        >
                          Annual
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4 text-center">
                    <div className="text-green-800 font-medium">
                      Try this $6.99/mo! (Regular price)
                    </div>
                  </div>

                  <div className="space-y-3 mb-6 flex-grow">
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Check size={16} className="text-green-600" />
                      <span>Everything in Free Plan</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Check size={16} className="text-green-600" />
                      <span>30 try-ons & 150 size recs</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Check size={16} className="text-green-600" />
                      <span>No Limits</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Check size={16} className="text-green-600" />
                      <span>Full History Access</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Check size={16} className="text-green-600" />
                      <span>Custom background prompts</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Check size={16} className="text-green-600" />
                      <span>Ads Free</span>
                    </div>
                  </div>

                  {hasPlusPlan() ? (
                    <button className="w-full bg-green-600 text-white py-3 rounded-lg font-medium cursor-not-allowed">
                      Current Plan
                    </button>
                  ) : (
                    <button
                      onClick={handleChoosePlan}
                      disabled={isLoading || isSubscriptionLoading}
                      className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white py-3 rounded-lg font-medium transition-colors"
                    >
                      {isLoading ? "Processing..." : "Choose Plan"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpgradePlan;
