import React from 'react'
import { MdOutlineDone } from "react-icons/md";
import { Link } from 'react-router-dom';

const Done = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-6">
      <div className="text-6xl text-green-500 flex items-center justify-center border-[5px] border-green-500 rounded-full p-4">
        <MdOutlineDone size={100} />
      </div>
      <p className="text-2xl font-bold">You're logged in</p>
      <p className="text-base text-gray-500">You're now logged into Faishion</p>
      <Link to="https://www.faishion.ai/howitworks" className="w-[180px] py-2.5 mt-2 btn-primary rounded-md text-black">
        <p className="text-center">How It Works</p>
      </Link>
    </div>
  )
}

export default React.memo(Done);