import React, { useEffect, useState, Fragment } from 'react';
import { Camera, Heart, ChevronDown, X, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Menu, Transition } from '@headlessui/react';
import empty from '/empty.png';
import axios from 'axios';

const TryOnSubHeader: React.FC<{
  onSortChange: (order: 'low-to-high' | 'high-to-low') => void;
  showOnlyFavorites: boolean;
  setShowOnlyFavorites: (val: boolean) => void;
}> = ({ onSortChange, showOnlyFavorites, setShowOnlyFavorites }) => {
  return (
    <div className="flex items-center justify-between px-10 mt-4 mb-8 border-b pb-4">
      <div className="flex items-center gap-2 text-2xl font-bold text-gray-800">
        <Camera className="w-6 h-6" />
        <span>Try-on History</span>
      </div>
      <div className="flex items-center gap-4">
        <button
          onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
          className={`flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg transition ${
            showOnlyFavorites ? 'bg-red-100 text-red-600 border-red-300' : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <Heart className={`w-4 h-4 ${showOnlyFavorites ? 'fill-red-500 text-red-500' : ''}`} />
          Favorites
        </button>

        <Menu as="div" className="relative inline-block text-left">
          <Menu.Button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition">
            Sort By
            <ChevronDown className="w-4 h-4" />
          </Menu.Button>
          <Transition
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items className="absolute right-0 z-[9999] mt-2 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">

              <div className="py-1">
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={() => onSortChange('low-to-high')}
                      className={`${
                        active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                      } block px-4 py-2 text-sm w-full text-left`}
                    >
                      Price: Low to High
                    </button>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={() => onSortChange('high-to-low')}
                      className={`${
                        active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                      } block px-4 py-2 text-sm w-full text-left`}
                    >
                      Price: High to Low
                    </button>
                  )}
                </Menu.Item>
              </div>
            </Menu.Items>
          </Transition>
        </Menu>
      </div>
    </div>
  );
};

interface ProductProps {
  image: string;
  brand: string;
  name: string;
  price: number | string;
  currency?: string;
  originalPrice?: number | string | null;
  timestamp: string | number | Date;
  url: string;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onDelete: () => void;
  imageCount: number;
}

const ProductCard: React.FC<ProductProps> = ({
  image,
  brand,
  name,
  price,
  currency,
  originalPrice,
  timestamp,
  isFavorite,
  onToggleFavorite,
  onDelete,
  imageCount
}) => (
  <div className="relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition cursor-pointer flex flex-col h-full">
    {/* Favorite Button */}
    <div
      onClick={(e) => {
        e.stopPropagation();
        onToggleFavorite();
      }}
      className="absolute top-2 right-2 z-10 cursor-pointer p-1 rounded-full bg-white shadow hover:bg-gray-100"
    >
      <Heart className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
    </div>

    {/* Delete Button */}
    <div
      onClick={(e) => {
        e.stopPropagation();
        onDelete();
      }}
      className="absolute bottom-2 right-2 z-10 cursor-pointer p-1 hover:bg-red-50 rounded transition-colors"
    >
      <Trash2 className="w-5 h-5 text-red-500 hover:text-red-600" />
    </div>

{/* Timestamp Badge */}
    <div className="absolute top-2 left-2 bg-gray-100 text-xs px-2 py-1 rounded z-10 text-gray-600">
      {new Date(timestamp).toLocaleDateString()}
    </div>

    {/* Image Count Badge */}
    {imageCount > 1 && (
      <div className="absolute top-10 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded z-10 font-medium">
        {imageCount} images
      </div>
    )}

    {/* Image */}
    <div className="w-full h-72 bg-white flex items-center justify-center rounded-t-2xl">
      <img src={image} alt="Product" className="h-full object-contain" />
    </div>

    {/* Product Details */}
    <div className="p-4 flex flex-col justify-between flex-grow">
      <p className="text-gray-500 text-xs uppercase tracking-wide font-medium mb-1">{brand}</p>
      <p className="text-lg font-semibold text-gray-900 truncate">{name}</p>
      <div className="flex items-center gap-2 mt-2">
        <span className="text-lg font-bold text-black">{currency}{price}</span>
        {/* Uncomment if showing original price
        {originalPrice && <span className="text-sm text-gray-400 line-through">{originalPrice}</span>} 
        */}
      </div>
    </div>
  </div>
);

// Image Slider Component
const ImageSlider: React.FC<{
  images: { url: string; timestamp: string | number | Date; recordId: string }[];
  currentIndex: number;
  onIndexChange: (index: number) => void;
  onDeleteImage?: (recordId: string) => void;
}> = ({ images, currentIndex, onIndexChange, onDeleteImage }) => {
  const goToPrevious = () => {
    onIndexChange(currentIndex === 0 ? images.length - 1 : currentIndex - 1);
  };

  const goToNext = () => {
    onIndexChange(currentIndex === images.length - 1 ? 0 : currentIndex + 1);
  };

  return (
    <div className="relative">
      <div className="w-full h-96 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden relative">
        <img
          src={images[currentIndex].url}
          alt="Product"
          className="w-full h-full object-contain"
        />
        
        {/* Delete Button for Individual Image */}
        {onDeleteImage && (
          <div
            onClick={(e) => {
              e.stopPropagation();
              onDeleteImage(images[currentIndex].recordId);
            }}
            className="absolute bottom-4 right-4 z-10 cursor-pointer p-2 hover:bg-red-50 rounded-full bg-white shadow-lg hover:shadow-xl transition-all"
          >
            <Trash2 className="w-5 h-5 text-red-500 hover:text-red-600" />
          </div>
        )}
      </div>
      
      {images.length > 1 && (
        <>
          {/* Navigation Arrows */}
          <button
            onClick={goToPrevious}
            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>

          {/* Dots Indicator */}
          <div className="flex justify-center mt-4 gap-2">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => onIndexChange(index)}
                className={`w-2 h-2 rounded-full transition ${
                  index === currentIndex ? 'bg-blue-500' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>

          {/* Image Counter */}
          <div className="absolute top-2 right-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
            {currentIndex + 1} / {images.length}
          </div>
        </>
      )}

      {/* Timestamp for current image */}
      <p className="text-gray-500 text-sm mt-2 text-center">
        Try-on date: {new Date(images[currentIndex].timestamp).toLocaleDateString()}
      </p>
    </div>
  );
};

// Delete Confirmation Modal Component
const DeleteConfirmationModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  productName: string;
  isDeleting: boolean;
  deleteAll: boolean;
  imageCount: number;
}> = ({ isOpen, onClose, onConfirm, productName, isDeleting, deleteAll, imageCount }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-red-100 rounded-full">
            <Trash2 className="w-6 h-6 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Delete Try-on</h3>
        </div>
        
        <p className="text-gray-600 mb-6">
          {deleteAll 
            ? `Are you sure you want to delete all ${imageCount} try-on${imageCount > 1 ? 's' : ''} for "${productName}"? This action cannot be undone.`
            : `Are you sure you want to delete "${productName}" from your try-on history? This action cannot be undone.`
          }
        </p>
        
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 flex items-center gap-2"
          >
            {isDeleting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Deleting...
              </>
            ) : (
              'Delete'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

interface ProductItem {
  record_id: string;
  result_image_url: string;
  timestamp: string | number | Date;
  product_info?: {
    brand_name?: string;
    product_name?: string;
    name?: string;
    price?: number | string;
    currency?: string;
    product_url?: string;
    url?: string;
    isValid?: boolean; // Added isValid property (if needed in product_info)
  };
  isValid?: boolean; // <-- Add this line to match API response
}

interface GroupedProduct {
  productUrl: string;
  productInfo: ProductItem['product_info'];
  images: Array<{
    url: string;
    timestamp: string | number | Date;
    recordId: string;
  }>;
  latestTimestamp: string | number | Date;
}

interface ContentProps {
  searchQuery: string;
}

const Content: React.FC<ContentProps> = ({ searchQuery }) => {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<GroupedProduct | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [sortOrder, setSortOrder] = useState<'low-to-high' | 'high-to-low' | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    product: GroupedProduct | null;
    isDeleting: boolean;
  }>({
    isOpen: false,
    product: null,
    isDeleting: false
  });
  
  const [deleteImageModal, setDeleteImageModal] = useState<{
    isOpen: boolean;
    recordId: string | null;
    isDeleting: boolean;
  }>({
    isOpen: false,
    recordId: null,
    isDeleting: false
  });
  
  const accessToken = localStorage.getItem('accessToken');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const [hasMore, setHasMore] = useState(true);

  // Fetch and append products
  const fetchHistory = async (page: number, append = false) => {
    try {
      const skip = (page - 1) * pageSize;
      const url = `https://tryon-history.faishion.ai/history?limit=${pageSize}&skip=${skip}`;
      // const url = `/history?limit=${pageSize}&skip=${skip}`;
      const res = await axios.get<ProductItem[]>(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      console.log("res", res.data);
      const filtered = res.data.filter(p => p.product_info && p.isValid === true);
      // const filtered = [
      //     {
      //         "isValid": true,
      //         "product_info": {
      //             "brand_name": "Nike",
      //             "currency": "$",
      //             "domain": "www.nike.com",
      //             "price": 100.0,
      //             "product_name": "Nike Pro Women s Mid-Rise 3  Mesh-Paneled Shorts",
      //             "product_url": "https://www.nike.com/t/pro-womens-mid-rise-3-mesh-paneled-shorts-J3NKSd/FN3336-634"
      //         },
      //         "record_id": "687976211f9f9deb30c7e4c6",
      //         "result_image_url": "https://faishionai.s3.amazonaws.com/tryon-results/1752790508.png",
      //         "timestamp": "2025-07-17T22:16:01.305000",
      //         "user_email": "info.faishion@gmail.com",
      //         "user_id": "682e58d3b329b52413d8d4df"
      //     },
      //     {
      //         "isValid": true,
      //         "product_info": {
      //             "brand_name": "TOPGH",
      //             "currency": "$",
      //             "domain": "www.amazon.com",
      //             "price": 52.99,
      //             "product_name": "Womens Pant Suit Velvet 2 pcs Peak Lapel Double Breasted Women s Suiting for Work Professional",
      //             "product_url": "https://www.amazon.com/dp/B0BLXWVYQ9/ref=sspa_dk_detail_6?pf_rd_p=7446a9d1-25fe-4460-b135-a60336bad2c9&pf_rd_r=QC55GDWMRMNZFEQ8FMJ3&pd_rd_wg=oVZ5l&pd_rd_w=eMDUh&content-id=amzn1.sym.7446a9d1-25fe-4460-b135-a60336bad2c9&pd_rd_r=56bd9c49-98f6-4a41-8c17-d9221d2b0256&sp_csd=d2lkZ2V0TmFtZT1zcF9kZXRhaWw&th=1&psc=1"
      //         },
      //         "record_id": "687948291f9f9deb30c7e4b0",
      //         "result_image_url": "https://faishionai.s3.amazonaws.com/tryon-results/1752778704.png",
      //         "timestamp": "2025-07-17T18:59:53.760000",
      //         "user_email": "info.faishion@gmail.com",
      //         "user_id": "682e58d3b329b52413d8d4df"
      //     },
      //     {
      //         "isValid": true,
      //         "product_info": {
      //             "brand_name": "TOPGH",
      //             "currency": "$",
      //             "domain": "www.amazon.com",
      //             "price": 52.99,
      //             "product_name": "Womens Pant Suit Velvet 2 pcs Peak Lapel Double Breasted Women s Suiting for Work Professional",
      //             "product_url": "https://www.amazon.com/dp/B0DKHHHZQK/ref=sspa_dk_detail_6?pf_rd_p=7446a9d1-25fe-4460-b135-a60336bad2c9&pf_rd_r=QC55GDWMRMNZFEQ8FMJ3&pd_rd_wg=oVZ5l&pd_rd_w=eMDUh&content-id=amzn1.sym.7446a9d1-25fe-4460-b135-a60336bad2c9&pd_rd_r=56bd9c49-98f6-4a41-8c17-d9221d2b0256&sp_csd=d2lkZ2V0TmFtZT1zcF9kZXRhaWw&th=1&psc=1"
      //         },
      //         "record_id": "687947721f9f9deb30c7e4ad",
      //         "result_image_url": "https://faishionai.s3.amazonaws.com/tryon-results/1752778467.png",
      //         "timestamp": "2025-07-17T18:56:50.873000",
      //         "user_email": "info.faishion@gmail.com",
      //         "user_id": "682e58d3b329b52413d8d4df"
      //     },
      //     {
      //         "isValid": true,
      //         "product_info": {
      //             "brand_name": "LEWIJO",
      //             "currency": "$",
      //             "domain": "www.amazon.com",
      //             "price": 84.99,
      //             "product_name": "Elegant Pant Suits for Women Dressy 2 Piece Womens Suit with Belt Casual Shawl Collar Prom Tuxedo for Wedding Guest",
      //             "product_url": "https://www.amazon.com/dp/B0F8HQ2VD4/ref=sspa_dk_detail_4?psc=1&pd_rd_i=B0F8HQ2VD4&pd_rd_w=FdYA8&content-id=amzn1.sym.7446a9d1-25fe-4460-b135-a60336bad2c9&pf_rd_p=7446a9d1-25fe-4460-b135-a60336bad2c9&pf_rd_r=DNQC5DJEMP4GDRWQYEXZ&pd_rd_wg=EMnrv&pd_rd_r=745d00e8-aade-4a88-97db-8b6084a3825e&sp_csd=d2lkZ2V0TmFtZT1zcF9kZXRhaWw"
      //         },
      //         "record_id": "6879470d1f9f9deb30c7e4ab",
      //         "result_image_url": "https://faishionai.s3.amazonaws.com/tryon-results/1752778397.png",
      //         "timestamp": "2025-07-17T18:55:09.834000",
      //         "user_email": "info.faishion@gmail.com",
      //         "user_id": "682e58d3b329b52413d8d4df"
      //     },
      //     {
      //         "isValid": true,
      //         "product_info": {
      //             "brand_name": "TOPGH",
      //             "currency": "$",
      //             "domain": "www.amazon.com",
      //             "price": 79.99,
      //             "product_name": "Womens Pant Suit Velvet 2 pcs Peak Lapel Double Breasted Women s Suiting for Work Professional",
      //             "product_url": "https://www.amazon.com/dp/B0BLXYH4ZT/ref=sspa_dk_detail_6?pf_rd_p=7446a9d1-25fe-4460-b135-a60336bad2c9&pf_rd_r=QC55GDWMRMNZFEQ8FMJ3&pd_rd_wg=oVZ5l&pd_rd_w=eMDUh&content-id=amzn1.sym.7446a9d1-25fe-4460-b135-a60336bad2c9&pd_rd_r=56bd9c49-98f6-4a41-8c17-d9221d2b0256&sp_csd=d2lkZ2V0TmFtZT1zcF9kZXRhaWw&th=1&psc=1"
      //         },
      //         "record_id": "687946d81f9f9deb30c7e4aa",
      //         "result_image_url": "https://faishionai.s3.amazonaws.com/tryon-results/1752778389.png",
      //         "timestamp": "2025-07-17T18:54:16.490000",
      //         "user_email": "info.faishion@gmail.com",
      //         "user_id": "682e58d3b329b52413d8d4df"
      //     },
      //     {
      //         "isValid": true,
      //         "product_info": {
      //             "brand_name": "HMYDPH",
      //             "currency": "$",
      //             "domain": "www.amazon.com",
      //             "price": 49.99,
      //             "product_name": "Womens Suit 2 Piece Slim Fit Outfits Suits Professional Blazer with Pants Dressy Casual Suiting Business Office Sets for Work",
      //             "product_url": "https://www.amazon.com/dp/B0DX1VY9NN/ref=sspa_dk_detail_6?pd_rd_i=B0DX1VY9NN&pd_rd_w=eMDUh&content-id=amzn1.sym.7446a9d1-25fe-4460-b135-a60336bad2c9&pf_rd_p=7446a9d1-25fe-4460-b135-a60336bad2c9&pf_rd_r=QC55GDWMRMNZFEQ8FMJ3&pd_rd_wg=oVZ5l&pd_rd_r=56bd9c49-98f6-4a41-8c17-d9221d2b0256&sp_csd=d2lkZ2V0TmFtZT1zcF9kZXRhaWw&th=1&psc=1"
      //         },
      //         "record_id": "687946a41f9f9deb30c7e4a9",
      //         "result_image_url": "https://faishionai.s3.amazonaws.com/tryon-results/1752778283.png",
      //         "timestamp": "2025-07-17T18:53:24.787000",
      //         "user_email": "info.faishion@gmail.com",
      //         "user_id": "682e58d3b329b52413d8d4df"
      //     },
      //     {
      //         "isValid": true,
      //         "product_info": {
      //             "brand_name": "DXSHCV",
      //             "currency": "$",
      //             "domain": "www.amazon.com",
      //             "price": 52.99,
      //             "product_name": "Womens Tuxedo 3 Piece Suit Sets for Women Blazer Pants Vest Set Womens Business Professional Outfits",
      //             "product_url": "https://www.amazon.com/dp/B0DPKP6H7N/ref=sspa_dk_detail_4?pd_rd_i=B0DPKP65BH&pd_rd_w=S6Zyf&content-id=amzn1.sym.bbb3fb5e-28ad-4062-a3ba-1f7b9f2e4371&pf_rd_p=bbb3fb5e-28ad-4062-a3ba-1f7b9f2e4371&pf_rd_r=J63JTQ48NV2EHGRR4188&pd_rd_wg=dBlFE&pd_rd_r=6ef3a0cb-f9da-4376-9880-fd92a7c3c07a&sp_csd=d2lkZ2V0TmFtZT1zcF9kZXRhaWxfdGhlbWF0aWM&th=1&psc=1"
      //         },
      //         "record_id": "6879466f1f9f9deb30c7e4a8",
      //         "result_image_url": "https://faishionai.s3.amazonaws.com/tryon-results/1752778273.png",
      //         "timestamp": "2025-07-17T18:52:31.120000",
      //         "user_email": "info.faishion@gmail.com",
      //         "user_id": "682e58d3b329b52413d8d4df"
      //     },
      //     {
      //         "isValid": true,
      //         "product_info": {
      //             "brand_name": "DXSHCV",
      //             "currency": "$",
      //             "domain": "www.amazon.com",
      //             "price": 52.99,
      //             "product_name": "Womens Tuxedo 3 Piece Suit Sets for Women Blazer Pants Vest Set Womens Business Professional Outfits",
      //             "product_url": "https://www.amazon.com/dp/B0DPKPLG3Z/ref=sspa_dk_detail_4?pd_rd_i=B0DPKP65BH&pd_rd_w=S6Zyf&content-id=amzn1.sym.bbb3fb5e-28ad-4062-a3ba-1f7b9f2e4371&pf_rd_p=bbb3fb5e-28ad-4062-a3ba-1f7b9f2e4371&pf_rd_r=J63JTQ48NV2EHGRR4188&pd_rd_wg=dBlFE&pd_rd_r=6ef3a0cb-f9da-4376-9880-fd92a7c3c07a&sp_csd=d2lkZ2V0TmFtZT1zcF9kZXRhaWxfdGhlbWF0aWM&th=1&psc=1"
      //         },
      //         "record_id": "6879459a1f9f9deb30c7e4a5",
      //         "result_image_url": "https://faishionai.s3.amazonaws.com/tryon-results/1752778085.png",
      //         "timestamp": "2025-07-17T18:48:58.277000",
      //         "user_email": "info.faishion@gmail.com",
      //         "user_id": "682e58d3b329b52413d8d4df"
      //     },
      //     {
      //         "isValid": true,
      //         "product_info": {
      //             "brand_name": "DXSHCV",
      //             "currency": "$",
      //             "domain": "www.amazon.com",
      //             "price": 52.99,
      //             "product_name": "Womens Tuxedo 3 Piece Suit Sets for Women Blazer Pants Vest Set Womens Business Professional Outfits",
      //             "product_url": "https://www.amazon.com/dp/B0DPKN495L/ref=sspa_dk_detail_4?pd_rd_i=B0DPKP65BH&pd_rd_w=S6Zyf&content-id=amzn1.sym.bbb3fb5e-28ad-4062-a3ba-1f7b9f2e4371&pf_rd_p=bbb3fb5e-28ad-4062-a3ba-1f7b9f2e4371&pf_rd_r=J63JTQ48NV2EHGRR4188&pd_rd_wg=dBlFE&pd_rd_r=6ef3a0cb-f9da-4376-9880-fd92a7c3c07a&sp_csd=d2lkZ2V0TmFtZT1zcF9kZXRhaWxfdGhlbWF0aWM&th=1&psc=1"
      //         },
      //         "record_id": "687945051f9f9deb30c7e4a3",
      //         "result_image_url": "https://faishionai.s3.amazonaws.com/tryon-results/1752777937.png",
      //         "timestamp": "2025-07-17T18:46:29.989000",
      //         "user_email": "info.faishion@gmail.com",
      //         "user_id": "682e58d3b329b52413d8d4df"
      //     },
      //     {
      //         "isValid": true,
      //         "product_info": {
      //             "brand_name": "elescat",
      //             "currency": "$",
      //             "domain": "www.amazon.com",
      //             "price": 19.99,
      //             "product_name": "Summer Dresses for Women Casual Tshirt Short Sleeve Floral Sundress Beach Cover Ups with Pockets",
      //             "product_url": "https://www.amazon.com/dp/B0CM5QJX4M/ref=sspa_dk_detail_0?psc=1&pd_rd_i=B0CM5QJX4M&pd_rd_w=eJG3s&content-id=amzn1.sym.85ceacba-39b1-4243-8f28-2e014f9512c7&pf_rd_p=85ceacba-39b1-4243-8f28-2e014f9512c7&pf_rd_r=KYV48EME8WFHSCGM68QR&pd_rd_wg=TIvVV&pd_rd_r=5e380851-f3df-4baf-b1aa-76ebec9875ef&sp_csd=d2lkZ2V0TmFtZT1zcF9kZXRhaWxfdGhlbWF0aWM"
      //         },
      //         "record_id": "687943641f9f9deb30c7e49e",
      //         "result_image_url": "https://faishionai.s3.amazonaws.com/tryon-results/1752777500.png",
      //         "timestamp": "2025-07-17T18:39:32.034000",
      //         "user_email": "info.faishion@gmail.com",
      //         "user_id": "682e58d3b329b52413d8d4df"
      //     }
      // ]
      console.log("filtered", filtered);
      if (append) {
        setProducts(prev => [...prev, ...filtered]);
      } else {
        setProducts(filtered);
      }
      setHasMore(filtered.length === pageSize);
    } catch (error) {
      console.error('Error fetching history: ', error);
    } finally {
      setLoading(false);
    }
  };

  // Initial and page change effect
  useEffect(() => {
    setLoading(true);
    fetchHistory(currentPage, currentPage > 1);
    // eslint-disable-next-line
  }, [currentPage]);

  // Reset to first page on search/filter change
  useEffect(() => {
    setCurrentPage(1);
    // Do not call fetchHistory here to avoid duplicate API calls
    // eslint-disable-next-line
  }, [searchQuery, showOnlyFavorites, sortOrder]);

  // Group products by product URL
  const groupedProducts = React.useMemo(() => {
    const grouped = new Map<string, GroupedProduct>();
    
    products.forEach(product => {
      const productUrl = product.product_info?.product_url || product.product_info?.url || 'unknown';
      
      if (grouped.has(productUrl)) {
        const existing = grouped.get(productUrl)!;
        existing.images.push({
          url: product.result_image_url,
          timestamp: product.timestamp,
          recordId: product.record_id
        });
        // Update latest timestamp if this one is newer
        if (new Date(product.timestamp) > new Date(existing.latestTimestamp)) {
          existing.latestTimestamp = product.timestamp;
        }
      } else {
        grouped.set(productUrl, {
          productUrl,
          productInfo: product.product_info,
          images: [{
            url: product.result_image_url,
            timestamp: product.timestamp,
            recordId: product.record_id
          }],
          latestTimestamp: product.timestamp
        });
      }
    });
    
    // Sort images within each group by timestamp (newest first)
    grouped.forEach(group => {
      group.images.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    });
    
    return Array.from(grouped.values());
  }, [products]);

  const toggleFavorite = (productUrl: string) => {
    setFavorites(prev => {
      const updated = new Set(prev);
      if (updated.has(productUrl)) updated.delete(productUrl);
      else updated.add(productUrl);
      return updated;
    });
  };

  const handleDeleteClick = (product: GroupedProduct) => {
    setDeleteModal({
      isOpen: true,
      product,
      isDeleting: false
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.product) return;

    setDeleteModal(prev => ({ ...prev, isDeleting: true }));

    try {
      // Collect all record IDs for this product
      const recordIdsToDelete = deleteModal.product.images.map(image => image.recordId);
      // Send a single POST request to batch-delete endpoint
      await axios.post(
        'https://tryon-history.faishion.ai/history/batch-delete',
        { record_ids: recordIdsToDelete },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      // Remove all deleted records from the local state
      setProducts(prev => prev.filter(p => !recordIdsToDelete.includes(p.record_id)));
      
      // Remove from favorites if it was favorited
      setFavorites(prev => {
        const updated = new Set(prev);
        updated.delete(deleteModal.product!.productUrl);
        return updated;
      });

      // Close the modal
      setDeleteModal({
        isOpen: false,
        product: null,
        isDeleting: false
      });

    } catch (error) {
      console.error('Error deleting product:', error);
      setDeleteModal(prev => ({ ...prev, isDeleting: false }));
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModal({
      isOpen: false,
      product: null,
      isDeleting: false
    });
  };

  const handleDeleteImage = (recordId: string) => {
    setDeleteImageModal({
      isOpen: true,
      recordId,
      isDeleting: false
    });
  };

  const handleDeleteImageConfirm = async () => {
    if (!deleteImageModal.recordId) return;

    setDeleteImageModal(prev => ({ ...prev, isDeleting: true }));

    try {
      await axios.delete(`https://tryon-history.faishion.ai/history/${deleteImageModal.recordId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Remove the deleted record from the local state
      setProducts(prev => prev.filter(p => p.record_id !== deleteImageModal.recordId));
      
      // Update the selected product's images if it's currently open
      if (selectedProduct) {
        const updatedImages = selectedProduct.images.filter(img => img.recordId !== deleteImageModal.recordId);
        if (updatedImages.length === 0) {
          // If no images left, close the modal and remove the entire card
          setShowModal(false);
          setSelectedProduct(null);
          
          // Remove the entire product from the products list
          // Find all record IDs for this product and remove them
          const recordIdsToRemove = selectedProduct.images.map(img => img.recordId);
          setProducts(prev => prev.filter(p => !recordIdsToRemove.includes(p.record_id)));
          
          // Remove from favorites if it was favorited
          setFavorites(prev => {
            const updated = new Set(prev);
            updated.delete(selectedProduct.productUrl);
            return updated;
          });
        } else {
          // Update the selected product with remaining images
          setSelectedProduct({
            ...selectedProduct,
            images: updatedImages
          });
          // Adjust current image index if needed
          if (currentImageIndex >= updatedImages.length) {
            setCurrentImageIndex(updatedImages.length - 1);
          }
        }
      }

      // Close the modal
      setDeleteImageModal({
        isOpen: false,
        recordId: null,
        isDeleting: false
      });

    } catch (error) {
      console.error('Error deleting image:', error);
      setDeleteImageModal(prev => ({ ...prev, isDeleting: false }));
    }
  };

  const handleDeleteImageCancel = () => {
    setDeleteImageModal({
      isOpen: false,
      recordId: null,
      isDeleting: false
    });
  };

  const NoHistory = !loading && groupedProducts.length === 0;

  const filteredProducts = (showOnlyFavorites
    ? groupedProducts.filter(p => favorites.has(p.productUrl))
    : groupedProducts
  ).filter((p) => {
    const info = p.productInfo || {};
    const name = (info.product_name || info.name || '').toLowerCase();
    const brand = (info.brand_name || '').toLowerCase();
    return (
      name.includes(searchQuery.toLowerCase()) ||
      brand.includes(searchQuery.toLowerCase())
    );
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    // Helper function to extract numeric price value
    const extractPriceValue = (priceStr: string | number | undefined): number => {
      if (!priceStr) return 0;
      
      const price = priceStr.toString();
      
      // Handle range format like "USD43-54" - extract the median (midpoint)
      const rangeMatch = price.match(/(\d+)-(\d+)/);
      if (rangeMatch) {
        const lower = parseFloat(rangeMatch[1]);
        const upper = parseFloat(rangeMatch[2]);
        return (lower + upper) / 2; // Return the median (midpoint)
      }
      
      // Handle regular format like "USD530.00" or "GBP439.00"
      const numericMatch = price.match(/(\d+(?:\.\d+)?)/);
      if (numericMatch) {
        return parseFloat(numericMatch[1]);
      }
      
      return 0;
    };
    
    const priceA = extractPriceValue(a.productInfo?.price);
    const priceB = extractPriceValue(b.productInfo?.price);
    
    if (sortOrder === 'low-to-high') return priceA - priceB;
    if (sortOrder === 'high-to-low') return priceB - priceA;
    return 0;
  });

  return (
    <section className="px-10 py-6 min-h-[calc(100vh-150px)] bg-gray-50 mx-auto rounded-md flex flex-col items-center gap-6">
      <div className="max-w-[1280px] w-full">
        {NoHistory ? (
          <div className="flex flex-col items-center justify-center gap-2 mt-20">
            <img src={empty} alt="empty" className="w-24 h-24" />
            <p className="text-gray-600 text-sm">No try-on history found</p>
          </div>
        ) : (
          <>
            <TryOnSubHeader
              onSortChange={setSortOrder}
              showOnlyFavorites={showOnlyFavorites}
              setShowOnlyFavorites={setShowOnlyFavorites}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 w-full">
              {sortedProducts.map(item => {
                const info = item.productInfo || {};
                return (
                  <div
                    key={item.productUrl}
                    onClick={() => {
                      setSelectedProduct(item);
                      setCurrentImageIndex(0);
                      setShowModal(true);
                    }}
                  >
                    <ProductCard
                      image={item.images[0].url} // Show the latest image
                      brand={info.brand_name || 'Unknown'}
                      name={info.product_name || info.name || 'Product Name'}
                      price={info.price || 'N/A'}
                      currency={info.currency}
                      originalPrice={129.0}
                      timestamp={item.latestTimestamp}
                      url={item.productUrl}
                      isFavorite={favorites.has(item.productUrl)}
                      onToggleFavorite={() => toggleFavorite(item.productUrl)}
                      onDelete={() => handleDeleteClick(item)}
                      imageCount={item.images.length}
                    />
                  </div>
                );
              })}
            </div>
          </>
        )}
        {/* Load More Button */}
        {hasMore && !loading && products.length > 0 && (
          <div className="flex justify-center items-center mt-8">
            <button
              className="px-6 py-3 bg-[#6C5DD3] text-white rounded font-semibold hover:bg-[#5746b3] transition"
              onClick={() => {
                setLoading(true);
                setCurrentPage((p) => p + 1);
              }}
            >
              Load More
            </button>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        productName={deleteModal.product?.productInfo?.product_name || deleteModal.product?.productInfo?.name || 'this item'}
        isDeleting={deleteModal.isDeleting}
        deleteAll={true}
        imageCount={deleteModal.product?.images.length || 0}
      />

      {/* Delete Image Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteImageModal.isOpen}
        onClose={handleDeleteImageCancel}
        onConfirm={handleDeleteImageConfirm}
        productName={selectedProduct?.productInfo?.product_name || selectedProduct?.productInfo?.name || 'this try-on image'}
        isDeleting={deleteImageModal.isDeleting}
        deleteAll={false}
        imageCount={1}
      />

      {showModal && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-2xl p-8 max-w-5xl w-full flex gap-8 relative shadow-xl">
            <button
              className="absolute top-4 right-4 text-gray-500 hover:text-black text-xl"
              onClick={() => setShowModal(false)}
            >
              <X className="w-6 h-6" />
            </button>
            <div className="w-1/2">
              <ImageSlider
                images={selectedProduct.images}
                currentIndex={currentImageIndex}
                onIndexChange={setCurrentImageIndex}
                onDeleteImage={handleDeleteImage}
              />
            </div>
            <div className="w-1/2 flex flex-col justify-center gap-4">
              <h2 className="text-2xl font-bold text-gray-900">
                {selectedProduct.productInfo?.brand_name || 'Brand'} -{' '}
                {selectedProduct.productInfo?.product_name || 'Product Name'}
              </h2>
              <div className="flex items-center gap-3">
                <span className="text-2xl font-bold text-black">
                  {selectedProduct.productInfo?.currency}{selectedProduct.productInfo?.price}
                </span>
              </div>
              {selectedProduct.images.length > 1 && (
                <p className="text-blue-600 text-sm font-medium">
                  {selectedProduct.images.length} try-on variations available
                </p>
              )}
              <a
                href={selectedProduct.productUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 text-center w-fit"
              >
                Shop Now
              </a>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default React.memo(Content);