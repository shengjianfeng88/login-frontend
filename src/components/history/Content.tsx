import React from 'react'
import empty from '/empty.png'
import productImage from '../../assets/model_demo.png' // Replace with actual path

const NoHistory = false // Toggle this to true/false to test

const ProductCard = () => (
  <div className="relative bg-white rounded-xl overflow-hidden shadow-md w-full">
    {/* Discount and Date Tags */}
    <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-md font-semibold z-10">
      20% OFF
    </div>
    <div className="absolute top-2 right-2 bg-gray-200 text-xs px-2 py-1 rounded-md z-10">
      4/10/2024
    </div>

    {/* Product Image */}
    <img src={productImage} alt="Product" className="w-full h-auto" />

    {/* Card Content */}
    <div className="p-4">
      <p className="text-gray-400 text-sm">Zara</p>
      <p className="text-base font-semibold">Floral Print Summer Dress</p>
      <div className="flex items-center gap-2 mt-1">
        <span className="text-lg font-bold">$103.20</span>
        <span className="text-sm text-gray-400 line-through">$129.00</span>
      </div>
    </div>

    {/* Wishlist Icon */}
    <div className="absolute bottom-4 right-4 text-gray-400 text-xl">&#9825;</div>
  </div>
)


const Content = () => {
  return (
    <section className='px-10 py-5 max-w-[1280px] min-h-[calc(100vh-150px)] bg-gray-50 mx-auto rounded-md mt-8 flex flex-col items-center gap-4'>
      {NoHistory ? (
        <>
          <img src={empty} alt="empty" className='w-[100px] h-[100px]' />
          <p className='text-gray-700 text-sm font-medium'>No try-on history found</p>
        </>
      ) : (
        <>
        {/* Header */}
        <div className="flex justify-between items-center w-full px-10 py-6">
          {/* Left: Title + Icon */}
          <div className="flex items-center gap-3">
            <svg
              className="w-5 h-5 text-gray-800"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 5.9a6.1 6.1 0 1 0 0 12.2 6.1 6.1 0 0 0 0-12.2Zm0 10.2a4.1 4.1 0 1 1 0-8.2 4.1 4.1 0 0 1 0 8.2Z" />
              <path d="M20 4h-3.2l-.9-1.3A1 1 0 0 0 15 2h-6a1 1 0 0 0-.9.7L7.2 4H4a2 2 0 0 0-2 2v13a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3V6a2 2 0 0 0-2-2Zm0 15a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7h16Z" />
            </svg>
            <h1 className="text-2xl font-bold text-gray-800">Try-on History</h1>
          </div>

          {/* Right: Favorites + Dropdown */}
          <div className="flex gap-4 items-center">
            <button className="border border-gray-300 text-sm px-4 py-2 rounded-md hover:bg-gray-100">
              Favorites
            </button>
            <select className="border border-gray-300 text-sm px-4 py-2 rounded-md bg-white hover:bg-gray-100">
              <option>Sort By</option>
              <option>Newest</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
            </select>
          </div>
        </div>
        
        <div className="grid grid-cols-4 gap-6 w-full">
          <ProductCard />
          <ProductCard />
          <ProductCard />
          <ProductCard />
          <ProductCard />
        </div>
        </>
      )}
    </section>
  )
}

export default React.memo(Content)
