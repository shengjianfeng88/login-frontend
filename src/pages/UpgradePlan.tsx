import React, { useState } from 'react';
import { ArrowLeft, User, CreditCard, Check, Crown, Copy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '@/utils/axiosInstance';

const UpgradePlan: React.FC = () => {
  const navigate = useNavigate();
  const [billingCycle, setBillingCycle] = useState<'annual' | 'monthly'>('annual');
  const [referralLink] = useState('https://fAIshion.AI.com/referMe/AI');
  const [isLoading, setIsLoading] = useState(false);

  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralLink);
    // You could add a toast notification here
  };

  const handleChoosePlan = async () => {
    setIsLoading(true);

    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        alert('Please login first');
        navigate('/signin');
        return;
      }

      const response = await axiosInstance.post(
        'https://subscriptions.faishion.ai/api/create-checkout-session',
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.url) {
        // Redirect to Stripe checkout
        window.location.href = response.data.url;
      }
    } catch (error: any) {
      console.error('Checkout error:', error);

      if (error.response?.status === 401) {
        alert('Session expired. Please login again.');
        navigate('/signin');
      } else if (error.response?.status === 400) {
        alert(error.response.data?.message || 'You already have a subscription or there was an error creating the checkout session.');
      } else {
        alert('Failed to create checkout session. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">fAIshion.AI</h1>
            </div>
            <div className="text-sm text-gray-600">
              Current Credits: <span className="font-medium">15</span>
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
                  <p className="text-sm text-gray-500">Free user</p>
                </div>
              </div>
            </div>

            <nav className="p-6">
              <div className="space-y-2">
                <div className="flex items-center gap-3 p-3 text-gray-700 hover:bg-gray-50 rounded-lg cursor-pointer"
                  onClick={() => navigate('/account-settings')}>
                  <User size={20} />
                  <span>Account</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-blue-50 text-blue-700 rounded-lg cursor-pointer"
                  onClick={() => navigate('/billing')}>
                  <CreditCard size={20} />
                  <span className="font-medium">Billing</span>
                </div>
              </div>
            </nav>
          </div>

          <div className="flex-1">
            <div className="mb-8">
              <button
                onClick={() => navigate('/billing')}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
              >
                <ArrowLeft size={20} />
                <span>Go back to Billing</span>
              </button>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-8 mb-8">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
                  <Crown size={24} className="text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">How to Earn Free Credits</h2>
                <p className="text-gray-600">Get unlimited access to all features, remove ads, and unlock advanced capabilities</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="flex items-start gap-4">
                  <div className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full flex-shrink-0 text-sm font-medium">
                    1
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 mb-1">Share Your Link</h3>
                    <p className="text-sm text-gray-600">Copy and share your unique referral link with friends</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full flex-shrink-0 text-sm font-medium">
                    2
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 mb-1">Friend Sign-Up</h3>
                    <p className="text-sm text-gray-600">Your friend creates an account using your referral link</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full flex-shrink-0 text-sm font-medium">
                    3
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 mb-1">You Both Gain Credits</h3>
                    <p className="text-sm text-gray-600">5 bonus credits added to both accounts automatically</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full flex-shrink-0 text-sm font-medium">
                    4
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 mb-1">Start Using</h3>
                    <p className="text-sm text-gray-600">Use your credits for try-ons and size recommendations</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Referral Rewards</h3>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600 mb-1">You Get</div>
                    <div className="text-sm text-gray-600">+5 credits per friend</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600 mb-1">Friend Receives</div>
                    <div className="text-sm text-gray-600">+5 welcome credits</div>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                  <div className="font-medium text-gray-900 mb-2">Free Member Limit</div>
                  <div className="text-sm text-gray-600">Maximum 5 referrals. Visitors = 2 credits each (not full amounts)</div>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={referralLink}
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50"
                  />
                  <button
                    onClick={copyReferralLink}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                  >
                    <Copy size={16} />
                    Copy Link
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Plans</h2>
                <h3 className="text-xl text-gray-700 mb-4">Upgrade to a Higher Plan</h3>
                <p className="text-gray-600">Get unlimited access with our Plus Subscription</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="border border-gray-200 rounded-lg p-6">
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Free Plan</h3>
                    <div className="text-3xl font-bold text-gray-900">$0</div>
                    <div className="text-gray-500">/account</div>
                    <div className="mt-2 text-sm text-gray-600 font-medium">Always free</div>
                  </div>

                  <div className="space-y-3 mb-6">
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

                  <button className="w-full bg-gray-300 text-gray-500 py-2 rounded-lg font-medium cursor-not-allowed">
                    Current Plan
                  </button>
                </div>

                <div className="border-2 border-blue-500 rounded-lg p-6 relative">
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                    Limited Time Special!
                  </div>

                  <div className="text-center mb-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Plus Plan</h3>
                    <div className="text-3xl font-bold text-gray-900">$6.99</div>
                    <div className="text-gray-500">/Month</div>

                    <div className="flex items-center justify-center gap-2 mt-3">
                      <span className="text-sm text-gray-500">150 credits = $8.99/mo (Regular price)</span>
                    </div>

                    <div className="mt-3">
                      <div className="flex items-center justify-center gap-4">
                        <span className={`text-sm ${billingCycle === 'annual' ? 'text-gray-500' : 'font-medium text-gray-900'}`}>Annual</span>
                        <button
                          onClick={() => setBillingCycle(billingCycle === 'annual' ? 'monthly' : 'annual')}
                          className={`w-12 h-6 rounded-full relative transition-colors ${billingCycle === 'annual' ? 'bg-blue-600' : 'bg-gray-300'}`}
                        >
                          <div
                            className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${billingCycle === 'annual' ? 'translate-x-6' : 'translate-x-0.5'
                              }`}
                          />
                        </button>
                        <span className={`text-sm ${billingCycle === 'monthly' ? 'text-gray-500' : 'font-medium text-gray-900'}`}>Annual</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4 text-center">
                    <div className="text-green-800 font-medium">Try this $6.99/mo! (Regular price)</div>
                  </div>

                  <div className="space-y-3 mb-6">
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

                  <button
                    onClick={handleChoosePlan}
                    disabled={isLoading}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white py-3 rounded-lg font-medium transition-colors"
                  >
                    {isLoading ? 'Processing...' : 'Choose Plan'}
                  </button>
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