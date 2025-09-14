import React, { useState, useEffect } from 'react';
import { ShoppingBag, TrendingUp, Star, Filter, X } from 'lucide-react';
import empty from '/empty.png';
import { tryonApi, DealsItem, DealsRecommendParams } from '../../api/tryon';

interface DealsContentProps {
  searchQuery: string;
}

const DealsContent: React.FC<DealsContentProps> = ({ searchQuery }) => {
  const [deals, setDeals] = useState<DealsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter states
  const [filters, setFilters] = useState<DealsRecommendParams>({
    price_min: 100,
    price_max: 200,
    size: 'S',
    keyword: 'swim',
    page_size: 20,
    affiliate: 'impact'
  });

  // Load deals data
  const loadDeals = async (params: DealsRecommendParams) => {
    setLoading(true);
    setError(null);
    try {
      const response = await tryonApi.getDealsRecommend(params);
      if (response.success) {
        setDeals(response.data);
      } else {
        setError('Failed to load deals');
      }
    } catch (err) {
      console.error('Error loading deals:', err);
      setError('Failed to load deals');
    } finally {
      setLoading(false);
    }
  };

  // Load deals on component mount and filter changes
  useEffect(() => {
    loadDeals(filters);
  }, []);

  // Apply filters
  const applyFilters = () => {
    loadDeals(filters);
    setShowFilters(false);
  };

  // Reset filters to default
  const resetFilters = () => {
    const defaultFilters = {
      price_min: 100,
      price_max: 200,
      size: 'S',
      keyword: 'swim',
      page_size: 20,
      affiliate: 'impact'
    };
    setFilters(defaultFilters);
    loadDeals(defaultFilters);
    setShowFilters(false);
  };

  // Filter deals based on search query
  const filteredDeals = deals.filter(deal =>
    deal.Name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (deal.Manufacturer && deal.Manufacturer.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (deal.CampaignName && deal.CampaignName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (loading) {
    return (
      <section className="px-10 py-6 min-h-[calc(100vh-150px)] bg-gray-50 mx-auto rounded-md flex flex-col items-center gap-6">
        <div className="flex justify-center items-center mt-20">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 border-2 border-[#6C5DD3] border-t-transparent rounded-full animate-spin" />
            <span className="text-gray-600">Loading deals...</span>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="px-10 py-6 min-h-[calc(100vh-150px)] bg-gray-50 mx-auto rounded-md flex flex-col items-center gap-6">
        <div className="flex flex-col items-center justify-center gap-4 mt-20">
          <div className="text-red-500 text-center">
            <h3 className="text-xl font-semibold mb-2">Error Loading Deals</h3>
            <p className="text-sm">{error}</p>
          </div>
          <button
            onClick={() => loadDeals(filters)}
            className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition"
          >
            Try Again
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="px-10 py-6 min-h-[calc(100vh-150px)] bg-gray-50 mx-auto rounded-md flex flex-col items-center gap-6">
      <div className="max-w-[1280px] w-full">
        {filteredDeals.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-6 mt-20">
            <img src={empty} alt="no deals" className="w-24 h-24" />
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No Deals Found</h3>
              <p className="text-gray-600 text-sm">Try adjusting your search or filters to find more deals!</p>
            </div>
            <button
              onClick={resetFilters}
              className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <>
            {/* Header with filters */}
            <div className="flex items-center justify-between mb-8 border-b pb-4">
              <div className="flex items-center gap-2 text-2xl font-bold text-gray-800">
                <ShoppingBag className="w-6 h-6" />
                <span>Deals For You</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <TrendingUp className="w-4 h-4" />
                  <span>{filteredDeals.length} deals available</span>
                </div>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition"
                >
                  <Filter className="w-4 h-4" />
                  Filters
                </button>
              </div>
            </div>

            {/* Filters Panel */}
            {showFilters && (
              <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Filters</h3>
                  <button
                    onClick={() => setShowFilters(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Min Price ($)
                    </label>
                    <input
                      type="number"
                      value={filters.price_min || ''}
                      onChange={(e) => setFilters({...filters, price_min: Number(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                      placeholder="Min price"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Max Price ($)
                    </label>
                    <input
                      type="number"
                      value={filters.price_max || ''}
                      onChange={(e) => setFilters({...filters, price_max: Number(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                      placeholder="Max price"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Size
                    </label>
                    <select
                      value={filters.size || ''}
                      onChange={(e) => setFilters({...filters, size: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                    >
                      <option value="">Any Size</option>
                      <option value="XS">XS</option>
                      <option value="S">S</option>
                      <option value="M">M</option>
                      <option value="L">L</option>
                      <option value="XL">XL</option>
                      <option value="XXL">XXL</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Keyword
                    </label>
                    <input
                      type="text"
                      value={filters.keyword || ''}
                      onChange={(e) => setFilters({...filters, keyword: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                      placeholder="e.g. swim, dress"
                    />
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={applyFilters}
                    className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition"
                  >
                    Apply Filters
                  </button>
                  <button
                    onClick={resetFilters}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition"
                  >
                    Reset
                  </button>
                </div>
              </div>
            )}

            {/* Deals Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {filteredDeals.map((deal) => (
                <div
                  key={deal.Id}
                  className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition cursor-pointer flex flex-col h-full"
                >
                  {/* Deal Badge */}
                  <div className="relative">
                    {deal.DiscountPercentage && (
                      <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded z-10 font-bold">
                        -{deal.DiscountPercentage}% OFF
                      </div>
                    )}
                    <div className="w-full h-72 bg-gray-100 flex items-center justify-center">
                      <img
                        src={deal.ImageUrl}
                        alt={deal.Name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = empty;
                        }}
                      />
                    </div>
                  </div>

                  {/* Deal Info */}
                  <div className="p-4 flex flex-col justify-between flex-grow">
                    <div>
                      {deal.Manufacturer && (
                        <p className="text-gray-500 text-xs uppercase tracking-wide font-medium mb-1">
                          {deal.Manufacturer}
                        </p>
                      )}
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                        {deal.Name}
                      </h3>
                      {deal.Description && (
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                          {deal.Description.length > 100 
                            ? deal.Description.substring(0, 100) + '...' 
                            : deal.Description
                          }
                        </p>
                      )}
                    </div>

                    {/* Size and Color Info */}
                    <div className="flex flex-wrap gap-1 mb-3">
                      {deal.Size && (
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                          Size: {deal.Size}
                        </span>
                      )}
                      {deal.Colors && deal.Colors.length > 0 && (
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                          {deal.Colors.join(', ')}
                        </span>
                      )}
                    </div>

                    {/* Price */}
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-lg font-bold text-black">
                        {deal.Currency}{deal.CurrentPrice}
                      </span>
                      {deal.OriginalPrice && deal.OriginalPrice !== deal.CurrentPrice && (
                        <span className="text-sm text-gray-500 line-through">
                          {deal.Currency}{deal.OriginalPrice}
                        </span>
                      )}
                    </div>

                    {/* Stock Status */}
                    {deal.StockAvailability && (
                      <div className="mb-3">
                        <span className={`text-xs px-2 py-1 rounded ${
                          deal.StockAvailability === 'InStock' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {deal.StockAvailability === 'InStock' ? 'In Stock' : 'Out of Stock'}
                        </span>
                      </div>
                    )}

                    {/* CTA Button */}
                    <a
                      href={deal.Url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-black text-white py-2 px-4 rounded-lg hover:bg-gray-800 transition font-medium text-center block"
                    >
                      View Deal
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default React.memo(DealsContent);