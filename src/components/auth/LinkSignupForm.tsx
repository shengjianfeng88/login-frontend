import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store/store";
import { setFormData, setAuthMethod, setError } from "@/store/features/authSlice";
import { useState } from "react";
import { signupSchema } from "@/types/auth";
import z from "zod";
import { calculatePasswordStrength, getPasswordStrengthText, validateEmail } from "@/utils/validation";

interface LinkSignupFormProps {
  handleSubmit: () => Promise<void> | void;
  isLoading: boolean;
}

export function LinkSignupForm({ handleSubmit, isLoading }: LinkSignupFormProps) {
  const dispatch = useDispatch();
  const { formData, error } = useSelector((state: RootState) => state.auth);
  const [errors, setErrors] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    referralCode: "",
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const { name, value } = e.target;

  dispatch(setFormData({ [name]: value }));
  dispatch(setError(null));

  // ✅ 3. Real-time email validation
  if (name === "email") {
    if (value.trim() && !validateEmail(value)) {
      setErrors((prev) => ({ ...prev, email: "Please enter a valid email address" }));
    } else {
      setErrors((prev) => ({ ...prev, email: "" }));
    }
  }

  // ✅ 4. Real-time password strength
  if (name === "password") {
    const strength = calculatePasswordStrength(value);
    getPasswordStrengthText(strength);

    // Optional UX: show hint if password too short
    if (value && value.length < 6) {
      setErrors((prev) => ({ ...prev, password: "Password must be at least 6 characters" }));
    } else {
      setErrors((prev) => ({ ...prev, password: "" }));
    }
  }

  // ✅ 5. Real-time confirm password match check
  if (name === "confirmPassword") {
    setErrors((prev) => ({
      ...prev,
      confirmPassword:
        value && value !== formData.password ? "Passwords do not match" : "",
    }));
  }
};

  return (
    <>
      <p className="text-sm text-gray-500 mb-4">
        We’ll send you a sign-up link to your email.
      </p>

      <form onSubmit={onSubmit} className="space-y-4">
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
          className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-900 transition"
        >
          {isLoading ? "Sending..." : "Continue"}
        </button>
      </form> 

      <p
        onClick={() => {dispatch(setAuthMethod("password")); dispatch(setError(null))}}
        className="text-center text-sm mt-5 text-gray-600 cursor-pointer hover:underline"
      >
        Prefer to create a password instead?
      </p>
    </>
  );
}


