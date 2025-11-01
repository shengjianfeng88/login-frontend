import React, { useEffect, useState, Fragment, useCallback, useRef } from 'react';
import { Camera, Heart, ChevronDown, X, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Menu, Transition } from '@headlessui/react';
import empty from '/empty.png';
import axios from 'axios';
import { tryonApi } from '../../api/tryon';
import { getApiUrl } from '../../config/api';
import { getAccessToken } from '../../utils/auth';

const NO_SCROLLBAR_CSS = `
  .no-scrollbar::-webkit-scrollbar { display: none; }
  .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
`;

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
    <div className="flex items-center justify-between px-10 mt-4 mb-8 border-b pb-4">
      <div className="flex items-center gap-2 text-2xl font-bold text-gray-800">
        <Camera className="w-6 h-6" />
        <span>Try-on History</span>

        {/* Chatbot button */}
        <a
          href="https://udify.app/chat/q1Kt8Quqatr4MWdS"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-white rounded-lg transition-colors shadow-sm border border-gray-200"
          title="Open Chatbot in New Tab"
        >
          💬 fAIshion Chatbot
        </a>

      </div>
      <div className="flex items-center gap-4">
        <button
          onClick={() => window.location.href = '/tryon-history/favorites'}
          className="inline-flex items-center gap-2 h-7 px-6 rounded-md border border-gray-300 bg-white text-black font-semibold font-sans hover:bg-gray-50 active:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#675BC5]/30"
        >
          <Heart className="w-4 h-4" />
          Favorites
        </button>

        <Menu as="div" className="relative inline-block text-left">
          <Menu.Button className="inline-flex items-center gap-2 h-7 px-6 rounded-md border border-gray-300 bg-white text-black font-semibold font-sans hover:bg-gray-50 active:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#675BC5]/30">
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
  imageCount,
}) => (
  <div className="relative bg-white overflow-hidden shadow-lg hover:shadow-xl transition cursor-pointer flex flex-col h-full rounded-2xl">
    {/* Favorite Button */}
    {/* <div
      onClick={async (e) => {
        e.stopPropagation();
        await onToggleFavorite();
      }}
      className="absolute top-2 right-2 z-10 cursor-pointer p-1 rounded-full bg-white shadow hover:bg-gray-100"
    >
      <Heart className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
    </div> */}
  

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
    <div className="w-full h-72 bg-white flex items-center justify-center">
      <OptimizedImage
        src={image}
        alt="Product"
        className="h-full object-contain"
      />
    </div>

    {/* Product Details */}
    <div className="p-4 flex flex-col justify-between flex-grow">
  <div className="flex items-center justify-between mb-1">
    <p className="text-gray-500 text-xs uppercase tracking-wide font-medium">
      {brand}
    </p>

    {/* Favorite Button (moved + reused) */}
    <div
      onClick={async (e) => {
        e.stopPropagation();
        await onToggleFavorite();
      }}
      className="cursor-pointer p-1 rounded-full"
    >
      <Heart className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
    </div>
  </div>

  <p className="text-lg font-semibold text-gray-900 truncate">{name}</p>
  <div className="flex items-center gap-2 mt-2">
    <span className="text-lg font-bold text-black">{currency}{price}</span>
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

  // const goToPrevious = () => {
  //   onIndexChange(currentIndex === 0 ? images.length - 1 : currentIndex - 1);
  // };

  // const goToNext = () => {
  //   onIndexChange(currentIndex === images.length - 1 ? 0 : currentIndex + 1);
  // };

  const handleLoadStart = () => {
    setCarouselLoading(true);
  };

  const handleLoadComplete = () => {
    setCarouselLoading(false);
  };

  return (
    <div className="relative">
      <div className="w-full h-96 bg-gray-100 flex items-center justify-center overflow-hidden relative">
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

     

      {/* Timestamp for current image */}
      <p className="text-gray-500 font-semibold font-sans text-sm mt-2 text-center">
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


type RecItem = {
  image: string;
  brand?: string;
  name?: string;
  price?: number | string;
  currency?: string;
  url?: string;
};


const MiniRecCard: React.FC<{ item: RecItem }> = ({ item }) => (
  <a
    href={item.url || '#'}
    target="_blank"
    rel="noopener noreferrer"
    className="
      block flex-none w-[140px] h-[241px]
  bg-white border border-gray-200 hover:shadow transition overflow-hidden
    "
  >
  
    <div className="w-full h-[172px] bg-gray-100 flex items-center justify-center">
      <img
        src={item.image}
        alt={item.name || 'Recommended'}
        className="max-h-full max-w-full object-contain"
        loading="lazy"
        decoding="async"
      />
    </div>

    <div className="p-3 h-[88px] flex flex-col">
      <p className="text-[8px] text-gray-600 font-semibold uppercase tracking-wide mb-0.5 line-clamp-1">
        {item.brand || '—'}
      </p>
      <p className="text-[12px] font-sans text-gray-900 leading-tight line-clamp-1">
        {item.name || 'Product'}
      </p>
      <div className="text-[10px] font-semibold">
        {item.currency}{item.price}
      </div>
    </div>
  </a>
);


const RecommendedCarousel: React.FC<{ items: RecItem[]; arrowColor?: string }> = ({ items }) => {
  const scrollerRef = React.useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = React.useState(true);
  const [atEnd, setAtEnd] = React.useState(false);

  const updateEnds = React.useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    setAtStart(el.scrollLeft <= 2);
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 2);
  }, []);

  React.useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    updateEnds();
    el.addEventListener('scroll', updateEnds, { passive: true });
    window.addEventListener('resize', updateEnds);
    return () => {
      el.removeEventListener('scroll', updateEnds);
      window.removeEventListener('resize', updateEnds);
    };
  }, [updateEnds]);

  const scrollByPage = (dir: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: el.clientWidth * dir, behavior: 'smooth' });
  };

const ArrowBtn: React.FC<{ side: 'left' | 'right'; onClick: () => void; disabled?: boolean }> = ({ side, onClick, disabled }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        absolute ${side === 'left' ? 'left-1.5' : 'right-1.5'} top-1/2 -translate-y-1/2 z-10
        rounded-full p-2 shadow-md transition
        ${disabled ? 'bg-[#CBCDCF] cursor-not-allowed' : 'bg-black hover:shadow-lg'}
      `}
      aria-label={side === 'left' ? 'Previous' : 'Next'}
    >
      {side === 'left' ? <ChevronLeft className={`w-4 h-4 ${disabled ? 'text-[#758094]' : 'text-white'}`} /> : <ChevronRight className={`w-4 h-4 ${disabled ? 'text-[#758094]' : 'text-white'}`} />}
    </button>
  );

  return (
      <div className="mt-6 w-[140px] sm:w-[292px] md:w-[444px]">
      <h3 className="text-[16px] font-semibold text-gray-800 mb-2">You May Also Like</h3>

      <div className="relative">
        <div
          ref={scrollerRef}
          className="
            flex gap-3 overflow-x-auto scroll-smooth
      snap-x snap-mandatory px-0 pb-1
      [-ms-overflow-style:none] [scrollbar-width:none]
          "
        >
          {items.map((it, i) => (
            <div key={i} className="snap-start">
              <MiniRecCard item={it} />
            </div>
          ))}
        </div>

        <ArrowBtn side="left" onClick={() => scrollByPage(-1)} disabled={atStart}/>
        <ArrowBtn side="right" onClick={() => scrollByPage(1)} disabled={atEnd} />
      </div>

      {/* Hide WebKit scrollbar */}
      <style>{`.hide-scrollbar::-webkit-scrollbar{display:none}`}</style>
    </div>
  );
};

const ThumbnailRail: React.FC<{
  images: { url: string; timestamp: string; imageIndex: number; recordId?: string }[];
  currentIndex: number;
  onIndexChange: (i: number) => void;
}> = ({ images, currentIndex, onIndexChange }) => {
  const refs = React.useRef<(HTMLButtonElement | null)[]>([]);

  // Auto-keep the active thumb in view
  useEffect(() => {
    const el = refs.current[currentIndex];
    if (el) el.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }, [currentIndex]);

  return (
    <div className="flex flex-col items-center">
      <div
  className="
    no-scrollbar overflow-y-auto
    h-96 w-[49px]
    rounded-lg bg-white/40
  "
  style={{ scrollBehavior: 'smooth' }}
>
        <div className="flex flex-col gap-2 p-1">
          {images.map((img, i) => (
            <button
              key={`${img.url}-${i}`}
              ref={(el) => (refs.current[i] = el)}
              onClick={(e) => { e.stopPropagation(); onIndexChange(i); }}
              className={`
                relative w-full h-full overflow-hidden  
                ring-2 transition
                ${i === currentIndex ? 'ring-[#675BC5]' : 'ring-transparent hover:ring-gray-300'}
              `}
              title={new Date(img.timestamp).toLocaleDateString()}
            >
              <img
                src={img.url}
                alt={`Try-on ${i + 1}`}
                className="h-full w-full object-cover"
                loading="lazy"
                decoding="async"
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};


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

  const base = sortedProducts;






  const alsoLike = React.useMemo(() => {
  const img0 = selectedProduct?.images?.[0]?.url || '';
  const img1 = selectedProduct?.images?.[1]?.url || img0;
  const img2 = selectedProduct?.images?.[2]?.url || img0;

  return [
    {
      image: img0,
      brand: 'GARAGE',
      name: 'Romantic Lace Midi Dress',
      price: '119.00',
      currency: '$',
      url: selectedProduct?.productUrl || '#',
    },
    {
      image: img1,
      brand: 'H&M',
      name: 'Elegant Summer Midi',
      price: '59.99',
      currency: '$',
      url: selectedProduct?.productUrl || '#',
    },
    {
      image: img2,
      brand: 'FASHION NOVA',
      name: 'Trina Mini Dress',
      price: '10.00',
      currency: '$',
      url: selectedProduct?.productUrl || '#',
    },
    {
      image: img0,
      brand: 'ZARA',
      name: 'Bohemian Floral Maxi',
      price: '89.90',
      currency: '$',
      url: selectedProduct?.productUrl || '#',
    },
    {
      image: img1,
      brand: 'MANGO',
      name: 'Crepe Slip Dress',
      price: '69.90',
      currency: '$',
      url: selectedProduct?.productUrl || '#',
    },
  ];
}, [selectedProduct]);
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
              {base.map((item,idx) => (
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
          <div className="bg-white p-8 max-w-5xl w-full flex gap-8 relative shadow-xl">
            <button
              className="absolute top-4 right-4 text-gray-500 hover:text-black text-xl"
              onClick={() => setShowModal(false)}
            >
              <X className="w-6 h-6" />
            </button>
            <div className="w-1/2">
  
  <style dangerouslySetInnerHTML={{ __html: NO_SCROLLBAR_CSS }} />
  <div className="flex  items-start gap-3">
    {/* Vertical thumbnails */}
    <ThumbnailRail
      images={selectedProduct.images}
      currentIndex={currentImageIndex}
      onIndexChange={setCurrentImageIndex}
    />

    {/* Main image slider (unchanged) */}
    <div className="flex-1">
      <ImageSlider
        images={selectedProduct.images}
        currentIndex={currentImageIndex}
        onIndexChange={setCurrentImageIndex}
        onDeleteImage={handleDeleteImage}
      />
    </div>
  </div>
</div>

            <div className="w-1/2 flex flex-col justify-center gap-3">
              <h2 className="text-[20px] font-bold text-gray-900">
                {selectedProduct.productInfo?.brand_name || 'Brand'} -{' '}
                {selectedProduct.productInfo?.product_name || selectedProduct.productInfo?.name || 'Product Name'}
              </h2>
              <div className="flex items-center gap-1">
                <span className="text-[14px] font-bold text-black">
                  {selectedProduct.productInfo?.currency}{selectedProduct.productInfo?.price}
                </span>
              </div>
              {selectedProduct.images.length > 1 && (
                <p className="text-[#675BC5] text-sm font-medium">
                  {selectedProduct.totalTryOns} try-ons available
                </p>
              )}
              <a
                href={selectedProduct.productUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 bg-[#675BC5] text-white px-9 py-2 text-[14px] rounded-lg hover:bg-gray-800 text-center w-fit"
              >
                Shop Now
              </a>
              <RecommendedCarousel items={alsoLike} arrowColor="#675BC5" />
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default React.memo(Content);
