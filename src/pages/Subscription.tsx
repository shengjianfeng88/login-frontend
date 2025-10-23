import React, { useState, useEffect } from "react";
import { Check, X, Crown, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Modal, message } from "antd";
import AccountSidebar from "../components/AccountSidebar";
import axiosInstance from "@/utils/axiosInstance";
import { getApiUrl } from "../config/api";
import axios from "axios";

const Subscription: React.FC = () => {
  const navigate = useNavigate();

  // State for subscription management
  const [isLoading, setIsLoading] = useState(false);

  // Cancel subscription state
  const [isCancelling, setIsCancelling] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [subscriptionCancelled, setSubscriptionCancelled] = useState(false);

  // Subscription status state
  const [subscriptionData, setSubscriptionData] = useState<{
    has_subscription: boolean;
    subscription: {
      _id: string;
      user_id: string;
      stripe_session_id: string;
      stripe_payment_id: string | null;
      amount: number;
      currency: string;
      status: string;
      plan_type: string;
      credits_amount: number;
      created_at: string;
      updated_at: string;
    } | null;
  }>({
    has_subscription: false,
    subscription: null,
  });
  const [isSubscriptionLoading, setIsSubscriptionLoading] = useState(true);
  const [subscriptionError, setSubscriptionError] = useState<string | null>(
    null
  );

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
      } finally {
        setIsSubscriptionLoading(false);
      }
    };

    fetchSubscriptionStatus();
  }, [navigate]);

  // Helper function to check if user has plus plan
  const hasPlusPlan = () => {
    return (
      !isSubscriptionLoading &&
      !subscriptionError &&
      subscriptionData.has_subscription
    );
  };

  // Helper function to format currency
  const formatCurrency = (amount: number, currency: string) => {
    const formatter = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
    });
    return formatter.format(amount / 100); // Convert from cents to dollars
  };

  // Helper function to calculate days until renewal
  const calculateDaysUntilRenewal = () => {
    if (!subscriptionData.subscription) return null;

    // For monthly subscription, calculate based on the created_at date
    // Stripe typically uses a 30-day billing cycle for monthly subscriptions
    // The server time appears to be in UTC format (e.g., 2025-10-18T23:27:13.681000)
    const createdAt = new Date(subscriptionData.subscription.created_at);
    
    // Add exactly 30 days for the renewal date (standard Stripe monthly cycle)
    const renewalDate = new Date(createdAt);
    renewalDate.setDate(renewalDate.getDate() + 30);

    // Get current time in UTC to match server time
    const now = new Date();
    
    // Calculate the difference in days
    const diffTime = renewalDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays > 0 ? diffDays : 0;
  };

  const handleChoosePlan = async () => {
    setIsLoading(true);

    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        message.error("Please login first");
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
          message.error("Session expired. Please login again.");
          navigate("/signin");
        } else if (error.response?.status === 400) {
          message.error(
            error.response.data?.message ||
            "You already have a subscription or there was an error creating the checkout session."
          );
        } else {
          message.error("Failed to create checkout session. Please try again.");
        }
      } else {
        message.error("Failed to create checkout session. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    setIsCancelling(true);

    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        message.error("No authentication token found");
        setIsCancelling(false);
        return;
      }

      const response = await axiosInstance.delete(
        getApiUrl("SUBSCRIPTION_API", "/api/subscription/cancel"),
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        // Update subscription state locally
        const prevSubscription = subscriptionData.subscription;
        setSubscriptionData({
          has_subscription: false,
          subscription: null,
        });

        setShowCancelConfirm(false);
        setSubscriptionCancelled(true);
        message.success(
          "Your subscription has been cancelled and will not renew. You'll continue to have access to Plus features until the end of your current billing period."
        );

        // Store previous subscription data for display purposes
        if (prevSubscription) {
          setSubscriptionData({
            has_subscription: false,
            subscription: {
              ...prevSubscription,
              status: "cancelled",
            },
          });
        }
      } else {
        message.error(response.data.error || "Failed to cancel subscription");
      }
    } catch (error: unknown) {
      console.error("Cancel subscription error:", error);

      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          message.error("Session expired. Please login again.");
          setTimeout(() => {
            navigate("/signin");
          }, 2000);
        } else if (error.response?.status === 404) {
          message.error("No active subscription found");
        } else {
          message.error("Failed to cancel subscription. Please try again.");
        }
      } else {
        message.error("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsCancelling(false);
    }
  };

  const PlanFeature: React.FC<{ included: boolean; text: string }> = ({
    included,
    text,
  }) => (
    <div className="flex items-center gap-3">
      {included ? (
        <Check className="text-green-500 w-5 h-5 flex-shrink-0" />
      ) : (
        <X className="text-red-500 w-5 h-5 flex-shrink-0" />
      )}
      <span className="text-gray-700">{text}</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
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
          <AccountSidebar activeTab="subscription" />

          <div className="flex-1">
            <div className="mb-8">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                  Subscription
                </h1>
              </div>
            </div>

            {isSubscriptionLoading ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                </div>
              </div>
            ) : subscriptionError ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <p className="text-red-800">
                    Error loading subscription information: {subscriptionError}
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
                {/* Cancellation Notice */}
                {subscriptionCancelled && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <AlertTriangle
                          className="h-5 w-5 text-amber-400"
                        />
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-amber-800">
                          Subscription Cancelled
                        </h3>
                        <div className="mt-2 text-sm text-amber-700">
                          <p>
                            Your subscription has been cancelled. You'll
                            continue to have access to Plus features until the
                            end of your current billing period.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Header Section */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-2">
                  <div className="flex items-center gap-4">
                    <div className="bg-blue-100 text-blue-600 p-3 rounded-full">
                      <Crown size={28} />
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold text-gray-800">
                        {hasPlusPlan() ? "Plus Plan" : "Free Plan"}
                      </h1>
                      <div className="flex items-center gap-2 mt-1">
                        {hasPlusPlan() ? (
                          <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold">
                            Active
                          </span>
                        ) : subscriptionCancelled &&
                          subscriptionData.subscription?.status ===
                          "cancelled" ? (
                          <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-xs font-semibold">
                            Cancelled
                          </span>
                        ) : (
                          <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold">
                            Active
                          </span>
                        )}
                        {hasPlusPlan() ? (
                          <span className="text-gray-500 text-sm">
                            {subscriptionData.subscription?.plan_type ===
                              "monthly"
                              ? "monthly billing"
                              : subscriptionData.subscription?.plan_type ===
                                "yearly"
                                ? "yearly billing"
                                : ""}
                          </span>
                        ) : (
                          <span className="text-gray-500 text-sm">
                            You are currently on a basic plan with basic
                            features
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right mt-4 sm:mt-0">
                    <div className="text-3xl font-bold text-gray-800">
                      {hasPlusPlan()
                        ? formatCurrency(
                          subscriptionData.subscription?.amount || 0,
                          subscriptionData.subscription?.currency || "usd"
                        )
                        : "$0"}
                    </div>
                    <div className="text-gray-500 text-sm">per month</div>
                  </div>
                </div>

                {/* Stats Section */}
                {hasPlusPlan() &&
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-4 mt-4">
                      <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-xl p-6 text-center">
                        <div className="text-4xl font-bold text-indigo-600 mb-1">
                          {subscriptionData.subscription?.credits_amount}
                        </div>
                        <div className="text-gray-500">
                          Available Credits
                        </div>
                      </div>
                      <div className="bg-white border border-gray-200 rounded-xl p-6 text-center">
                        <div className="text-4xl font-bold text-indigo-600 mb-1">
                          {calculateDaysUntilRenewal()} days
                        </div>
                        <div className="text-gray-500">
                          Until Renewal
                        </div>
                      </div>
                    </div>
                  </>
                }

                {/* Actions Section */}
                {/* <div className="flex justify-between items-center">
                  <Link>Manage Billing & Invoices</Link>
                </div> */}
              </div>
            )}

            {/* Upgrade Plans Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  Upgrade to a Higher Plan
                </h2>
              </div>

              <div className="flex flex-col lg:flex-row items-stretch justify-center gap-8 w-full">
                {/* Free Plan Card */}
                <div className="bg-white rounded-2xl border border-gray-200 p-8 w-full max-w-md flex flex-col h-full min-h-[600px]">
                  <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                    Free Plan
                  </h2>
                  <p className="text-4xl font-bold text-gray-900 mb-1">
                    $0{" "}
                    <span className="text-lg font-medium text-gray-500">
                      per month
                    </span>
                  </p>
                  <hr className="my-6" />
                  <p className="text-sm font-medium text-gray-600 mb-6">
                    Always free
                  </p>
                  <div className="space-y-4 flex-grow mb-8">
                    <PlanFeature included={true} text="50 credits / month" />
                    <PlanFeature
                      included={true}
                      text="~10 try-ons (5 credits each)"
                    />
                    <PlanFeature
                      included={true}
                      text="~50 size recs (1 credit each)"
                    />
                    <PlanFeature
                      included={true}
                      text="Limited History (last 5 items)"
                    />
                    <PlanFeature included={true} text="Basic Prompts" />
                    <PlanFeature included={false} text="Ads shown" />
                  </div>
                  {!hasPlusPlan() ? (
                    <button className="w-full bg-gray-200 text-gray-500 py-3 rounded-lg font-medium cursor-not-allowed">
                      Current Plan
                    </button>
                  ) : (
                    <button
                      onClick={() => setShowCancelConfirm(true)}
                      className="w-full bg-gray-300 hover:bg-gray-400 text-gray-700 py-3 rounded-lg font-medium transition-colors"
                    >
                      Downgrade
                    </button>
                  )}
                </div>

                {/* Plus Plan Card */}
                <div className="bg-purple-50 rounded-2xl border-2 border-purple-300 p-8 w-full max-w-md flex flex-col h-full min-h-[600px] relative">
                  <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                    Plus Plan
                  </h2>
                  <div className="flex items-baseline gap-2 mb-4">
                    <p className="text-4xl font-bold text-gray-900">$9.99</p>
                    <p className="text-lg font-medium text-gray-500">
                      per month
                    </p>
                    {/* <p className="text-sm text-gray-400 line-through">$9.99/mo</p> */}
                  </div>

                  <hr className="my-4" />
                  <p className="text-sm font-medium text-gray-600 mb-6">
                    Premium features
                  </p>
                  {/* <div className="bg-green-100 border border-green-200 rounded-lg p-4 mb-6 text-center">
                    <p className="font-bold text-green-800">Limited Time Special</p>
                    <p className="text-sm text-green-700">First three months: $6.99/mo</p>
                    <p className="text-sm text-green-700">Then: $9.99/mo (Regular price)</p>
                  </div> */}

                  <div className="space-y-4 flex-grow mb-8">
                    <PlanFeature
                      included={true}
                      text="150 credits/mo + top-ups available"
                    />
                    <PlanFeature included={true} text="No queue" />
                    <PlanFeature included={true} text="Full History Access" />
                    <PlanFeature
                      included={true}
                      text="Custom background prompts"
                    />
                    <PlanFeature included={true} text="Ad Free" />
                  </div>
                  {hasPlusPlan() ? (
                    <button className="w-full bg-purple-600 text-white py-3 rounded-lg font-medium cursor-not-allowed">
                      Current Plan
                    </button>
                  ) : (
                    <button
                      onClick={handleChoosePlan}
                      disabled={isLoading || isSubscriptionLoading}
                      className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 disabled:cursor-not-allowed text-white py-3 rounded-lg font-medium transition-colors"
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

      {/* Cancel Subscription Confirmation Modal */}
      <Modal
        title="Cancel Subscription"
        open={showCancelConfirm}
        onOk={handleCancelSubscription}
        onCancel={() => setShowCancelConfirm(false)}
        okText={isCancelling ? "Cancelling..." : "Yes, Cancel"}
        cancelText="Keep Subscription"
        okButtonProps={{
          loading: isCancelling,
          danger: true,
        }}
        width={480}
      >
        <div className="py-4">
          <p className="text-gray-600 mb-4">
            Are you sure you want to cancel your Plus subscription?
          </p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> Your subscription will remain active until
              the end of your current billing period. You'll continue to have
              access to all Plus features until then.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Subscription;