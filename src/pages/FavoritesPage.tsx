import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, X, Trash2, ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';
import Header from '@/components/history/Header';
import { tryonApi } from '../api/tryon';

interface FavoriteItem {
  product_url?: string;
  url?: string;
  isFavorite?: boolean;
  latestTryOnDate?: string;
  productInfo?: {
    brand_name?: string;
    currency?: string;
    domain?: string;
    price?: number;
    product_name?: string;
    name?: string;
    product_url?: string;
  };
  totalTryOns?: number;
  // 兼容旧(字符串数组)与新(对象数组)两种结构
  tryOnImages?: Array<string | { url: string; recordId?: string }>;  // Array of image URLs or objects
}

interface GroupedProduct {
  productUrl: string;
  productInfo: FavoriteItem['productInfo'];
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

// Delete Confirmation Modal Component (reuse same UI/behavior as history page)
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
            : `Are you sure you want to delete "${productName}" from your try-on history? This action cannot be undone.`}
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

// Image URL optimization utility (copied from Content.tsx)
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

// Modal-specific optimized image component (copied from Content.tsx)
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

// Optimized image component (copied from Content.tsx)
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

// ProductCard component (copied exactly from Content.tsx)
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
  <div className="relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition cursor-pointer flex flex-col h-full">
    {/* Favorite Button */}
    <div
      onClick={async (e) => {
        e.stopPropagation();
        await onToggleFavorite();
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
        {imageCount} try-ons
      </div>
    )}

    {/* Optimized Image */}
    <div className="w-full h-72 bg-white flex items-center justify-center rounded-t-2xl">
      <OptimizedImage
        src={image}
        alt="Product"
        className="h-full object-contain"
      />
    </div>

    {/* Product Details */}
    <div className="p-4 flex flex-col justify-between flex-grow">
      <p className="text-gray-500 text-xs uppercase tracking-wide font-medium mb-1">{brand}</p>
      <p className="text-lg font-semibold text-gray-900 truncate">{name}</p>
      <div className="flex items-center gap-2 mt-2">
        <span className="text-lg font-bold text-black">{currency}{price}</span>
      </div>
    </div>
  </div>
);

// Image Slider Component (copied exactly from Content.tsx)
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

const FavoritesPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<GroupedProduct | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    product: GroupedProduct | null;
    isDeleting: boolean;
  }>({
    isOpen: false,
    product: null,
    isDeleting: false,
  });

  // Fetch favorites list
  const fetchFavorites = async () => {
    try {
      setLoading(true);
      setError(null);
      const favoritesList = await tryonApi.getFavorites();

      // Process API returned data, ensure it's in array format
      const processedFavorites = Array.isArray(favoritesList)
        ? favoritesList.map(item => {
          // If it's a string, convert to object
          if (typeof item === 'string') {
            return { product_url: item };
          }
          // If it's already an object, return directly
          return item as FavoriteItem;
        })
        : [];

      setFavorites(processedFavorites);
    } catch (err) {
      console.error('Failed to fetch favorites:', err);
      setError('Failed to fetch favorites. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Remove favorite
  const handleRemoveFavorite = async (item: GroupedProduct) => {
    try {
      const productUrl = item.productUrl;

      if (!productUrl) {
        setError('Invalid product URL');
        return;
      }

      await tryonApi.removeFromFavorites(productUrl);
      // Refresh favorites list
      await fetchFavorites();
    } catch (err) {
      console.error('Failed to remove favorite:', err);
      setError('Failed to remove favorite. Please try again.');
    }
  };

  // Open delete confirm modal for a product
  const handleDeleteClick = (product: GroupedProduct) => {
    setDeleteModal({ isOpen: true, product, isDeleting: false });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.product) return;

    setDeleteModal(prev => ({ ...prev, isDeleting: true }));
    try {
      const productUrlToDelete = deleteModal.product.productUrl;
      if (productUrlToDelete) {
        await tryonApi.deleteProductHistory(productUrlToDelete);
      }
      await fetchFavorites();
      setDeleteModal({ isOpen: false, product: null, isDeleting: false });
    } catch (e) {
      console.error('Failed to delete product history:', e);
      setDeleteModal(prev => ({ ...prev, isDeleting: false }));
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModal({ isOpen: false, product: null, isDeleting: false });
  };

  // Load favorites list when page loads
  useEffect(() => {
    fetchFavorites();
  }, []);

  // Group favorites by product URL (like in Content.tsx)
  const groupedFavorites = React.useMemo(() => {
    const grouped = new Map<string, GroupedProduct>();

    favorites.forEach(favorite => {
      const productUrl = favorite.productInfo?.product_url || favorite.product_url || favorite.url || 'unknown';

      if (grouped.has(productUrl)) {
        const existing = grouped.get(productUrl)!;
        // Add all images from tryOnImages array
        if (favorite.tryOnImages) {
          favorite.tryOnImages.forEach((img, index) => {
            const isObj = typeof img === 'object' && img !== null;
            const url = isObj ? (img as { url: string }).url : (img as string);
            const recordId = isObj ? (img as { recordId?: string }).recordId : undefined;
            existing.images.push({
              url,
              timestamp: favorite.latestTryOnDate || new Date().toISOString(),
              imageIndex: index,
              recordId,
            });
          });
        }
        // Update latest timestamp if this one is newer
        if (favorite.latestTryOnDate && new Date(favorite.latestTryOnDate) > new Date(existing.latestTimestamp)) {
          existing.latestTimestamp = favorite.latestTryOnDate;
        }
        // Update total try-ons
        existing.totalTryOns = Math.max(existing.totalTryOns, favorite.totalTryOns || 1);
      } else {
        const images = favorite.tryOnImages ? favorite.tryOnImages.map((img, index) => {
          const isObj = typeof img === 'object' && img !== null;
          const url = isObj ? (img as { url: string }).url : (img as string);
          const recordId = isObj ? (img as { recordId?: string }).recordId : undefined;
          return {
            url,
            timestamp: favorite.latestTryOnDate || new Date().toISOString(),
            imageIndex: index,
            recordId,
          };
        }) : [];

        grouped.set(productUrl, {
          productUrl,
          productInfo: favorite.productInfo,
          images,
          latestTimestamp: favorite.latestTryOnDate || new Date().toISOString(),
          totalTryOns: favorite.totalTryOns || 1,
          isFavorite: true // All items in favorites are favorites
        });
      }
    });

    // Sort images within each group by timestamp (newest first)
    grouped.forEach(group => {
      group.images.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    });

    return Array.from(grouped.values());
  }, [favorites]);

  // Filter favorites based on search query
  const filteredFavorites = groupedFavorites.filter((item) => {
    const productInfo = item.productInfo || {};
    const name = (productInfo.product_name || productInfo.name || '').toLowerCase();
    const brand = (productInfo.brand_name || '').toLowerCase();
    const url = (item.productUrl || '').toLowerCase();

    return (
      name.includes(searchQuery.toLowerCase()) ||
      brand.includes(searchQuery.toLowerCase()) ||
      url.includes(searchQuery.toLowerCase())
    );
  });

  return (
    <main>
      {/* Reuse the original Header component */}
      <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      {/* Content area with exact styles from Content.tsx */}
      <section className="px-10 py-6 min-h-[calc(100vh-150px)] bg-gray-50 mx-auto rounded-md flex flex-col items-center gap-6">
        <div className="max-w-[1280px] w-full">

          {loading && (
            <div className="flex justify-center items-center h-64">
              <div className="w-6 h-6 border-2 border-[#6C5DD3] border-t-transparent rounded-full animate-spin" />
              <span className="ml-3 text-gray-600">Loading...</span>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <div className="text-red-800">{error}</div>
                <button
                  onClick={fetchFavorites}
                  className="ml-4 text-red-600 hover:text-red-800 underline"
                >
                  Retry
                </button>
              </div>
            </div>
          )}

          {!loading && !error && filteredFavorites.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-2 mt-20">
              <Heart className="w-24 h-24 text-gray-300" />
              <p className="text-gray-600 text-sm">No favorites found</p>
              <button
                onClick={() => navigate('/tryon-history')}
                className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Browse Products
              </button>
            </div>
          )}

          {!loading && !error && filteredFavorites.length > 0 && (
            <>
              {/* Header with favorites count using same style as TryOnSubHeader */}
              <div className="flex items-center justify-between px-10 mt-4 mb-8 border-b pb-4">
                <div className="flex items-center gap-4 text-2xl font-bold text-gray-800">
                  {/* Back button */}
                  <button
                    onClick={() => navigate('/tryon-history')}
                    className="flex items-center px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-white rounded-lg transition-colors shadow-sm border border-gray-200 group"
                    title="Back to Try-on History"
                  >
                    <ArrowLeft className="w-5 h-5 group-hover:text-gray-800" />
                  </button>

                  {/* Favorites title */}
                  <div className="flex items-center gap-2">
                    <Heart className="w-6 h-6" />
                    <span>My Favorites</span>
                  </div>

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
                <div className="text-gray-600">
                  {filteredFavorites.length} item{filteredFavorites.length !== 1 ? 's' : ''}
                </div>
              </div>

              {/* Products grid using exact same styles as Content.tsx */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 w-full">
                {filteredFavorites.map((item, index) => {
                  const productInfo = item.productInfo || {};
                  const productUrl = item.productUrl || '';
                  const brand = productInfo.brand_name || 'Unknown Brand';
                  const name = productInfo.product_name || productInfo.name || 'Unknown Product';
                  const price = productInfo.price || 'N/A';
                  const currency = productInfo.currency || '';

                  // Get the latest image from images array (first item is the latest)
                  const image = (item.images && item.images.length > 0)
                    ? item.images[0].url
                    : '/empty.png';

                  const timestamp = item.latestTimestamp || new Date().toISOString();
                  const imageCount = item.totalTryOns || item.images.length;

                  return (
                    <div
                      key={index}
                      onClick={() => {
                        // Show preview popup instead of opening product link
                        setSelectedProduct(item);
                        setCurrentImageIndex(0);
                        setShowModal(true);
                      }}
                    >
                      <ProductCard
                        image={image}
                        brand={brand}
                        name={name}
                        price={price}
                        currency={currency}
                        timestamp={timestamp}
                        url={productUrl}
                        isFavorite={true}
                        onToggleFavorite={() => handleRemoveFavorite(item)}
                        onDelete={() => handleDeleteClick(item)}
                        imageCount={imageCount}
                      />
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Image preview modal (copied exactly from Content.tsx) */}
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
              </div>
            </div>
          </div>
        )}

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
      </section>
    </main>
  );
};

export default FavoritesPage;
