// src/components/auth/PasswordSignupForm.tsx
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store/store";
import { setAuthMethod, setError, setFormData } from "@/store/features/authSlice";
import {
  calculatePasswordStrength,
  getPasswordStrengthColor,
  getPasswordStrengthText,
  validateEmail,
} from "@/utils/validation";
import { useState } from "react";
import { signupSchema } from "@/types/auth";
import z from "zod";

interface PasswordSignupFormProps {
  handleSubmit: () => Promise<void> | void;
  isLoading: boolean;
}

export default function PasswordSignupForm({
  handleSubmit,
  isLoading,
}: PasswordSignupFormProps) {
  const dispatch = useDispatch();
  const { formData, error } = useSelector((state: RootState) => state.auth);
  const [strength, setStrength] = useState(0);
  const [errors, setErrors] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    referralCode: "",
  });

  const validateForm = () => {
    try {
    signupSchema.parse(formData);
    // Clear field-level errors
    setErrors({
        email: "",
        password: "",
        confirmPassword: "",
        referralCode: "",
    });
    return true;
      } catch (err) {
        console.log("erros")
      if (err instanceof z.ZodError) {
          const newErrors = {
          email: "",
          password: "",
          confirmPassword: "",
          referralCode: "",
          };
          err.errors.forEach((e) => {
          const field = e.path[0] as keyof typeof newErrors;
          newErrors[field] = e.message;
          });
          setErrors(newErrors);
      }
    return false;
    }
   };
  
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    dispatch(setFormData({ [name]: value }));
    dispatch(setError(null));

    //  Real-time email validation
    if (name === "email") {
      if (value.trim() && !validateEmail(value)) {
        setErrors((prev) => ({ ...prev, email: "Please enter a valid email address" }));
      } else {
        setErrors((prev) => ({ ...prev, email: "" }));
      }
    }
    //  Real-time password strength
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

    // Real-time confirm password match check
    if (name === "confirmPassword") {
      setErrors((prev) => ({
        ...prev,
        confirmPassword:
          value && value !== formData.password ? "Passwords do not match" : "",
      }));
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!validateForm()) return;
      await handleSubmit();
    };

  return (
    <>
      <form onSubmit={onSubmit} className="space-y-4">
        {/* Email */}
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Email"
          className="w-full border border-gray-300 rounded-lg px-4 py-2"
          required
        />
         {errors.email && (
        <p className="text-red-500 text-xs mt-1">{errors.email}</p>
        )}
        {/* Password */}
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Password"
          className="w-full border border-gray-300 rounded-lg px-4 py-2"
          required
        />
        {errors.password && (
        <p className="text-red-500 text-xs mt-1">{errors.password}</p>
      )}

      {/* Confirm Password */}
      <input
        type="password"
        name="confirmPassword"
        value={formData.confirmPassword}
        onChange={handleChange}
        placeholder="Confirm Password"
        className="w-full border border-gray-300 rounded-lg px-4 py-2"
        required
      />

      {errors.confirmPassword && (
      <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-900 transition"
      >
        {isLoading ? "Submitting..." : "Sign Up"}
      </button>
      </form>

      <p
        onClick={() => {dispatch(setError(null)); dispatch(setAuthMethod("link"))}}
        className="text-center text-sm mt-5 text-gray-600 cursor-pointer hover:underline"
      >
        Use email link instead
      </p>
    </>
  );
}
