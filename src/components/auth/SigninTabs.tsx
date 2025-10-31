import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import {setAuthMethod,setAuthState,setError,setFormData,} from "@/store/features/authSlice";
import PasswordLoginForm from "./PasswordLoginForm";
import { validateEmail } from "@/utils/validation";
import { useEffect } from "react";

interface SigninTabsProps {
  handleSubmit: () => Promise<void> | void; // for password login
  handleRequestCode: (email: string) => Promise<void> | void; // send email code
  handleSubmitCode: (email: string, code: string) => Promise<void>; // verify email code
}

export default function SigninTabs({
  handleSubmit,
  handleRequestCode,
  handleSubmitCode,
}: SigninTabsProps) {
  const dispatch = useDispatch();
  const { authState, authMethod, isLoading, formData, error } = useSelector(
    (state: RootState) => state.auth
  );
  // Handle email input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    dispatch(setFormData({ [name]: value }));
    dispatch(setError(null));

    if (name === "email" && value && !validateEmail(value)) {
      dispatch(setError("Please enter a valid email address"));
    }
  };

  // Send code to email
  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log(formData)
    dispatch(setFormData({ code: "" }));
    dispatch(setError(null));
    console.log(formData)
    if (!formData.email || !validateEmail(formData.email)) {
      dispatch(setError("Please enter a valid email address"));
      return;
    }
    try {
      await handleRequestCode(formData.email);  
    } catch (err) {
      console.error("Error sending code:", err);
      dispatch(setError("Failed to send verification code"));
    }
  };

  // Verify code entered by user
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault(); 
    console.log(formData.code)
    if (!formData.email || !formData.code) {
      dispatch(setError("Please enter the verification code"));
      return;
    }

    try {
      await handleSubmitCode(formData.email, formData.code);  
    } catch (err) {
      console.error("Verification failed:", err);
      dispatch(setError("Invalid or expired code"));
    }
  };

  return (
    <div className="w-full transition-all duration-300">
      {/* --- Email-based sign-in (code) --- */}
      {authMethod === "code" && authState === "form" && (
        <>
          <p className="text-sm text-gray-500 mb-4">
            Sign in quickly with a one-time code sent to your email.
          </p>

          <form onSubmit={handleSendCode} className="space-y-4">
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-black/70"
              required
            />
           
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 rounded-lg font-semibold transition ${
                isLoading
                  ? "bg-gray-400 text-white cursor-not-allowed"
                  : "bg-black text-white hover:bg-gray-900"
              }`}
            >
              {isLoading ? "Sending..." : "Continue"}
            </button>
          </form>

          <button
              type="button"
              onClick={() => {
                dispatch(setAuthMethod("password"));
                dispatch(setAuthState("form"));
                dispatch(setError(null));
              }}
              className="w-full mt-3 bg-gray-200 text-black py-3 rounded-lg font-medium hover:bg-gray-300 transition"
            >
              Use password instead
            </button>
        </>
      )}

       {/* --- Password-based sign-in --- */}
      {authState === "form" && authMethod === "password" && (
        <>
          <PasswordLoginForm handleSubmit={handleSubmit} /> 
        </>
      )}


      {/* --- Code verification step --- */}
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
                We sent a 6-digit code to{" "}
                <span className="font-medium text-black">
                  {formData.email}
                </span>.
              </>
            )}
          </p>

          <form onSubmit={handleVerifyCode} className="space-y-4">
            <div className="flex justify-between space-x-2">
            {Array.from({ length: 6 }).map((_, idx) => (
              <input
                key={idx}
                name="code"
                type="text"
                maxLength={1}
                inputMode="numeric"
                value={formData.code?.[idx] || ""}   // ✅ Controlled by Redux
                className="w-12 h-12 text-center border border-gray-300 rounded-lg text-lg font-medium focus:ring-2 focus:ring-black/70 focus:outline-none"
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, ""); // allow only digits
                  const next = e.target.nextElementSibling as HTMLInputElement;
                  if (value && next) next.focus();
                  // ✅ Update the correct character in the code
                  const currentCode = formData.code || "";
                  const updated =
                    currentCode.substring(0, idx) + value + currentCode.substring(idx + 1);

                  dispatch(setFormData({ code: updated }));
                }}
              />
            ))}
          </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 rounded-lg font-medium transition ${
                isLoading
                  ? "bg-gray-400 text-white cursor-not-allowed"
                  : "bg-black text-white hover:bg-gray-900"
              }`}
            >
              {isLoading ? "Verifying..." : "Verify Code"}
            </button>

            <button
              type="button"
              onClick={handleSendCode}
              className="w-full text-sm text-gray-600 hover:underline mt-2"
            >
              Resend Code
            </button>
          </form>
        </div>
      )}  
    </div>
  );
}
