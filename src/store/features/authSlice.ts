// src/store/features/authSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { LoginFormData, SignupFormData } from "@/types/auth";

// ─────────────────────────────
// 1️⃣  Define the types
// ─────────────────────────────

// Which page the user is on (sign up or login)
export type AuthMode = "signup" | "login";

// Which authentication method the user chose
export type AuthMethod = "link" | "password" | "code";


// Which step the user is currently seeing
export type AuthState = "form" | "sent" | "error";

export type AuthFormData = SignupFormData | LoginFormData;

// Shape of the Redux slice state
interface AuthSliceState {
  formData: {
    email: string;
    password?: string;
    confirmPassword?: string;
    referralCode?: string;
    code?: string | null;
  };
  authMode: AuthMode;
  authMethod: "password" | "link" | "code";
  authState: AuthState;
  isLoading: boolean;
  error: string | null;
}

// ─────────────────────────────
// 2️⃣  Define the initial state
// ─────────────────────────────
const initialState: AuthSliceState = {
  formData: {
    email: "",
    password: "",
    confirmPassword: "",
    referralCode: "",
    code: "",   
  },
  authMode: "signup",
  authMethod: "link",
  authState: "form",
  isLoading: false,
  error: null,
};

// ─────────────────────────────
// 3️⃣  Create the slice
// ─────────────────────────────
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // Update form fields
    setFormData: (state, action: PayloadAction<Partial<AuthFormData>>) => {
      state.formData = { ...state.formData, ...action.payload };
    },

    // Switch between password or link method
    setAuthMethod: (state, action: PayloadAction<AuthMethod>) => {
      state.authMethod = action.payload;
    },

    // Switch between signup or login tab
    setAuthMode: (state, action: PayloadAction<AuthMode>) => {
      state.authMode = action.payload;
      state.authState = "form"; // reset view
      state.error = null;
    },

    // Change UI step (form → sent → error)
    setAuthState: (state, action: PayloadAction<AuthState>) => {
      state.authState = action.payload;
    },

    // Control loading flag
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    // Update or clear error
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },

    // Reset everything
    resetAuth: () => initialState,
  },
});

// ─────────────────────────────
//  Export actions & reducer
// ─────────────────────────────
export const {
  setFormData,
  setAuthMethod,
  setAuthMode,
  setAuthState,
  setLoading,
  setError,
  resetAuth,
} = authSlice.actions;

export default authSlice.reducer;
