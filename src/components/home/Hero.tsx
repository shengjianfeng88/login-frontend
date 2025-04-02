import React from 'react'
import MySwiper from './MySwiper'

const Hero = () => {
  return (
    <div className='w-full h-full flex flex-col justify-center items-center mt-32 gap-6 text-center'>
        <h1 className='text-[30px] leading-[40px] md:text-[50px] md:leading-[60px] font-bold font-poppins text-primaryBlack uppercase'>
            Make your spend, well-spent
        </h1>
        <p className='text-[16px] leading-[24px] md:text-[20px] md:leading-[28px] font-normal font-openSans text-primaryBlack'>Updating your wardrobe? Get cashback. When in Japan? Spend in Yen. Big life goals? Reach them faster. However you spend — Revolut is all you need.</p>
        <div className='flex justify-center items-center'>
            <button className='bg-primaryBlack text-white px-6 py-2.5 rounded-full'>Get Started</button>
        </div>
        <div className='w-[80%] h-full mt-6 flex justify-center items-center'>
            <MySwiper />
        </div>
    </div>
  )
}

export default React.memo(Hero)