import React from 'react'
import { MdAccountCircle } from "react-icons/md";

const Card = ( {image, price, currency, description} : {image: string, price: string, currency: string, description: string} ) => {
  return (
    <div className='relative h-full w-[225px] flex flex-col justify-center items-center'>
        <img className='absolute top-0 left-0 w-full h-full object-cover' src={image} alt="card" />
        <div className='relative z-10 w-full h-full flex justify-center items-center'>
            <div className='flex flex-col gap-2'>
                <p className='text-[25px] leading-[30px] font-bold font-openSans text-white'>{price} {currency}</p>
                <p className='text-[14px] leading-[18px]  font-normal font-openSans text-white'>{description}</p>
            </div> 
        </div>
        <div className='relative z-10 rounded-2xl w-[180px] h-[55px] mb-24 md:mb-10 bg-white flex  items-center justify-between px-3'>
            <MdAccountCircle className='text-primaryBlack' size={30}/>
            <p className='text-[16px] leading-[24px] font-normal font-openSans text-primaryBlack'>{price} {currency}</p>
        </div>
    </div>
  )
}

export default React.memo(Card)