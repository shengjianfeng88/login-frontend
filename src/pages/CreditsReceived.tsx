import React from 'react';
import { Gift } from 'lucide-react';

const CreditsReceived: React.FC = () => {
  const handleDownloadExtension = () => {
    window.open('https://chromewebstore.google.com/detail/2110-faishionai-virtual-t/gpclcbeibdepihaaeddaaijekabieiok?hl=zh-CN&utm_source=ext_sidebar', '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md mx-auto px-6 py-12 text-center">
        {/* Main celebration message */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            🎉 You've received +20 credits!
          </h1>
        </div>

        {/* Gift icon */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full shadow-lg border border-gray-100">
            <Gift size={32} className="text-blue-600" />
          </div>
        </div>

        {/* Welcome message */}
        <div className="mb-12 text-gray-600">
          <p className="font-medium mb-1">Welcome aboard!</p>
          <p>Your account has been created and 20 credits have been added.</p>
        </div>

        {/* Download button */}
        <button
          onClick={handleDownloadExtension}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white py-4 px-6 rounded-lg font-medium text-lg transition-colors"
        >
          Download Chrome Extension
        </button>
      </div>
    </div>
  );
};

export default CreditsReceived;