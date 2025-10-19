import React, { useState } from 'react';
import { AlertTriangle, Mail, Trash2 } from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import AccountSidebar from '../components/AccountSidebar';

const AccountSettings: React.FC = () => {
  // const [showDangerZone, setShowDangerZone] = useState(false);
  const userEmail = useSelector((state: RootState) => state.user.email);

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
          <AccountSidebar activeTab="account" />

          <div className="flex-1">
            <div className="mb-8">

              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">Account Settings</h1>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 pb-0">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Profile Information</h2>
                  {/* <button
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium min-w-[80px]"
                    onClick={() => setShowDangerZone(!showDangerZone)}
                  >
                    {showDangerZone ? 'Less' : 'More'}
                  </button> */}
                </div>
              </div>

              <div className="p-6">
                <p className="text-sm text-gray-500 mb-4">Your Account</p>
                <div className="flex items-center gap-3">
                  <Mail size={20} />
                  <div>
                    <p className="text-sm">{userEmail || 'No email available'}</p>
                  </div>
                </div>
              </div>

              {/* {showDangerZone && (
                <div className="border-t border-gray-200">
                  <div className="p-6">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <AlertTriangle size={20} className="text-red-600" />
                        <h3 className="text-lg font-semibold text-red-900">Danger Zone</h3>
                      </div>
                      <p className="text-sm text-red-700 mb-4">
                        Once you delete your account, there is no going back. Please be certain.
                      </p>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">Delete Account</p>
                          <p className="text-xs text-gray-500">Permanently remove your account and all data</p>
                        </div>
                        <button className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium">
                          <Trash2 size={16} />
                          Delete Account
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )} */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountSettings;