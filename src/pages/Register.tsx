import React from 'react';
import { Gift } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const handleSignUpNow = () => {
    // 保留URL参数，特别是ref参数
    navigate(`/signup${searchParams.toString() ? '?' + searchParams.toString() : ''}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md mx-auto px-6 py-12 text-center">
        {/* Main invitation message */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            🎉 You're invited to join fAIshion.AI!
          </h1>
        </div>

        {/* Gift icon */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full shadow-lg border border-gray-100">
            <Gift size={32} className="text-blue-600" />
          </div>
        </div>

        {/* Credits message */}
        <div className="mb-8">
          <p className="text-xl font-semibold text-gray-800 mb-2">
            Get +20 credits when you sign up
          </p>
        </div>

        {/* Welcome message */}
        <div className="mb-12 text-gray-600">
          <p className="font-medium mb-1">Your AI shopping assistant awaits!</p>
          <p>Try on virtually, find your perfect size, and grab the best deals.</p>
        </div>

        {/* Sign Up Now button */}
        <button
          onClick={handleSignUpNow}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white py-4 px-6 rounded-lg font-medium text-lg transition-colors"
        >
          Sign Up Now
        </button>
      </div>
    </div>
  );
};

export default Register;