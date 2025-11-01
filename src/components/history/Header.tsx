import React from 'react';
import { IoSearchOutline } from "react-icons/io5";
import Auth from './Auth';

interface HeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const Header: React.FC<HeaderProps> = ({ searchQuery, setSearchQuery }) => {
  return (
    <header className='flex items-center justify-between px-10 py-2.5 border-b border-gray-200'>
      <div className='flex items-center gap-2'>
        <p className='text-xl font-bold'>fAIshion.ai</p>
      </div>
      <div className='flex items-center gap-2'>
        <div className='flex items-center gap-2 border border-gray-300 focus-within:border-black focus-within:shadow-md focus-within:border-[2px] rounded-md px-2 py-1.5 w-[400px]'>
          <IoSearchOutline size={15} className='text-gray-500' />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder='Search your try-on history...'
            className='w-full h-[30px] rounded-md border-none outline-none text-sm'
          />
        </div>
      </div>
      <Auth />
    </header>
  );
};

export default React.memo(Header);