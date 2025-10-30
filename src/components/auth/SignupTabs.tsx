// src/components/auth/SignupTabs.tsx
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store/store";
import { setAuthMethod, setAuthState, setError } from "@/store/features/authSlice";
import { LinkSignupForm } from "./LinkSignupForm";
import PasswordSignupForm from "./PasswordSignupForm";
import { useEffect } from "react";

interface SignupTabsProps {
  handleSubmit: () => Promise<void> | void;
}

export default function SignupTabs({ handleSubmit }: SignupTabsProps) {
  const dispatch = useDispatch();
  const { authState, authMethod, isLoading, formData, error } = useSelector(
    (state: RootState) => state.auth
  );

  return (
    <div className="w-full transition-all duration-300">

      {/* Link based no password signup */}
      {authMethod === "link" && authState === "form" &&   (
        <LinkSignupForm handleSubmit={handleSubmit} isLoading={isLoading} />
      )}

      {/* Password signup */}
      {authState === "form" && authMethod === "password" && (
        <>
          <PasswordSignupForm
            handleSubmit={handleSubmit}
            isLoading={isLoading}
          />
        </>
      )}

      {/* Sent screen */}
      {authState === "sent" && (
        <div>
          <p className="text-xs text-gray-400 mb-2 uppercase tracking-wide">
            Step 2 of 3
          </p>
          <h3 className="text-xl font-semibold mb-2">Check your inbox</h3>
          <p className="text-sm text-gray-600 mb-6 leading-relaxed">
          {isLoading ? (
            "Sending..."
          ) : error ? (
            <span className="text-red-500">{error}</span>
          ) : (
            <>
              We sent a sign-up link to{" "}
              <span className="font-medium text-black">{formData.email}</span>.
            </>
          )}
        </p>

      {/* Buttons */}
      <div className="space-y-3">
        <button
          onClick={handleSubmit}
          disabled={isLoading}
          className={`w-full py-3 rounded-lg font-medium transition ${
            isLoading
              ? "bg-gray-400 text-white cursor-not-allowed"
              : "bg-black text-white hover:bg-gray-900"
          }`}
        >
          {isLoading ? "Sending..." : "Resend link"}
        </button>

        <button
          onClick={() => {
            dispatch(setAuthMethod("password"));
            dispatch(setAuthState("form"));
            dispatch(setError(null))
          }}
          className="w-full py-3 rounded-lg bg-gray-100 hover:bg-gray-200 text-black font-medium transition"
        >
          Create password instead
        </button>
      </div>
        </div>
      )}
    </div>
  );
}
