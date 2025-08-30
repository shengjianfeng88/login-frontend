import React from 'react';
import { ArrowLeft, User, CreditCard, Check, X, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Billing: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">fAIshion.AI</h1>
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
                <div className="flex items-center gap-3 p-3 bg-blue-50 text-blue-700 rounded-lg">
                  <CreditCard size={20} />
                  <span className="font-medium">Billing</span>
                </div>
              </div>
            </nav>
          </div>

          <div className="flex-1">
            <div className="mb-8">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
              >
                <ArrowLeft size={20} />
                <span>Go back to Dashboard</span>
              </button>
            </div>

            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">Free - 50 credits</h1>
                  <div className="flex items-center gap-2">
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-medium">
                      Active
                    </span>
                    <span className="text-gray-600">You're currently on a basic plan with basic features</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-gray-900">$0</div>
                  <div className="text-gray-500">per month</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-gray-100 rounded-lg p-6 text-center">
                  <div className="text-3xl font-bold text-gray-900 mb-1">15</div>
                  <div className="text-gray-600">Available Credits</div>
                </div>
                <div className="bg-gray-100 rounded-lg p-6 text-center">
                  <div className="text-3xl font-bold text-gray-900 mb-1">0</div>
                  <div className="text-gray-600">Monthly Cost</div>
                </div>
              </div>

              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-2 text-gray-700">
                  <Check size={16} className="text-green-600" />
                  <span>50 credits / month</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <Check size={16} className="text-green-600" />
                  <span>~10 try-ons (5 credits each)</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <Check size={16} className="text-green-600" />
                  <span>~50 size reca (1 credit each)</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <Check size={16} className="text-green-600" />
                  <span>Limited History (last 5 items)</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <Check size={16} className="text-green-600" />
                  <span>Basic Prompts</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <X size={16} className="text-red-500" />
                  <span>Ads shown</span>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="text-yellow-600 flex-shrink-0 mt-0.5" size={20} />
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 mb-1">Credits Running Low</h3>
                    <p className="text-gray-700 mb-4">
                      Unlock more tryons, credits, and size recommendations with <span className="font-medium">premium</span>
                    </p>
                    <button
                      onClick={() => navigate('/upgrade-plan')}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
                    >
                      Upgrade Plan
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

export default Billing;