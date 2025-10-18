import React, { useState, useEffect } from 'react';
import { User, CreditCard, Share2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import axiosInstance from '@/utils/axiosInstance';
import { getApiUrl } from '../config/api';

interface AccountSidebarProps {
  activeTab: 'account' | 'billing' | 'referral';
}

const AccountSidebar: React.FC<AccountSidebarProps> = ({ activeTab }) => {
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.user);

  // Avatar image load state
  const [avatarError, setAvatarError] = useState(false);

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

  // Reset avatar error when picture changes
  useEffect(() => {
    setAvatarError(false);
  }, [user.picture]);

  // Fetch subscription status on component mount
  useEffect(() => {
    const fetchSubscriptionStatus = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
          console.error("No authentication token found");
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
        setIsSubscriptionLoading(false);
      } catch (error) {
        console.error("Subscription status error:", error);
        setIsSubscriptionLoading(false);
      }
    };

    fetchSubscriptionStatus();
  }, []);

  // Helper function to get display plan name
  const getDisplayPlanName = () => {
    if (isSubscriptionLoading) {
      return (
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></span>
          Loading...
        </span>
      );
    }
    if (!subscriptionData.has_subscription) return "Free user";
    return "Plus user";
  };

  const navItems = [
    {
      id: 'account',
      label: 'Account',
      icon: <User size={20} />,
      onClick: () => navigate('/account-settings'),
    },
    {
      id: 'billing',
      label: 'Billing',
      icon: <CreditCard size={20} />,
      onClick: () => navigate('/billing'),
    },
    {
      id: 'referral',
      label: 'Referral Program',
      icon: <Share2 size={20} />,
      onClick: () => navigate('/referral'),
    },
  ];

  return (
    <div className="w-80 bg-white rounded-lg shadow-sm border border-gray-200 h-fit">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-4">
          {user.picture && !avatarError ? (
            <div className="relative w-12 h-12">
              <img
                src={user.picture}
                alt={user.email || 'User'}
                className="w-full h-full rounded-full object-cover"
                onError={() => setAvatarError(true)}
              />
            </div>
          ) : (
            <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
              <User className="text-gray-500" size={24} />
            </div>
          )}
          <div>
            <h3 className="font-medium text-gray-900">{user.email || 'Guest'}</h3>
            <p className="text-sm text-gray-500">
              {getDisplayPlanName()}
            </p>
          </div>
        </div>
      </div>

      <nav className="p-6">
        <div className="space-y-2">
          {navItems.map((item) => (
            <div
              key={item.id}
              className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                activeTab === item.id
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
              onClick={item.onClick}
            >
              {item.icon}
              <span className={activeTab === item.id ? 'font-medium' : ''}>
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default AccountSidebar;