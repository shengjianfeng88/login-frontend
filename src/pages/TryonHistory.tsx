// The exported code uses Tailwind CSS. Install Tailwind CSS in your dev environment to ensure all styles work.
import React, { useState, useEffect } from 'react';
import { Input, Dropdown, Menu, Badge, Tooltip, Button } from 'antd';
import {
  SearchOutlined,
  UserOutlined,
  HeartOutlined,
  HeartFilled,
  CameraOutlined,
  DownOutlined,
  CheckOutlined,
  FilterOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
const App: React.FC = () => {
  const [favorites, setFavorites] = useState<number[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<string>('Discount');
  const [activeProductId, setActiveProductId] = useState<number | null>(null);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState<boolean>(false);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const products = [
    {
      id: 1,
      brand: 'Zara',
      name: 'Floral Print Summer Dress',
      price: 103.2,
      originalPrice: 129.0,
      discount: '20% OFF',
      date: '4/10/2024',
      image:
        'https://readdy.ai/api/search-image?query=fashion%20photography%20of%20a%20woman%20wearing%20a%20bright%20yellow%20outfit%20with%20hoodie%20and%20pants%20standing%20on%20a%20beach%20with%20clear%20blue%20sky%2C%20professional%20fashion%20photography%2C%20high%20quality%2C%20summer%20collection&width=300&height=400&seq=1&orientation=portrait',
    },
    {
      id: 2,
      brand: 'GAP',
      name: 'UltraSoft Denim Maxi Dress',
      price: 165.75,
      originalPrice: 195.0,
      discount: '15% OFF',
      date: '4/11/2024',
      image:
        'https://readdy.ai/api/search-image?query=fashion%20photography%20of%20a%20woman%20wearing%20a%20light%20blue%20flowing%20maxi%20dress%20on%20a%20beach%2C%20professional%20fashion%20photography%2C%20high%20quality%2C%20summer%20collection%2C%20elegant%20pose%2C%20ocean%20background&width=300&height=400&seq=2&orientation=portrait',
    },
    {
      id: 3,
      brand: 'Uniqlo',
      name: 'Basic Cotton Blend Sweater',
      price: 134.1,
      originalPrice: 149.0,
      discount: '10% OFF',
      date: '4/08/2024',
      image:
        'https://readdy.ai/api/search-image?query=professional%20fashion%20photography%20of%20a%20clothing%20rack%20with%20various%20coats%20and%20jackets%20in%20neutral%20colors%2C%20wooden%20floor%20with%20white%20rug%20and%20shoes%20below%2C%20minimalist%20style%2C%20high%20quality%20retail%20display&width=300&height=400&seq=3&orientation=portrait',
    },
    {
      id: 4,
      brand: 'H&M',
      name: 'Cotton Casual T-Shirt',
      price: 89.0,
      originalPrice: 99.0,
      discount: '10% OFF',
      date: '4/08/2024',
      image:
        'https://readdy.ai/api/search-image?query=professional%20fashion%20photography%20of%20white%20sneakers%20and%20gray%20pants%20on%20dark%20background%2C%20minimalist%20style%2C%20high%20quality%20retail%20display%2C%20product%20photography%20with%20dramatic%20lighting&width=300&height=400&seq=4&orientation=portrait',
    },
    {
      id: 5,
      brand: 'Mango',
      name: 'Tailored Linen Suit Set',
      price: 178.5,
      originalPrice: 210.0,
      discount: '',
      date: '4/12/2024',
      image:
        'https://readdy.ai/api/search-image?query=fashion%20photography%20of%20a%20woman%20wearing%20a%20gray%20linen%20suit%20with%20blazer%20and%20pants%20against%20a%20neutral%20beige%20wall%2C%20professional%20fashion%20photography%2C%20high%20quality%2C%20spring%20collection%2C%20urban%20style&width=300&height=400&seq=5&orientation=portrait',
      hasMultiplePhotos: true,
      photoCount: 3,
    },
  ];
  useEffect(() => {
    applyFilters();
  }, [favorites, showFavoritesOnly, selectedFilter]);
  const toggleFavorite = (id: number) => {
    if (favorites.includes(id)) {
      setFavorites(favorites.filter((item) => item !== id));
    } else {
      setFavorites([...favorites, id]);
    }
  };
  const openProductModal = (id: number) => {
    setActiveProductId(id);
  };
  const closeProductModal = () => {
    setActiveProductId(null);
  };
  const toggleFavoritesFilter = () => {
    setShowFavoritesOnly(!showFavoritesOnly);
  };
  const applyFilters = () => {
    let result = [...products];
    // Apply favorites filter if enabled
    if (showFavoritesOnly) {
      result = result.filter((product) => favorites.includes(product.id));
    }
    // Apply sorting based on selected filter
    switch (selectedFilter) {
      case 'Date':
        result.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        break;
      case 'Brand':
        result.sort((a, b) => a.brand.localeCompare(b.brand));
        break;
      case 'Price: Low to High':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'Price: High to Low':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'Discount':
        result.sort((a, b) => {
          const discountA = a.discount ? parseFloat(a.discount) : 0;
          const discountB = b.discount ? parseFloat(b.discount) : 0;
          return discountB - discountA;
        });
        break;
      default:
        break;
    }
    setFilteredProducts(result);
  };
  const filterItems: MenuProps['items'] = [
    {
      key: 'date',
      label: 'Try-on Date',
    },
    {
      key: 'brand',
      label: 'Brand',
    },
    {
      key: 'price-low-high',
      label: 'Price: Low to High',
    },
    {
      key: 'price-high-low',
      label: 'Price: High to Low',
    },
    {
      key: 'discount',
      label: (
        <div className='flex items-center'>
          {selectedFilter === 'Discount' && <CheckOutlined className='mr-2' />}
          <span>Discount</span>
        </div>
      ),
    },
  ];
  const handleFilterClick: MenuProps['onClick'] = (e) => {
    const filterMap: Record<string, string> = {
      date: 'Try-on Date',
      brand: 'Brand',
      'price-low-high': 'Price: Low to High',
      'price-high-low': 'Price: High to Low',
      discount: 'Discount',
    };
    setSelectedFilter(filterMap[e.key]);
  };
  const menu = (
    <Menu
      onClick={handleFilterClick}
      items={filterItems}
      className='py-2 w-48'
    />
  );
  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Header */}
      <header className='bg-white shadow-sm py-4 px-8 flex items-center justify-between'>
        <div className='text-xl font-bold text-gray-800'>fAIshion.AI</div>
        <div className='flex items-center w-1/2 gap-6'>
          <Input
            prefix={<SearchOutlined className='text-gray-400' />}
            placeholder='Search your try-on history...'
            className='rounded-lg border-gray-200'
            onChange={(e) => {
              const searchTerm = e.target.value.toLowerCase();
              const filtered = products.filter(
                (product) =>
                  product.name.toLowerCase().includes(searchTerm) ||
                  product.brand.toLowerCase().includes(searchTerm) ||
                  product.date.toLowerCase().includes(searchTerm)
              );
              setFilteredProducts(filtered);
            }}
          />
        </div>
        <div className='cursor-pointer'>
          <UserOutlined className='text-xl text-gray-700' />
        </div>
      </header>
      {/* Main Content */}
      <main className='max-w-7xl mx-auto px-4 py-8'>
        <div className='flex justify-between items-center mb-8'>
          <div className='flex items-center'>
            <CameraOutlined className='text-xl mr-2' />
            <h1 className='text-2xl font-semibold'>Try-on History</h1>
          </div>
          <div className='flex items-center space-x-4'>
            <Button
              icon={
                showFavoritesOnly ? (
                  <HeartFilled className='text-red-500' />
                ) : (
                  <HeartOutlined />
                )
              }
              onClick={toggleFavoritesFilter}
              className={`flex items-center ${
                showFavoritesOnly
                  ? 'bg-blue-50 text-blue-600 border-blue-300'
                  : 'bg-white'
              } !rounded-button whitespace-nowrap cursor-pointer`}
            >
              {showFavoritesOnly ? 'All Items' : 'Favorites'}
            </Button>
            <Dropdown overlay={menu} trigger={['click']}>
              <Button className='flex items-center border rounded-lg px-4 py-2 bg-white !rounded-button whitespace-nowrap cursor-pointer'>
                <span className='mr-2'>{selectedFilter}</span>
                <DownOutlined />
              </Button>
            </Dropdown>
          </div>
        </div>
        {/* Product Grid */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <div
                key={product.id}
                className='bg-white rounded-lg shadow-sm overflow-hidden'
              >
                <div className='relative'>
                  <div
                    className='cursor-pointer'
                    onClick={() => openProductModal(product.id)}
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      className='w-full h-80 object-cover object-top'
                    />
                    {product.discount && (
                      <div className='absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded'>
                        {product.discount}
                      </div>
                    )}
                    <div className='absolute top-3 right-3 bg-white bg-opacity-80 text-xs px-2 py-1 rounded'>
                      {product.date}
                    </div>
                    {product.hasMultiplePhotos && (
                      <div className='absolute bottom-3 left-3 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded'>
                        +{product.photoCount} photos
                      </div>
                    )}
                  </div>
                </div>
                <div className='p-4'>
                  <div className='flex justify-between items-center mb-2'>
                    <div className='text-sm text-gray-500'>{product.brand}</div>
                    <button
                      onClick={() => toggleFavorite(product.id)}
                      className='cursor-pointer'
                    >
                      {favorites.includes(product.id) ? (
                        <HeartFilled className='text-red-500 text-xl' />
                      ) : (
                        <HeartOutlined className='text-gray-400 text-xl hover:text-gray-600' />
                      )}
                    </button>
                  </div>
                  <h3 className='font-medium mb-2'>{product.name}</h3>
                  <div className='flex items-center'>
                    <span className='font-bold text-gray-900'>
                      ${product.price.toFixed(2)}
                    </span>
                    {product.originalPrice && (
                      <span className='ml-2 text-gray-500 line-through text-sm'>
                        ${product.originalPrice.toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className='col-span-4 py-16 text-center'>
              <div className='text-gray-500 text-lg'>No items found</div>
              {showFavoritesOnly && (
                <p className='mt-2 text-gray-400'>
                  You haven't saved any favorites yet
                </p>
              )}
              {showFavoritesOnly && (
                <Button
                  onClick={toggleFavoritesFilter}
                  className='mt-4 !rounded-button whitespace-nowrap cursor-pointer'
                >
                  Show All Items
                </Button>
              )}
            </div>
          )}
        </div>
      </main>
      {/* Product Modal */}
      {activeProductId !== null && (
        <div
          className='fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50'
          onClick={closeProductModal}
        >
          <div
            className='bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto relative'
            onClick={(e) => e.stopPropagation()}
          >
            {products.find((p) => p.id === activeProductId)
              ?.hasMultiplePhotos && (
              <div className='absolute top-1/2 -translate-y-1/2 flex justify-between w-full px-4'>
                <button className='bg-black bg-opacity-50 text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-opacity-70'>
                  <i className='fas fa-chevron-left'></i>
                </button>
                <button className='bg-black bg-opacity-50 text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-opacity-70'>
                  <i className='fas fa-chevron-right'></i>
                </button>
              </div>
            )}
            <div className='p-6'>
              <div className='flex justify-between mb-4'>
                <h2 className='text-2xl font-bold'>
                  {products.find((p) => p.id === activeProductId)?.brand} -{' '}
                  {products.find((p) => p.id === activeProductId)?.name}
                </h2>
                <button
                  onClick={closeProductModal}
                  className='text-gray-500 hover:text-gray-700 cursor-pointer'
                >
                  <i className='fas fa-times text-xl'></i>
                </button>
              </div>
              <div className='flex flex-col md:flex-row gap-6'>
                <div className='md:w-1/2'>
                  <img
                    src={products.find((p) => p.id === activeProductId)?.image}
                    alt={products.find((p) => p.id === activeProductId)?.name}
                    className='w-full h-auto rounded-lg object-cover'
                  />
                </div>
                <div className='md:w-1/2'>
                  <div className='mb-4'>
                    <div className='text-lg text-gray-600 mb-1'>
                      {products.find((p) => p.id === activeProductId)?.brand}
                    </div>
                    <h3 className='text-2xl font-semibold mb-2'>
                      {products.find((p) => p.id === activeProductId)?.name}
                    </h3>
                    <div className='flex items-center mb-4'>
                      <span className='text-xl font-bold'>
                        $
                        {products
                          .find((p) => p.id === activeProductId)
                          ?.price.toFixed(2)}
                      </span>
                      {products.find((p) => p.id === activeProductId)
                        ?.originalPrice && (
                        <span className='ml-3 text-gray-500 line-through'>
                          $
                          {products
                            .find((p) => p.id === activeProductId)
                            ?.originalPrice.toFixed(2)}
                        </span>
                      )}
                      {products.find((p) => p.id === activeProductId)
                        ?.discount && (
                        <span className='ml-3 bg-red-500 text-white px-2 py-1 rounded text-sm'>
                          {
                            products.find((p) => p.id === activeProductId)
                              ?.discount
                          }
                        </span>
                      )}
                    </div>
                  </div>
                  <div className='mb-6'>
                    <div className='text-gray-700 mb-4'>
                      <p>
                        Try-on date:{' '}
                        {products.find((p) => p.id === activeProductId)?.date}
                      </p>
                    </div>
                    <div className='flex space-x-4'>
                      <button className='bg-black text-white py-3 px-6 rounded-lg font-medium !rounded-button whitespace-nowrap cursor-pointer'>
                        Shop Now
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default App;
