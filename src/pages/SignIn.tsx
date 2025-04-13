import React, { useState, useEffect, useRef, useCallback } from 'react';

// import google from "@/public/auth/google.svg";
// import linkedin from "@/public/auth/linkedin.svg";
// import twitter from "@/public/auth/twitter.svg";
import { z } from 'zod';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { GoogleLogin } from '@react-oauth/google';
import { CredentialResponse } from '@react-oauth/google';
import { Link, useNavigate } from 'react-router-dom';
import { sendMessageToExtension } from '@/utils/utils';
import backgroundImage from '@/assets/Background.png';
import image1 from '@/assets/image_1.jpg';
import image2 from '@/assets/image_2.jpg';
import image3 from '@/assets/image_3.jpg';

// Add this type declaration at the top of the file, after the imports
declare global {
  interface Window {
    chrome: typeof chrome;
  }
}

const signInSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const SignIn = () => {
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [activeSlide, setActiveSlide] = useState<number>(0);
  const images = [
    { left: image3, center: image1, right: image2 },
    { left: image1, center: image2, right: image3 },
    { left: image2, center: image3, right: image1 },
  ];
  const carouselRef = useRef<HTMLDivElement>(null);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  //Google remember me password
  const [rememberMe, setRememberMe] = useState(false);

  const changeSlide = useCallback(
    (index: number) => {
      if (!isTransitioning) {
        setIsTransitioning(true);
        setTimeout(() => {
          setActiveSlide(index);
          setTimeout(() => {
            setIsTransitioning(false);
          }, 50);
        }, 200);
      }
    },
    [isTransitioning]
  );

  // Set up autoplay for carousel
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isTransitioning && !isPaused) {
        changeSlide((activeSlide + 1) % 3);
      }
    }, 3000);

    // Clean up the interval on component unmount
    return () => clearInterval(interval);
  }, [activeSlide, isTransitioning, isPaused, changeSlide]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    const data = {
      email: formData.get('email'),
      password: formData.get('password'),
      rememberMe: rememberMe,
    };

    try {
      // Validate form data
      const validatedData = signInSchema.parse(data);
      const apiUrl = 'https://api-auth.faishion.ai';

      // Call login API using axios
      const response = await axios.post(
        apiUrl + '/api/auth/login',
        validatedData
      );

      if (response.data) {
        const accessToken = response.data.accessToken;
        // Store token in localStorage
        localStorage.setItem('accessToken', accessToken);

        // Decode token and log the contents
        const decodedToken = jwtDecode(accessToken);
        console.log('Decoded token:', decodedToken);

        sendMessageToExtension({
          email: '',
          picture: '',
          accessToken: accessToken,
        });

        navigate('/done');
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.errors[0].message);
      } else if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Invalid email or password');
      } else {
        setError('An error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLoginSuccess = async (response: CredentialResponse) => {
    try {
      const token = response.credential;
      const apiUrl = 'https://api-auth.faishion.ai';
      const res = await axios.post(apiUrl + '/api/auth/google-auth', {
        token,
        rememberMe: rememberMe,
      });

      if (res.data) {
        const accessToken = res.data.accessToken;
        // Store token in localStorage
        localStorage.setItem('accessToken', accessToken);

        sendMessageToExtension({
          email: '',
          picture: '',
          accessToken: accessToken,
        });

        navigate('/done');
      }
    } catch (error) {
      console.error('Google authentication failed:', error);
      setError('Google authentication failed. Please try again.');
    }
  };

  const handleError = () => {
    console.log('Google Sign-In was unsuccessful. Try again later.');
  };

  return (
    <main className='min-h-screen'>
      {/* Left side page (for the form) */}

      <div className='flex flex-col md:flex-row h-screen'>
        {/* Left side (for the form) */}
        <div className='w-full md:w-1/2 lg:w-[45%] overflow-auto'>
          <div className='p-4 md:p-8 flex flex-col h-full'>
            {/* Logo area */}
            <Link
              to='https://www.faishion.ai/'
              className='mb-8 md:mb-16 flex items-center'
            >
              <div className='w-9 h-9 rounded-full bg-blue-200 flex items-center justify-center'></div>
              <span className='ml-3 font-bold text-xl text-gray-800'>
                fAIshion.AI
              </span>
            </Link>

            {/* Form content */}
            <div className='w-full max-w-xs mx-auto'>
              {/* Welcome text */}
              <div className='mb-5'>
                <h1 className='font-semibold text-2xl md:text-3xl text-[#2F2F2F]'>
                  Welcome back
                </h1>
                <p className='font-normal text-xs text-[#A6A6A6] mt-1'>
                  Choose one of the options to go.
                </p>
              </div>

              {error && (
                <div className='text-red-500 text-xs mb-3'>{error}</div>
              )}

              <form onSubmit={handleSubmit} className='w-[90%]'>
                {/* Email input */}
                <div className='mb-3'>
                  <input
                    type='email'
                    name='email'
                    placeholder='Email'
                    className='w-full h-10 border border-[#DADCE0] rounded-lg px-4 text-sm'
                    autoComplete='email'
                  />
                </div>

                {/* Password input */}
                <div className='mb-3'>
                  <input
                    type='password'
                    name='password'
                    placeholder='Password'
                    className='w-full h-10 border border-[#DADCE0] rounded-lg px-4 text-sm'
                    autoComplete='current-password'
                  />
                </div>

                {/* Remember me and Forgot password */}
                <div className='relative mb-4 w-full'>
                  <div className='flex items-center'>
                    <input
                      type='checkbox'
                      id='remember'
                      checked={rememberMe}
                      onChange={() => setRememberMe(!rememberMe)}
                      className='w-[14px] h-[14px] border-[0.5px] border-[#A6A6A6] rounded-[2px]'
                    />
                    <label
                      htmlFor='remember'
                      className='ml-2 text-xs font-medium text-[#A6A6A6]'
                    >
                      Remember me
                    </label>
                  </div>
                  <Link
                    to='/forgot-password'
                    className='text-xs font-bold text-[#2F2F2F] underline absolute right-0 top-0'
                  >
                    Forgot your password?
                  </Link>
                </div>

                {/* Login button */}
                <button
                  type='submit'
                  disabled={isLoading}
                  className='w-full h-10 bg-[#2F2F2F] rounded-lg text-white font-bold text-sm flex items-center justify-center'
                >
                  {isLoading ? 'Signing in...' : 'LOGIN'}
                </button>
              </form>

              {/* Or divider */}
              <div className='flex items-center my-4 w-[90%]'>
                <div className='flex-grow h-px bg-[#2E2E2E]'></div>
                <span className='mx-3 text-sm font-medium text-[#2E2E2E]'>
                  or
                </span>
                <div className='flex-grow h-px bg-[#2E2E2E]'></div>
              </div>

              <div className='mb-4 w-[90%]'>
                <GoogleLogin
                  shape='circle'
                  onSuccess={handleGoogleLoginSuccess}
                  onError={handleError}
                  text='continue_with'
                  width='100%'
                  theme='outline'
                  logo_alignment='left'
                  type='standard'
                />
              </div>

              {/* Sign up link */}
              <div className='w-[90%] flex justify-center'>
                <p className='text-xs text-[#A6A6A6]'>
                  Don't have an account?{' '}
                  <Link to='/signup' className='font-bold text-[#2F2F2F]'>
                    Sign up
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right side (for the picture and other stuff) */}
        <div
          className='hidden md:block w-1/2 lg:w-[55%] relative'
          style={{
            backgroundImage: `url(${backgroundImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          {/* Carousel container */}
          <div className='absolute top-[40%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-[85%] md:max-w-[90%] lg:max-w-5xl'>
            <div
              ref={carouselRef}
              className='flex items-center justify-center scale-90 md:scale-95 lg:scale-100'
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              {/* Left blurred image */}
              <div className='relative -mr-2 xs:-mr-3 sm:-mr-4 md:-mr-8 lg:-mr-16 z-0'>
                <div className='w-16 xs:w-20 sm:w-28 md:w-36 lg:w-48 h-32 xs:h-40 sm:h-48 md:h-60 lg:h-72 rounded-3xl overflow-hidden opacity-70 blur-[2px]'>
                  <img
                    src={images[activeSlide].left}
                    alt='Fashion model left'
                    className={`w-full h-full object-cover transition-opacity duration-200 ease-in-out ${
                      isTransitioning ? 'opacity-60' : 'opacity-100'
                    }`}
                  />
                </div>
              </div>

              {/* Center focused image */}
              <div className='relative z-10 transition-all duration-300 hover:scale-105'>
                <div className='w-28 xs:w-36 sm:w-44 md:w-56 lg:w-72 h-44 xs:h-56 sm:h-64 md:h-80 lg:h-96 rounded-3xl overflow-hidden shadow-xl transition-all duration-300 hover:shadow-2xl'>
                  <img
                    src={images[activeSlide].center}
                    alt='Fashion model center'
                    className={`w-full h-full object-cover transition-opacity duration-300 ease-in-out 
                    ${isTransitioning ? 'opacity-70' : 'opacity-100'}`}
                  />
                </div>
              </div>

              {/* Right blurred image */}
              <div className='relative -ml-2 xs:-ml-3 sm:-ml-4 md:-ml-8 lg:-ml-16 z-0'>
                <div className='w-16 xs:w-20 sm:w-28 md:w-36 lg:w-48 h-32 xs:h-40 sm:h-48 md:h-60 lg:h-72 rounded-3xl overflow-hidden opacity-70 blur-[2px]'>
                  <img
                    src={images[activeSlide].right}
                    alt='Fashion model right'
                    className={`w-full h-full object-cover transition-opacity duration-200 ease-in-out ${
                      isTransitioning ? 'opacity-60' : 'opacity-100'
                    }`}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Bottom text content - positioned at the very bottom */}
          <div className='absolute bottom-0 px-4 md:px-8 lg:px-16 w-full text-left'>
            <div className='ml-0 md:ml-4 lg:ml-8 pb-4 scale-[0.85] md:scale-90 lg:scale-100 origin-bottom-left'>
              <h2 className='mb-1'>
                <span className='text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-800 block'>
                  Welcome to
                </span>
                <span className='text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 block'>
                  fAIshion.AI
                </span>
              </h2>
              <p className='text-xs sm:text-xs md:text-sm text-gray-600 max-w-lg'>
                Your AI shopping assistant for all apparel brands—try on
                virtually, find your perfect size, and grab the best deals!
              </p>
            </div>

            {/* Pagination dots */}
            <div className='flex justify-center pb-4 md:pb-6 space-x-2'>
              <button
                onClick={() => changeSlide(0)}
                className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full transition-colors duration-300 ${
                  activeSlide === 0 ? 'bg-gray-800' : 'bg-gray-400'
                }`}
                aria-label='Show slide 1'
              ></button>
              <button
                onClick={() => changeSlide(1)}
                className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full transition-colors duration-300 ${
                  activeSlide === 1 ? 'bg-gray-800' : 'bg-gray-400'
                }`}
                aria-label='Show slide 2'
              ></button>
              <button
                onClick={() => changeSlide(2)}
                className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full transition-colors duration-300 ${
                  activeSlide === 2 ? 'bg-gray-800' : 'bg-gray-400'
                }`}
                aria-label='Show slide 3'
              ></button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default SignIn;
