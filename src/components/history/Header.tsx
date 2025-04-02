import React from 'react'
import logo from '/logo.png'
import { IoSearchOutline } from "react-icons/io5";
import { FaAngleDown } from "react-icons/fa6";
import Auth from './Auth';

const Header = () => {
  return (
    <header className='flex items-center justify-between px-10 py-2.5 border-b border-gray-200'>
        <div className='flex items-center gap-2'>
            <img src={logo} alt="logo" className='w-10 h-10 rounded-full' />
            <p className='text-xl font-bold'>fAIshion.AI</p>
        </div>
        <div className='flex items-center gap-2'>
            <div className='flex items-center gap-2 border border-gray-300 focus-within:border-black focus-within:shadow-md focus-within:border-[2px] rounded-md px-2 py-1.5 w-[400px]'>
                <IoSearchOutline size={15} className='text-gray-500' />
                <input type="text" placeholder='Search your try-on history' className='w-full h-[30px] rounded-md border-none outline-none text-sm' />
            </div>
            <div className='flex justify-between items-center gap-2 border border-gray-300 focus-within:border-black focus-within:shadow-md focus-within:border-[2px] rounded-md px-2 py-[11px] w-[200px]'>
              <p className='text-sm font-medium text-gray-800'>Discount</p>
              <FaAngleDown size={15} className='text-gray-500' />
            </div>
        </div>
        <Auth />
    </header>
  )
}

export default React.memo(Header)