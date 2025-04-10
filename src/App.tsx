import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { Suspense } from "react";
import PageNotFound from "./pages/PageNotFound";
import SignIn from "./pages/SignIn";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import { Provider } from "react-redux";
import { store } from "./store/store";
import { GoogleOAuthProvider } from "@react-oauth/google";
import SignUp from "./pages/SignUp";
import Done from "./pages/Done";
import History from "./pages/History";

function App() {
  const googleClientId =
    "261406484674-gi5ric620ka8oijufm3bp6ng6jeuvdn1.apps.googleusercontent.com";
  return (
    <Provider store={store}>
      <GoogleOAuthProvider clientId={googleClientId!}>
        <Router basename="/">
          <Suspense
            fallback={
              <div className="w-screen h-screen bg-white text-white flex items-center justify-center"></div>
            }
          >
            <Routes>
              <Route path="/signin" element={<SignIn />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/done" element={<Done />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route
                path="/reset-password/:token"
                element={<ResetPassword />}
              />
              <Route path="/tryon-history" element={<History />} />
              <Route path="*" element={<PageNotFound />} />
            </Routes>
          </Suspense>
        </Router>
      </GoogleOAuthProvider>
    </Provider>
  );
}

export default App;
