'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { FaUserCircle } from 'react-icons/fa';
import { IoMdNotifications } from 'react-icons/io';
import { IoLogOutOutline } from 'react-icons/io5';
import { AiOutlineHeart } from 'react-icons/ai';
import { RiMenuFill } from 'react-icons/ri';
import { RootState } from '@/store/store';
import { logout } from '@/store/features/userSlice';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// Add this type near the profileItems array
export interface ProfileItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

export const profileItems: ProfileItem[] = [
  {
    label: 'Try-on History',
    href: '/tryon-history',
    icon: <AiOutlineHeart className='text-xl' />,
  },
  // {
  //   label: "Profile",
  //   href: "/profile",
  //   icon: <CgProfile className="text-xl" />,
  // },
  // {
  //   label: "Settings",
  //   href: "/settings",
  //   icon: <IoMdSettings className="text-xl" />,
  // },
];

const Auth = () => {
  const user = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const [isMounted, setIsMounted] = useState(false); // Track client-side mount
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMounted(true); // Set to true when the component is mounted on the client
  }, []);
  console.log(user);
  const handleLogout = async () => {
    try {
      const apiUrl = 'https://auth.faishion.ai';

      await axios.get(apiUrl + '/auth/logout', { withCredentials: true });

      // Clear access token from localStorage
      localStorage.removeItem('accessToken');

      // Dispatch logout action to clear user state
      dispatch(logout());

      // Redirect to signin page
      navigate('/signin');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleMenuItemClick = () => {
    setShowMenu(false);
  };

  // Return early if not mounted
  if (!isMounted) {
    return null; // Prevent any SSR-related rendering
  }

  return (
    <div className='flex justify-center items-center gap-5'>
      {user?.email ? (
        <>
          <IoMdNotifications className='text-gray-700 text-3xl cursor-pointer hover:text-primary duration-300 transition-all' />
          <div
            className='relative z-50'
            ref={menuRef}
            onMouseEnter={() => setShowMenu(true)}
            onMouseLeave={() => setShowMenu(false)}
          >
            {!user?.picture ? (
              user?.email ? (
                <RiMenuFill
                  className='text-gray-800 text-3xl cursor-pointer hover:text-primary duration-300 transition-all'
                  size={26}
                />
              ) : (
                <FaUserCircle className='text-gray-800 text-3xl cursor-pointer hover:text-primary duration-300 transition-all' />
              )
            ) : (
              <img
                src={user.picture}
                alt='User'
                width={25}
                height={25}
                className='rounded-full'
              />
            )}
            {showMenu && (
              <div className='absolute right-0 top-full pt-2'>
                <div className='w-48 bg-white rounded-lg shadow-lg py-2'>
                  {profileItems.map((item) => (
                    <Link
                      key={item.label}
                      to={item.href}
                      className='px-4 py-2 text-gray-800 hover:bg-gray-100 flex items-center gap-3'
                      onClick={handleMenuItemClick}
                    >
                      {item.icon}
                      {item.label}
                    </Link>
                  ))}
                  <button
                    className='w-full px-4 py-2 text-gray-800 hover:bg-gray-100 flex items-center gap-3'
                    onClick={() => {
                      handleMenuItemClick();
                      handleLogout();
                    }}
                  >
                    <IoLogOutOutline className='text-xl' />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          <Link
            className='text-black px-4 py-2 border border-black rounded-full font-normal text-sm hover:bg-primary hover:text-black hover:border-primary duration-300 transition-all'
            to='/signin'
          >
            Sign In
          </Link>
          <Link
            className='px-4 py-2 rounded-full bg-black/95 hover:bg-primary text-white font-normal text-sm duration-300 transition-all'
            to='/signup'
          >
            Sign Up
          </Link>
        </>
      )}
    </div>
  );
};

export default Auth;
