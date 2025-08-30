import React from 'react';
import { ArrowLeft, User, CreditCard, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AccountSettings: React.FC = () => {
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
                <div className="flex items-center gap-3 p-3 bg-blue-50 text-blue-700 rounded-lg">
                  <User size={20} />
                  <span className="font-medium">Account</span>
                </div>
                <div className="flex items-center gap-3 p-3 text-gray-700 hover:bg-gray-50 rounded-lg cursor-pointer"
                     onClick={() => navigate('/billing')}>
                  <CreditCard size={20} />
                  <span>Billing</span>
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
              
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">Account Settings</h1>
                <p className="text-gray-600">Manage your account preferences</p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Profile Information</h2>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
                    More
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                <p className="text-sm text-gray-500 mb-4">Your Account</p>
                <div className="flex items-center gap-3">
                  <Mail size={20} className="text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">Alex.AI</p>
                    <p className="text-sm text-gray-500">alex.johnson@example.com</p>
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

export default AccountSettings;