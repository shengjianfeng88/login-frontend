import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { message, Spin } from "antd";
import axiosInstance from "@/utils/axiosInstance";
import { getApiUrl } from "../config/api";
import successImage from "@/assets/success_rabbit.png";

// Helper component for displaying detail rows
const DetailRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex justify-between py-2 border-b border-gray-100 last:border-b-0">
    <span className="text-gray-600">{label}</span>
    <span className="font-medium text-gray-900">{value}</span>
  </div>
);

// Helper function to format dates
const formatDate = (dateString?: string) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const SubscriptionSuccess: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [subscriptionData, setSubscriptionData] = useState<{
    stripe_session_id: string;
    created_at: string;
    plan_type: string;
    status: string;
    amount: number;
  } | null>(null);

  useEffect(() => {
    const verifyPaymentAndFetchSubscription = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
          message.error("No authentication token found");
          navigate("/signin");
          return;
        }

        // Fetch subscription status to verify payment
        const response = await axiosInstance.get(
          getApiUrl("SUBSCRIPTION_API", "/api/subscription/status"),
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.data.has_subscription && response.data.subscription) {
          const subscription = response.data.subscription;

          // Verify the subscription is in a valid state (according to Stripe docs)
          const isValidStatus = ['succeeded', 'active', 'trialing'].includes(subscription.status);

          if (isValidStatus) {
            setSubscriptionData(subscription);
            message.success("Payment successful! Your subscription is now active.");
          } else {
            message.warning(`Payment processed but subscription status is: ${subscription.status}. Please contact support if needed.`);
            setSubscriptionData(subscription);
          }
        } else {
          message.warning("No active subscription found. Redirecting to subscription...");
          setTimeout(() => {
            navigate("/subscription");
          }, 2000);
        }
      } catch (error) {
        console.error("Failed to verify payment:", error);
        message.error("Unable to verify payment status. Please check your subscription page.");
        setTimeout(() => {
          navigate("/subscription");
        }, 2000);
      } finally {
        setIsLoading(false);
      }
    };

    verifyPaymentAndFetchSubscription();
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Spin size="large" />
          <p className="mt-4 text-gray-600">Verifying your subscription...</p>
        </div>
      </div>
    );
  }

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

      <div className="min-h-[calc(100vh-5rem)] bg-gradient-to-br from-[#FDE9FF] via-white to-[#DDF8FB] flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="max-w-md w-full text-center">
          <img
            src={successImage}
            alt="Successful Payment Illustration"
            className="w-52 mx-auto mb-6"
          />

          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Successful Payment
          </h1>
          <p className="text-gray-600 mb-8">
            Your Plus subscription has been activated. Welcome to the Plus experience!
          </p>

          <div className="bg-white rounded-lg shadow-md p-6 md:p-8 mb-8 text-sm">
            <DetailRow label="Payment Confirmation" value="Success" />
            {subscriptionData?.stripe_session_id && (
              <DetailRow
                label="Session Reference"
                value={
                  subscriptionData.stripe_session_id.includes('_')
                    ? `CS-${subscriptionData.stripe_session_id.split('_').pop()?.substring(0, 8).toUpperCase()}`
                    : `CS-${subscriptionData.stripe_session_id.substring(0, 8).toUpperCase()}`
                }
              />
            )}
            {subscriptionData?.created_at && (
              <DetailRow label="Date" value={formatDate(subscriptionData.created_at)} />
            )}
            {subscriptionData?.plan_type && (
              <DetailRow label="Plan" value={subscriptionData.plan_type.charAt(0).toUpperCase() + subscriptionData.plan_type.slice(1)} />
            )}
            {subscriptionData?.status && (
              <DetailRow
                label="Status"
                value={
                  subscriptionData?.status === 'succeeded'
                    ? 'Active'
                    : subscriptionData?.status?.charAt(0).toUpperCase() + subscriptionData?.status?.slice(1)
                }
              />
            )}
            {subscriptionData?.amount && (
              <DetailRow label="Amount" value={`$${subscriptionData.amount / 100}`} />
            )}
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => navigate("/subscription")}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Back to home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionSuccess;