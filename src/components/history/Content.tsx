import React, { useEffect, useState, Fragment, useCallback, useRef } from 'react';
import { Camera, Heart, ChevronDown, X, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Menu, Transition } from '@headlessui/react';
import empty from '/empty.png';
import axios from 'axios';
import { tryonApi } from '../../api/tryon';
import { getApiUrl } from '../../config/api';
import { getAccessToken } from '../../utils/auth';

import { Carousel } from 'antd';
import 'antd/dist/reset.css'; 


  const items = [
    {
      brand: "GARAGE",
      name: "Romantic Lace Midi...",
      price: 11944.0,
      oldPrice: 14900.0,
      discount: "20% OFF",
      img: "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcQmmzp-_kftvTFdH_kuXOQuESvgNvrmdnDFR3FWThEEOHjsbbpUE9pqrr_rjlIDsA7g4O1K2gybieFwiNbTgSeroTiNgySvfuOBV309CjMPnpSIGU4xWruI&usqp=CAc",
    },
    {
      brand: "H&M",
      name: "Elegant Summer Midi",
      price: 59.99,
      oldPrice: 79.99,
      discount: "20% OFF",
      img: "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcTdF5e6eZdypM0O3a1Pe0e-ts6BCLAMPFeJ0ygJQDJqF7P-tDCVkQO1Gzd-6n_BXqH7Efgb5otMNy0j_AL-3YprTNdyePXfJfbOs0pYfVTZfqwszRhCystIkA&usqp=CAc",
    },
    {
      brand: "FASHION NOVA",
      name: "Trina Mini Dress",
      price: 10.0,
      oldPrice: 24.99,
      discount: "20% OFF",
      img: "https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcSAkAsOHUEgR2VTJD162yU-MOYbRO1uD9C1FuxbUBkhXwIbI_sTH5I2rmnvMHndX_Z2V-nRbLWZVrcZHDK2w6GeaHbKHkj8A-z9ouyQHHRZ8MylFGYlSwr-&usqp=CAc",
    },
    {
      brand: "FASHION NOVA",
      name: "Trina Mini Dress",
      price: 10.0,
      oldPrice: 24.99,
      discount: "20% OFF",
      img: "https://images.urbndata.com/is/image/UrbanOutfitters/92036334_060_b?$xlarge$&fit=constrain&fmt=webp&qlt=80&wid=960",
    },
    {
      brand: "FASHION NOVA",
      name: "Trina Mini Dress",
      price: 10.0,
      oldPrice: 24.99,
      discount: "20% OFF",
      img: "https://images.urbndata.com/is/image/UrbanOutfitters/92036334_060_b?$xlarge$&fit=constrain&fmt=webp&qlt=80&wid=960",
    },
  ];

// const SimpleAntdCarousel = () => {
//   return (
//     <div style={{ width: '600px', margin: '20px auto' }}>
//       <h3 style={{ fontWeight: 600, marginBottom: '10px' }}>You May Also Like</h3>

//       <Carousel arrows slidesToShow={3} autoplay>
//         <div><img src="https://images.urbndata.com/is/image/UrbanOutfitters/92036334_060_b?$xlarge$&fit=constrain&fmt=webp&qlt=80&wid=960" style={{ width: '180px', height: '250px', objectFit: 'cover' }} /></div>
//         <div><img src="https://images.urbndata.com/is/image/UrbanOutfitters/92036334_060_b?$xlarge$&fit=constrain&fmt=webp&qlt=80&wid=960" style={{ width: '180px', height: '250px', objectFit: 'cover' }} /></div>
//         <div><img src="https://images.urbndata.com/is/image/UrbanOutfitters/92036334_060_b?$xlarge$&fit=constrain&fmt=webp&qlt=80&wid=960" style={{ width: '180px', height: '250px', objectFit: 'cover' }} /></div>
//       </Carousel>
//     </div>
//   );
// };

// Add DNS prefetch for image domain
const addDnsPrefetch = () => {
  if (typeof document !== 'undefined') {
    const link = document.createElement('link');
    link.rel = 'dns-prefetch';
    link.href = '//faishionai.s3.amazonaws.com';
    document.head.appendChild(link);
  }
};

// Call DNS prefetch on module load
addDnsPrefetch();

// Image URL optimization utility
const getOptimizedImageUrl = (src: string, size: 'thumbnail' | 'medium' | 'large' = 'thumbnail') => {
  if (!src.includes('faishionai.s3.amazonaws.com')) {
    return src; // Return original URL for non-S3 images
  }

  // If S3 doesn't support image optimization parameters, 
  // we can disable URL optimization and rely on CSS + lazy loading
  const USE_URL_OPTIMIZATION = false; // Set to true if your S3 supports image transformation

  if (!USE_URL_OPTIMIZATION) {
    // Just return original URL and let CSS handle the sizing
    console.log('📝 Using original image URL - relying on CSS optimization');
    return src;
  }

  const sizeConfig = {
    thumbnail: { w: 150, h: 150, q: 60 },  // For product cards - more reasonable size
    medium: { w: 400, h: 400, q: 70 },     // For modal previews - more compressed
    large: { w: 800, h: 800, q: 80 }       // For full resolution (if needed)
  };

  const config = sizeConfig[size];

  // Try AWS/CloudFront style parameters
  let params = `w=${config.w}&h=${config.h}&q=${config.q}&f=webp`;
  let optimizedUrl = src.includes('?') ? `${src}&${params}` : `${src}?${params}`;

  // Debug log to check generated URLs
  if (typeof window !== 'undefined' && window.location.hostname.includes('localhost')) {
    console.log(`🖼️ Image optimization attempt:`);
    console.log(`Original: ${src}`);
    console.log(`Optimized (${size}): ${optimizedUrl}`);
  }

  return optimizedUrl;
};

// Smart image preloading hook for modal carousel
const useSmartImagePreloader = (images: string[], currentIndex: number) => {
  const [preloadedImages, setPreloadedImages] = useState<Set<string>>(new Set());

  useEffect(() => {
    const preloadImage = (src: string) => {
      return new Promise<string>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(src);
        img.onerror = () => reject(src);
        img.src = src;
      });
    };

    const preloadNearbyImages = async () => {
      if (images.length === 0) return;

      // Only preload next image to minimize requests
      const indicesToPreload = [];

      // Current image (priority)
      indicesToPreload.push(currentIndex);

      // Next image only (most likely to be viewed next)
      if (images.length > 1) {
        const nextIndex = currentIndex === images.length - 1 ? 0 : currentIndex + 1;
        indicesToPreload.push(nextIndex);
      }

      // Get unique images to preload (use medium size for modal)
      const imagesToPreload = [...new Set(indicesToPreload.map(i => getOptimizedImageUrl(images[i], 'medium')))];

      // Only preload images that haven't been preloaded yet
      const newImages = imagesToPreload.filter(src => !preloadedImages.has(src));

      if (newImages.length === 0) return;

      // Preload one by one instead of parallel to reduce server load
      for (const src of newImages) {
        try {
          await preloadImage(src);
          setPreloadedImages(prev => new Set([...prev, src]));
        } catch (error) {
          console.warn('Image failed to preload:', src);
        }
      }
    };

    preloadNearbyImages();
  }, [images, currentIndex, preloadedImages]);

  return preloadedImages;
};

// Modal-specific optimized image component (always loads immediately)
const ModalOptimizedImage: React.FC<{
  src: string;
  alt: string;
  className?: string;
  isVisible?: boolean; // Whether this image should load immediately
  onLoadStart?: () => void; // Callback when loading starts
  onLoadComplete?: () => void; // Callback when loading completes
}> = ({ src, alt, className = '', isVisible = true, onLoadStart, onLoadComplete }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [imageSrc, setImageSrc] = useState('');

  useEffect(() => {
    if (isVisible && src && imageSrc !== src) {
      setIsLoading(true);
      setHasError(false);
      onLoadStart?.(); // Notify parent that loading started

      // Use medium size for modal images
      const optimizedSrc = getOptimizedImageUrl(src, 'medium');
      setImageSrc(optimizedSrc);
    }
  }, [isVisible, src, imageSrc, onLoadStart]);

  const handleLoad = () => {
    setIsLoading(false);
    onLoadComplete?.(); // Notify parent that loading completed
  };

  const handleError = () => {
    // Fallback to original src if optimized version fails
    if (imageSrc !== src && src.includes('faishionai.s3.amazonaws.com')) {
      setImageSrc(src);
      return;
    }
    setIsLoading(false);
    setHasError(true);
    onLoadComplete?.(); // Notify parent that loading completed (with error)
  };

  if (!isVisible) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 ${className}`}>
        <div className="w-8 h-8 bg-gray-200 rounded"></div>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden bg-gray-100 ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="animate-pulse">
            <div className="w-12 h-12 bg-gray-300 rounded animate-pulse"></div>
          </div>
        </div>
      )}

      {hasError ? (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-400">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-2 bg-gray-300 rounded"></div>
            <span className="text-sm">Failed to load</span>
          </div>
        </div>
      ) : (
        imageSrc && (
          <img
            src={imageSrc}
            alt={alt}
            className={`transition-opacity duration-200 ${isLoading ? 'opacity-0' : 'opacity-100'} ${className}`}
            onLoad={handleLoad}
            onError={handleError}
            loading="eager" // Load immediately for modal images
            decoding="async"
            style={{
              willChange: 'opacity',
              backfaceVisibility: 'hidden',
              transform: 'translateZ(0)',
              imageRendering: 'auto',
            }}
          />
        )
      )}
    </div>
  );
};
const OptimizedImage: React.FC<{
  src: string;
  alt: string;
  className?: string;
  placeholder?: string;
  onLoad?: () => void;
  onError?: () => void;
}> = ({ src, alt, className = '', placeholder, onLoad, onError }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [imageSrc, setImageSrc] = useState('');
  const [shouldLoad, setShouldLoad] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true);
          observer.disconnect(); // Stop observing once we decide to load
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px' // Reduce from 100px to 50px for tighter control
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (shouldLoad && src && !imageSrc) {
      // Use thumbnail size for product cards
      const optimizedSrc = getOptimizedImageUrl(src, 'thumbnail');
      setImageSrc(optimizedSrc);
    }
  }, [shouldLoad, src, imageSrc]);

  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  const handleError = () => {
    // Fallback to original src if optimized version fails
    if (imageSrc !== src && src.includes('faishionai.s3.amazonaws.com')) {
      setImageSrc(src);
      return;
    }
    setIsLoading(false);
    setHasError(true);
    onError?.();
  };

  return (
    <div ref={imgRef} className={`relative overflow-hidden bg-gray-100 ${className}`}>
      {!shouldLoad || isLoading ? (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          {!shouldLoad ? (
            // Show placeholder when not yet in viewport
            <div className="w-8 h-8 bg-gray-200 rounded"></div>
          ) : (
            // Show loading animation when loading
            <div className="animate-pulse">
              {placeholder ? (
                <img src={placeholder} alt="Loading" className="w-8 h-8 opacity-50" />
              ) : (
                <div className="w-8 h-8 bg-gray-300 rounded animate-pulse"></div>
              )}
            </div>
          )}
        </div>
      ) : null}

      {hasError ? (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-400">
          <div className="text-center">
            <div className="w-8 h-8 mx-auto mb-2 bg-gray-300 rounded"></div>
            <span className="text-xs">Failed to load</span>
          </div>
        </div>
      ) : (
        shouldLoad && imageSrc && (
          <img
            src={imageSrc}
            alt={alt}
            className={`transition-opacity duration-200 ${isLoading ? 'opacity-0' : 'opacity-100'} ${className}`}
            onLoad={handleLoad}
            onError={handleError}
            loading="lazy"
            decoding="async"
            style={{
              willChange: 'opacity',
              backfaceVisibility: 'hidden',
              transform: 'translateZ(0)',
              imageRendering: 'auto',
            }}
          />
        )
      )}
    </div>
  );
};

const TryOnSubHeader: React.FC<{
  onSortChange: (order: 'low-to-high' | 'high-to-low') => void;
}> = ({ onSortChange }) => {
  return (
    <div className="flex items-center justify-between px-10 mt-4 mb-8 pb-4">
      <div className="flex items-center gap-2 text-2xl font-bold text-gray-800">
        <Camera className="w-6 h-6" />
        <span>Try-on History</span>

        <span className="h-12 w-[1px] bg-gray-400 mx-4 inline-block rounded"  aria-hidden="true"></span>
        <span className="flex items-center px-3 py-2 text-blackrounded-lg">
         Deals For You
        </span>

      </div>
      <div className="flex items-center gap-4">
        <button
          onClick={() => window.location.href = '/tryon-history/favorites'}
          className="inline-flex items-center gap-2 px-6 py-1
      rounded-md bg-white
      ring-1 ring-gray-200 shadow-sm
      text-gray-800 text-sm font-medium
      hover:ring-gray-300"
        >
          <Heart className="w-4 h-4" />
          Favorites
        </button>

        <Menu as="div" className="relative inline-block text-left">
          <Menu.Button className="inline-flex items-center gap-2 px-6 py-1
        rounded-md bg-white
        ring-1 ring-gray-200 shadow-sm
        text-gray-800 text-sm font-medium
        hover:ring-gray-300">
            Sort by
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
                      className={`${active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
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
                      className={`${active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
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
  timestamp: string | number | Date;
  url: string;
  isFavorite: boolean;
  onToggleFavorite: () => Promise<void>;
  onDelete: () => void;
  imageCount: number;
}

const ProductCard: React.FC<ProductProps> = ({
  image,
  brand,
  name,
  price,
  currency,
  timestamp,
  isFavorite,
  onToggleFavorite,
  onDelete,
  imageCount
}) => (

  <div className="relative bg-white overflow-hidden rounded-none
    ring-1 ring-gray-200
    shadow-[0_2px_10px_rgba(0,0,0,0.06)] 
    transition-none cursor-pointer flex flex-col h-full">
    {/* Favorite Button */}

     <div className="absolute top-2 right-2 z-10">
    <span
      className="
        inline-flex items-center px-3 py-1 p-1 rounded-full
        text-[10px] font-semibold uppercase tracking-wide text-white
        shadow
        bg-gradient-to-r from-violet-500 to-blue-500
      "
    >
      NEW IN
    </span>
  </div>
    
    {/* Delete Button */}
    {/* <div
      onClick={(e) => {
        e.stopPropagation();
        onDelete();
      }}
      className="absolute bottom-2 right-2 z-10 cursor-pointer p-1 hover:bg-red-50 rounded transition-colors"
    >
      <Trash2 className="w-5 h-5 text-red-500 hover:text-red-600" />
    </div> */}

    {/* Timestamp Badge */}
    {/* <div className="absolute top-2 left-2 bg-gray-100 text-xs px-2 py-1 rounded z-10 text-gray-600">
      {new Date(timestamp).toLocaleDateString()}
    </div> */}

    {/* Image Count Badge */}
    {/* {imageCount > 1 && (
      <div className="absolute top-10 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded z-10 font-medium">
        {imageCount} try-ons
      </div>
    )} */}

    {/* Optimized Image */}
    <div className="w-full h-[360px] overflow-hidden">
      <OptimizedImage
        src={image}
        alt="Product"
        className="w-full h-full object-[right_bottom]"
      />
    </div>


    <div className="p-4 flex flex-col gap-1 flex-grow">

  <div className="flex items-center justify-between">
    <span className="text-gray-500 text-xs uppercase font-medium leading-tight">
      {brand}
    </span>
    <button
      onClick={async (e) => { e.stopPropagation(); await onToggleFavorite(); }}
      aria-label="Toggle favorite"
      className="p-1 m-0 bg-transparent rounded-none shadow-none ring-0 outline-none shrink-0"
    >
      <Heart
        className={`w-4 h-4 ${isFavorite ? 'text-red-500 fill-red-500' : 'text-black'}`}
      />
    </button>
  </div>

 
  <p className="text-base font-semibold text-gray-900 leading-tight truncate">
    {name}
  </p>


  <div className="flex items-baseline gap-2">
    <span className="text-xs font-bold text-black leading-none">
      {currency}{price}
    </span>
    <span className="text-xs text-gray-400 line-through leading-none">
      {currency}100.00
    </span>
     <span
    className="ml-1 inline-flex items-center px-2 py-0.5 rounded-md
               text-xs font-semibold uppercase tracking-wide whitespace-nowrap"
    style={{ backgroundColor: 'rgba(255,165,0,0.38)', color: '#C97217' }}
  >
    30% OFF
  </span>
  </div>
</div>
  </div>
);

// Image Slider Component
const ImageSlider: React.FC<{
  images: { url: string; timestamp: string; imageIndex: number; recordId?: string }[];
  currentIndex: number;
  onIndexChange: (index: number) => void;
  onDeleteImage?: (imageIndex: number) => void;
}> = ({ images, currentIndex, onIndexChange, onDeleteImage }) => {
  const [carouselLoading, setCarouselLoading] = useState(false);
  const [currentImageSrc, setCurrentImageSrc] = useState('');

  // Track when the current image changes
  useEffect(() => {
    const newImageSrc = images[currentIndex]?.url;
    if (newImageSrc && newImageSrc !== currentImageSrc) {
      setCarouselLoading(true);
      setCurrentImageSrc(newImageSrc);
    }
  }, [currentIndex, images, currentImageSrc]);

  const goToPrevious = () => {
    onIndexChange(currentIndex === 0 ? images.length - 1 : currentIndex - 1);
  };

  const goToNext = () => {
    onIndexChange(currentIndex === images.length - 1 ? 0 : currentIndex + 1);
  };

  const handleLoadStart = () => {
    setCarouselLoading(true);
  };

  const handleLoadComplete = () => {
    setCarouselLoading(false);
  };

  return (
    <div className="relative">
      <div className="w-full h-96 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden relative">
        {/* Carousel Loading Overlay */}
        {carouselLoading && (
          <div className="absolute inset-0 bg-gray-100 bg-opacity-90 flex items-center justify-center z-20 rounded-xl">
            <div className="flex flex-col items-center gap-3">
              <div
                className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"
                style={{ borderWidth: '3px' }}
              ></div>
              <span className="text-gray-600 text-sm font-medium">Loading image...</span>
            </div>
          </div>
        )}

        <ModalOptimizedImage
          key={`${currentIndex}-${images[currentIndex]?.url}`} // Force re-render on image change
          src={images[currentIndex]?.url || ''}
          alt="Product"
          className="w-full h-full object-contain"
          isVisible={true}
          onLoadStart={handleLoadStart}
          onLoadComplete={handleLoadComplete}
        />

        {/* Delete Button for Individual Image */}
        {onDeleteImage && (
          <div
            onClick={(e) => {
              e.stopPropagation();
              onDeleteImage(images[currentIndex].imageIndex);
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
            className={`absolute left-2 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition ${carouselLoading ? 'opacity-70' : ''}`}
            disabled={false} // Keep buttons enabled during loading for better UX
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <button
            onClick={goToNext}
            className={`absolute right-2 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition ${carouselLoading ? 'opacity-70' : ''}`}
            disabled={false} // Keep buttons enabled during loading for better UX
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>

          {/* Dots Indicator */}
          <div className="flex justify-center mt-4 gap-2">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => onIndexChange(index)}
                className={`w-2 h-2 rounded-full transition ${index === currentIndex
                  ? carouselLoading
                    ? 'bg-blue-400 animate-pulse'
                    : 'bg-blue-500'
                  : 'bg-gray-300'
                  }`}
              />
            ))}
          </div>

          {/* Image Counter */}
          <div className={`absolute top-2 right-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded transition ${carouselLoading ? 'opacity-70' : ''}`}>
            {carouselLoading ? (
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                {currentIndex + 1} / {images.length}
              </span>
            ) : (
              <span>{currentIndex + 1} / {images.length}</span>
            )}
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
  isFavorite: boolean | null;
  latestTryOnDate: string;
  productInfo: {
    brand_name?: string;
    product_name?: string;
    name?: string;
    price?: number | string;
    currency?: string;
    product_url?: string;
    url?: string;
    domain?: string;
  };
  totalTryOns: number;
  tryOnImages: Array<string | { url: string; recordId?: string }>;
}

interface GroupedProduct {
  productUrl: string;
  productInfo: ProductItem['productInfo'];
  images: Array<{
    url: string;
    timestamp: string;
    imageIndex: number;
    recordId?: string;
  }>;
  latestTimestamp: string;
  totalTryOns: number;
  isFavorite: boolean;
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
    imageIndex: number | null;
    isDeleting: boolean;
  }>({
    isOpen: false,
    imageIndex: null,
    isDeleting: false
  });

  const hasFetchedInitialData = useRef(false);

  // Smart preload modal images based on current index
  const modalImages = selectedProduct?.images.map(img => img.url) || [];
  useSmartImagePreloader(modalImages, currentImageIndex); // Remove unused variable

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const [hasMore, setHasMore] = useState(true);

  // Infinite scroll handler
  const handleScroll = useCallback(() => {
    if (window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 100) {
      if (hasMore && !loading) {
        setCurrentPage(prev => prev + 1);
      }
    }
  }, [hasMore, loading]);

  // Add scroll event listener
  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // Fetch and append products
  const fetchHistory = async (page: number, append = false) => {
    try {
      const skip = (page - 1) * pageSize;
      const url = getApiUrl('HISTORY_API', `/history?limit=${pageSize}&skip=${skip}`);
      const res = await axios.get<{ data: ProductItem[] }>(url, {
        headers: {
          Authorization: `Bearer ${getAccessToken()}`,
        },
      });
      console.log("res", res.data);
      const filtered = res.data.data.filter(p => p.productInfo && p.productInfo.product_name);
      console.log("filtered", filtered);

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
      //             "product_url": "https://www.amazon.com/s?k=womens+pant+suit+velvet+2+pcs+peak+lapel+double+breasted+womens+suiting+for+work+professional&crid=1QZ8Z8Z8Z8Z8Z&sprefix=womens+pant+suit+velvet+2+pcs+peak+lapel+double+breasted+womens+suiting+for+work+professional%2Caps%2C123&ref=nb_sb_noss_1"
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
      //             "product_url": "https://www.amazon.com/s?k=womens+suit+2+piece+slim+fit+outfits+suits+professional+blazer+with+pants+dressy+casual+suiting+business+office+sets+for+work&crid=1QZ8Z8Z8Z8Z8Z&sprefix=womens+suit+2+piece+slim+fit+outfits+suits+professional+blazer+with+pants+dressy+casual+suiting+business+office+sets+for+work%2Caps%2C123&ref=nb_sb_noss_1"
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
      //             "product_url": "https://www.amazon.com/s?k=womens+tuxedo+3+piece+suit+sets+for+women+blazer+pants+vest+set+womens+business+professional+outfits&crid=1QZ8Z8Z8Z8Z8Z&sprefix=womens+tuxedo+3+piece+suit+sets+for+women+blazer+pants+vest+set+womens+business+professional+outfits%2Caps%2C123&ref=nb_sb_noss_1"
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
      //             "product_url": "https://www.amazon.com/s?k=womens+tuxedo+3+piece+suit+sets+for+women+blazer+pants+vest+set+womens+business+professional+outfits&crid=1QZ8Z8Z8Z8Z8Z&sprefix=womens+tuxedo+3+piece+suit+sets+for+women+blazer+pants+vest+set+womens+business+professional+outfits%2Caps%2C123&ref=nb_sb_noss_1"
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
      //             "product_url": "https://www.amazon.com/s?k=womens+tuxedo+3+piece+suit+sets+for+women+blazer+pants+vest+set+womens+business+professional+outfits&crid=1QZ8Z8Z8Z8Z8Z&sprefix=womens+tuxedo+3+piece+suit+sets+for+women+blazer+pants+vest+set+womens+business+professional+outfits%2Caps%2C123&ref=nb_sb_noss_1"
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
      //             "product_url": "https://www.amazon.com/s?k=summer+dresses+for+women+casual+tshirt+short+sleeve+floral+sundress+beach+cover+ups+with+pockets&crid=1QZ8Z8Z8Z8Z8Z&sprefix=summer+dresses+for+women+casual+tshirt+short+sleeve+floral+sundress+beach+cover+ups+with+pockets%2Caps%2C123&ref=nb_sb_noss_1"
      //         },
      //         "record_id": "687943641f9f9deb30c7e49e",
      //         "result_image_url": "https://faishionai.s3.amazonaws.com/tryon-results/1752777500.png",
      //         "timestamp": "2025-07-17T18:39:32.034000",
      //         "user_email": "info.faishion@gmail.com",
      //         "user_id": "682e58d3b329b52413d8d4df"
      //     }
      // ]

      // Add 2-second delay to show loader
      await new Promise(resolve => setTimeout(resolve, 1500));

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
    if (currentPage === 1 && hasFetchedInitialData.current) {
      return; // Prevent duplicate initial request
    }

    setLoading(true);
    fetchHistory(currentPage, currentPage > 1);

    if (currentPage === 1) {
      hasFetchedInitialData.current = true;
    }
    // eslint-disable-next-line
  }, [currentPage]);

  // Reset to first page on search/filter change
  useEffect(() => {
    if (currentPage !== 1) {
      hasFetchedInitialData.current = false; // Reset flag when changing filters
      setCurrentPage(1);
    }
    // Do not call fetchHistory here to avoid duplicate API calls
    // eslint-disable-next-line
  }, [searchQuery, sortOrder]);

  // Group products by product URL
  const groupedProducts = React.useMemo(() => {
    const grouped = new Map<string, GroupedProduct>();

    products.forEach(product => {
      const productUrl = product.productInfo?.product_url || product.productInfo?.url || 'unknown';

      if (grouped.has(productUrl)) {
        const existing = grouped.get(productUrl)!;
        // Add all images from tryOnImages array
        product.tryOnImages.forEach((img, index) => {
          const isObj = typeof img === 'object' && img !== null;
          const url = isObj ? (img as { url: string }).url : (img as string);
          const recordId = isObj ? (img as { recordId?: string }).recordId : undefined;
          existing.images.push({
            url,
            timestamp: product.latestTryOnDate,
            imageIndex: index,
            recordId,
          });
        });
        // Update latest timestamp if this one is newer
        if (new Date(product.latestTryOnDate) > new Date(existing.latestTimestamp)) {
          existing.latestTimestamp = product.latestTryOnDate;
        }
        // Update total try-ons
        existing.totalTryOns = Math.max(existing.totalTryOns, product.totalTryOns);
        // Update favorite status
        existing.isFavorite = product.isFavorite || existing.isFavorite;
      } else {
        const images = product.tryOnImages.map((img, index) => {
          const isObj = typeof img === 'object' && img !== null;
          const url = isObj ? (img as { url: string }).url : (img as string);
          const recordId = isObj ? (img as { recordId?: string }).recordId : undefined;
          return {
            url,
            timestamp: product.latestTryOnDate,
            imageIndex: index,
            recordId,
          };
        });

        grouped.set(productUrl, {
          productUrl,
          productInfo: product.productInfo,
          images,
          latestTimestamp: product.latestTryOnDate,
          totalTryOns: product.totalTryOns,
          isFavorite: product.isFavorite || false
        });
      }
    });

    // Sort images within each group by timestamp (newest first)
    grouped.forEach(group => {
      group.images.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    });

    return Array.from(grouped.values());
  }, [products]);

  const toggleFavorite = async (productUrl: string) => {
    try {
      // 找到对应的产品
      const product = products.find(p => {
        const url = p.productInfo?.product_url || p.productInfo?.url || 'unknown';
        return url === productUrl;
      });

      if (!product) return;

      const isFavorite = product.isFavorite;

      if (isFavorite) {
        // 取消收藏
        await tryonApi.removeFromFavorites(productUrl);
      } else {
        // 添加收藏
        await tryonApi.addToFavorites(productUrl);
      }

      // 更新本地状态
      setProducts(prev => prev.map(p => {
        const url = p.productInfo?.product_url || p.productInfo?.url || 'unknown';
        if (url === productUrl) {
          return { ...p, isFavorite: !isFavorite };
        }
        return p;
      }));
    } catch (error) {
      console.error('收藏操作失败:', error);
    }
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
      // 调用后端删除接口，按商品 URL 删除该商品的所有试穿历史
      const productUrlToDelete = deleteModal.product.productUrl;
      if (productUrlToDelete) {
        await tryonApi.deleteProductHistory(productUrlToDelete);
      }

      // Remove all deleted records from the local state
      setProducts(prev => prev.filter(p => {
        const productUrl = p.productInfo?.product_url || p.productInfo?.url || 'unknown';
        return productUrl !== deleteModal.product!.productUrl;
      }));

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

  const handleDeleteImage = (imageIndex: number) => {
    setDeleteImageModal({
      isOpen: true,
      imageIndex,
      isDeleting: false
    });
  };

  const handleDeleteImageConfirm = async () => {
    if (deleteImageModal.imageIndex === null) return;

    setDeleteImageModal(prev => ({ ...prev, isDeleting: true }));

    try {
      // 尝试调用后端根据 recordId 删除单条记录（新数据结构支持）
      const recordId = selectedProduct?.images[deleteImageModal.imageIndex]?.recordId;
      if (recordId) {
        try {
          await (tryonApi as any).deleteHistoryRecord(recordId);
        } catch (e) {
          console.warn('Delete record by recordId failed, fallback to local removal:', e);
        }
      }

      // Update the selected product's images if it's currently open
      if (selectedProduct) {
        const updatedImages = selectedProduct.images.filter((_, index) => index !== deleteImageModal.imageIndex);
        if (updatedImages.length === 0) {
          // If no images left, close the modal and remove the entire card
          setShowModal(false);
          setSelectedProduct(null);

          // Remove the entire product from the products list
          setProducts(prev => prev.filter(p => {
            const productUrl = p.productInfo?.product_url || p.productInfo?.url || 'unknown';
            return productUrl !== selectedProduct.productUrl;
          }));
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
        imageIndex: null,
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
      imageIndex: null,
      isDeleting: false
    });
  };

  const NoHistory = !loading && groupedProducts.length === 0;

  const filteredProducts = groupedProducts.filter((p) => {
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
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 w-full">
              {sortedProducts.map(item => (
                <div
                  key={item.productUrl || 'unknown'}
                  onClick={() => {
                    setSelectedProduct(item);
                    setCurrentImageIndex(0);
                    setShowModal(true);
                  }}
                >
                  <ProductCard
                    image={item.images[0]?.url || ''} // Show the latest image
                    brand={item.productInfo?.brand_name || 'Unknown Brand'}
                    name={item.productInfo?.product_name || item.productInfo?.name || 'Unknown Product'}
                    price={item.productInfo?.price || 'N/A'}
                    currency={item.productInfo?.currency || ''}
                    timestamp={item.latestTimestamp || new Date().toISOString()}
                    url={item.productInfo?.product_url || item.productInfo?.url || ''}
                    isFavorite={item.isFavorite || false}
                    onToggleFavorite={() => toggleFavorite(item.productUrl || '')}
                    onDelete={() => handleDeleteClick(item)}
                    imageCount={item.totalTryOns || item.images.length}
                  />
                </div>
              ))}
            </div>
          </>
        )}
        {/* Loading indicator for infinite scroll */}
        {loading && products.length > 0 && (
          <div className="flex justify-center items-center mt-8 py-4">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 border-2 border-[#6C5DD3] border-t-transparent rounded-full animate-spin" />
              <span className="text-gray-600">Loading more items...</span>
            </div>
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
                {selectedProduct.productInfo?.product_name || selectedProduct.productInfo?.name || 'Product Name'}
              </h2>
              <div className="flex items-center gap-3">
                <span className="text-2xl font-bold text-black">
                  {selectedProduct.productInfo?.currency}{selectedProduct.productInfo?.price}
                </span>
              </div>
              {selectedProduct.images.length > 1 && (
                <p className="text-blue-600 text-sm font-medium">
                  {selectedProduct.totalTryOns} try-ons available
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
              <div className="recommendation-wrapper">
      <h3 className="recommendation-title">You May Also Like</h3>
      <div style={{backgroundColor:"rgb(243 244 246 / var(--tw-bg-opacity, 1))"}}>
      <Carousel
        arrows
        slidesToShow={3}
        slidesToScroll={1}
        infinite={false}
       dots={false}
        
      >
        {items.map((item, i) => (
          <div key={i} className="recommendation-card">
            <div className="reco-img-wrap">
            <img src={item.img} alt={item.name} className="recommendation-img" />
            </div>

            <div className="recommendation-info">
              <p className="brand">{item.brand}</p>
              <p className="name">{item.name}</p>
              <div className="price-row">
                <span className="price">${item.price.toFixed(2)}</span>
                <span className="old-price">${item.oldPrice.toFixed(2)}</span>
                <span className="discount">{item.discount}</span>
              </div>
            </div>
          </div>
        ))}
      </Carousel>
      </div>
    </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default React.memo(Content);
