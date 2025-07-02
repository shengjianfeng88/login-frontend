import React, { useEffect, useState, Fragment } from 'react';
import { Camera, Heart, ChevronDown, X } from 'lucide-react';
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
  originalPrice?: number | string | null;
  timestamp: string | number | Date;
  url: string;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}

const ProductCard: React.FC<ProductProps> = ({
  image,
  brand,
  name,
  price,
  originalPrice,
  timestamp,
  isFavorite,
  onToggleFavorite
}) => (
  <div className="relative bg-white rounded-2xl overflow-hidden shadow-lg w-full hover:shadow-xl transition cursor-pointer">
    <div
      onClick={(e) => {
        e.stopPropagation();
        onToggleFavorite();
      }}
      className="absolute top-2 right-2 z-10 cursor-pointer p-1 rounded-full bg-white shadow hover:bg-gray-100"
    >
      <Heart className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
    </div>
    <div className="absolute top-2 left-2 bg-gray-100 text-xs px-2 py-1 rounded z-10 text-gray-600">
      {new Date(timestamp).toLocaleDateString()}
    </div>
    <img src={image} alt="Product" className="w-full h-64 object-cover rounded-t-2xl" />
    <div className="p-4">
      <p className="text-gray-500 text-xs uppercase tracking-wide font-medium mb-1">{brand}</p>
      <p className="text-lg font-semibold text-gray-900 truncate">{name}</p>
      <div className="flex items-center gap-2 mt-2">
        <span className="text-lg font-bold text-black">{price}</span>
        {/* {originalPrice && <span className="text-sm text-gray-400 line-through">{originalPrice}</span>} */}
      </div>
    </div>
  </div>
);

interface ProductItem {
  record_id: string;
  result_image_url: string;
  timestamp: string | number | Date;
  product_info?: {
    brand_name?: string;
    product_name?: string;
    name?: string;
    price?: number | string;
    product_url?: string;
    url?: string;
  };
}

const Content: React.FC = () => {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [sortOrder, setSortOrder] = useState<'low-to-high' | 'high-to-low' | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const accessToken = localStorage.getItem('accessToken');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await axios.get<ProductItem[]>('https://tryon-history.faishion.ai/history', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        
        setProducts(res.data);
      } catch (error) {
        console.error('Error fetching history:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [accessToken]);

  const toggleFavorite = (recordId: string) => {
    setFavorites(prev => {
      const updated = new Set(prev);
      if (updated.has(recordId)) updated.delete(recordId);
      else updated.add(recordId);
      return updated;
    });
  };

  const NoHistory = !loading && products.length === 0;

  const filteredProducts = showOnlyFavorites
    ? products.filter(p => favorites.has(p.record_id))
    : products;

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const priceA = parseFloat(a.product_info?.price?.toString().replace('$', '') || '0');
    const priceB = parseFloat(b.product_info?.price?.toString().replace('$', '') || '0');
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
                const info = item.product_info || {};
                return (
                  <div
                    key={item.record_id}
                    onClick={() => {
                      setSelectedProduct(item);
                      setShowModal(true);
                    }}
                  >
                    <ProductCard
                      image={item.result_image_url}
                      brand={info.brand_name || 'Unknown'}
                      name={info.product_name || info.name || 'Product Name'}
                      price={info.price || 'N/A'}
                      originalPrice={129.0}
                      timestamp={item.timestamp}
                      url={info.product_url || info.url || '#'}
                      isFavorite={favorites.has(item.record_id)}
                      onToggleFavorite={() => toggleFavorite(item.record_id)}
                    />
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

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
              <img
                src={selectedProduct.result_image_url}
                alt="Product"
                className="rounded-xl w-full object-cover"
              />
            </div>
            <div className="w-1/2 flex flex-col justify-center gap-4">
              <h2 className="text-2xl font-bold text-gray-900">
                {selectedProduct.product_info?.brand_name || 'Brand'} -{' '}
                {selectedProduct.product_info?.product_name || 'Product Name'}
              </h2>
              <div className="flex items-center gap-3">
                <span className="text-2xl font-bold text-black">
                  {selectedProduct.product_info?.price}
                </span>
              </div>
              <p className="text-gray-600 text-sm">
                Try-on date: {new Date(selectedProduct.timestamp).toLocaleDateString()}
              </p>
              <a
                href={selectedProduct.product_info?.product_url || '#'}
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
