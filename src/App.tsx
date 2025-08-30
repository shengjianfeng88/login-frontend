import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { Suspense } from 'react';
import PageNotFound from './pages/PageNotFound';
import SignIn from './pages/SignIn';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import { Provider } from 'react-redux';
import { store } from './store/store';
import { GoogleOAuthProvider } from '@react-oauth/google';
import SignUp from './pages/SignUp';
import Done from './pages/Done';
import Pricing from './pages/Pricing';
import History from './pages/History';
import VerifyEmail from './pages/VerifyEmail';
import ConfirmRegister from '@/pages/ConfirmRegister';
import AutoTest from './pages/AutoTest/index';
import ChatWidget from './pages/ChatWidget';
import ImageConvertTest from './pages/ImageConvertTest';
import AccountSettings from './pages/AccountSettings';
import Billing from './pages/Billing';
import UpgradePlan from './pages/UpgradePlan';
console.log('environment', 'staging.........');
function App() {
  const googleClientId =
    '261406484674-gi5ric620ka8oijufm3bp6ng6jeuvdn1.apps.googleusercontent.com';
  return (
    <Provider store={store}>
      <GoogleOAuthProvider clientId={googleClientId!}>
        <Router basename='/'>
          <Suspense
            fallback={
              <div className='w-screen h-screen bg-white text-white flex items-center justify-center'></div>
            }
          >
            <Routes>
              <Route path='/signin' element={<SignIn />} />
              <Route path='/signup' element={<SignUp />} />
              <Route path='/done' element={<Done />} />
              <Route path='/forgot-password' element={<ForgotPassword />} />
              <Route path='/reset-password' element={<ResetPassword />} />
              <Route path='/tryon-history' element={<History />} />
              <Route path='/verify-email' element={<VerifyEmail />} />
              <Route path='*' element={<PageNotFound />} />
              <Route path='/confirm-register' element={<ConfirmRegister />} />
              <Route path='/auto-test/*' element={<AutoTest />} />
              <Route path='/faishion-chatbot' element={<ChatWidget />} />
              <Route path='/chat' element={<ChatWidget />} />
              <Route path='/pricing' element={<Pricing />} />
              <Route
                path='/image-convert-test'
                element={<ImageConvertTest />}
              />
              <Route path='/account-settings' element={<AccountSettings />} />
              <Route path='/billing' element={<Billing />} />
              <Route path='/upgrade-plan' element={<UpgradePlan />} />
            </Routes>
          </Suspense>
        </Router>
      </GoogleOAuthProvider>
    </Provider>
  );
}

export default App;
