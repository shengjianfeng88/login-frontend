// src/components/auth/PasswordLoginForm.tsx
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store/store";
import { setAuthMethod, setError, setFormData } from "@/store/features/authSlice";
import { validateEmail } from "@/utils/validation";
import { useState } from "react";
import { signInSchema } from "@/types/auth";
import { z } from "zod";
import { Link } from "react-router-dom";

interface PasswordLoginFormProps {
  handleSubmit: () => Promise<void> | void;
}

export default function PasswordLoginForm({
  handleSubmit,
}: PasswordLoginFormProps) {
  const dispatch = useDispatch();
  const { formData, error, isLoading } = useSelector((state: RootState) => state.auth);
  const [rememberMe, setRememberMe] = useState<boolean>(false)
  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });

  /** Validate the login form using Zod */
  const validateForm = () => {
    try {
      signInSchema.parse(formData);
      setErrors({ email: "", password: "" });
      dispatch(setError(null));
      return true;
    } catch (err) {
      console.log(err)
      if (err instanceof z.ZodError) {
        const newErrors = { email: "", password: "" };
        err.errors.forEach((e) => {
          const field = e.path[0] as keyof typeof newErrors;
          newErrors[field] = e.message;
        });
        setErrors(newErrors);
        dispatch(setError("Please correct the highlighted fields."));
      }
      return false;
    }
  };

  /** ✅ 2. Handle input change with local + global updates */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    dispatch(setFormData({ [name]: value }));
    dispatch(setError(null)); // clear any previous global error

    // Real-time email validation
    if (name === "email") {
      if (value.trim() && !validateEmail(value)) {
        setErrors((prev) => ({
          ...prev,
          email: "Please enter a valid email address",
        }));
      } else {
        setErrors((prev) => ({ ...prev, email: "" }));
      }
    }
  };

  /**3. Form submit handler */
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
          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-black/70 hover:border-gray-400 transition"
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
          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-black/70 hover:border-gray-400 transition"
          required
        />
        {errors.password && (
          <p className="text-red-500 text-xs mt-1">{errors.password}</p>
        )}
        {/* Remember me and Forgot password */}
          <div className="relative mb-4 w-full">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={() => setRememberMe(!rememberMe)}
                className="w-[14px] h-[14px] border-[0.5px] border-[#A6A6A6] rounded-[2px]"
              />
              <label
                htmlFor="remember"
                className="ml-2 text-xs font-medium text-[#A6A6A6]"
              >
                Remember me
              </label>
            </div>
            <Link
              to="/forgot-password"
              className="text-xs font-bold text-[#2F2F2F] underline absolute right-0 top-0"
            >
              Forgot your password?
            </Link>
          </div>
        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-900 transition"
        >
          {isLoading ? "Signing in..." : "Sign In"}
        </button>
      </form>

      <p
        onClick={() => {
          dispatch(setError(null));
          dispatch(setAuthMethod("code"));
        }}
        className="text-center text-sm mt-5 text-gray-600 cursor-pointer hover:underline"
      >
        Use email link instead
      </p>
    </>
  );
}
