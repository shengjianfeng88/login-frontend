import React from 'react'
import empty from '/empty.png'

const Content = () => {
  return (
    <section className='px-10 py-5 max-w-[1280px] h-[calc(100vh-150px)] bg-gray-50 mx-auto rounded-md mt-8 flex flex-col justify-center items-center gap-4'>
        <img src={empty} alt="empty" className='w-[100px] h-[100px]' />
        <p className='text-gray-700 text-sm font-medium'>No try-on history found</p>
    </section>
  )
}

export default React.memo(Content)