import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Camera, Heart, ChevronDown, X } from 'lucide-react';
import empty from '/empty.png';

const TryOnSubHeader: React.FC = () => {
  return (
    <div className="flex items-center justify-between px-10 mt-4 mb-8 border-b pb-4">
      <div className="flex items-center gap-2 text-2xl font-bold text-gray-800">
        <Camera className="w-6 h-6" />
        <span>Try-on History</span>
      </div>
      <div className="flex items-center gap-4">
        <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition">
          <Heart className="w-4 h-4" />
          Favorites
        </button>
        <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition">
          Sort By
          <ChevronDown className="w-4 h-4" />
        </button>
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
}

const ProductCard: React.FC<ProductProps> = ({ image, brand, name, price, originalPrice, timestamp, url }) => (
  <div className="relative bg-white rounded-2xl overflow-hidden shadow-lg w-full hover:shadow-xl transition cursor-pointer">
    <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded font-semibold z-10">
      20% OFF
    </div>
    <div className="absolute top-2 right-2 bg-gray-100 text-xs px-2 py-1 rounded z-10 text-gray-600">
      {new Date(timestamp).toLocaleDateString()}
    </div>

    <img src={image} alt="Product" className="w-full h-64 object-cover rounded-t-2xl" />

    <div className="p-4">
      <p className="text-gray-500 text-xs uppercase tracking-wide font-medium mb-1">{brand}</p>
      <p className="text-lg font-semibold text-gray-900 truncate">{name}</p>
      <div className="flex items-center gap-2 mt-2">
        <span className="text-lg font-bold text-black">{price}</span>
        {originalPrice && <span className="text-sm text-gray-400 line-through">{originalPrice}</span>}
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
  const accessToken = localStorage.getItem('accessToken');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        // const res = await axios.get<ProductItem[]>('https://tryon-history.faishion.ai/history', {
        //   headers: {
        //     Authorization: `Bearer ${accessToken}`,
        //   },
        // });

      const res = [
    {
        "product_info": {
            "name": "Test Product",
            "price": "$29.99",
            "url": "https://example.com/product"
        },
        "record_id": "685c916eaf846498603250f2",
        "result_image_url": "https://example.com/test-image.png",
        "timestamp": "2025-06-26T00:16:46.336000",
        "user_email": "alinapanyue@gmail.com",
        "user_id": "680befac49e3107d70440d3d"
    },
    {
        "product_info": {
            "brand_name": "EDSTAR",
            "domain": "www.amazon.com",
            "price": "$28.99",
            "product_name": "EDSTAR Women Dolman Batwing Sleeves Knitted Sweaters Winter Boat Neck Pullovers Tops",
            "product_url": "https://www.amazon.com/dp/B0F32M72LL/ref=sspa_dk_browse_0/?_encoding=UTF8&ie=UTF8&psc=1&sp_csd=d2lkZ2V0TmFtZT1zcF9icm93c2VfdGhlbWF0aWM%3D&pd_rd_w=Sq7Tv&content-id=amzn1.sym.3f42e3f9-f82f-42ca-8d18-eb6a0d6a19a3&pf_rd_p=3f42e3f9-f82f-42ca-8d18-eb6a0d6a19a3&pf_rd_r=9VJ45X8VCVTEHQ813PCH&pd_rd_wg=TnjhF&pd_rd_r=7930e71e-1ec3-4f5e-b388-4a51de94ae78&ref_=sspa_dk_browse"
        },
        "record_id": "685a5e7faf846498603250f1",
        "result_image_url": "https://faishionai.s3.amazonaws.com/tryon-results/1750752848.png",
        "timestamp": "2025-06-24T08:14:55.689000",
        "user_email": "alinapanyue@gmail.com",
        "user_id": "680befac49e3107d70440d3d"
    },
    {
        "product_info": {
            "brand_name": "Fuinloth",
            "domain": "www.amazon.com",
            "price": "$35.99",
            "product_name": "Fuinloth Women's Cardigan Sweater, Oversized Chunky Knit Button Closure with Pockets",
            "product_url": "https://www.amazon.com/Fuinloth-Cardigan-Sweater-Oversized-Closure/dp/B08V233315?ref_=pd_ci_mcx_mh_pe_rm_d1_cai_p_2_0&pd_rd_i=B08V21TRWZ&pd_rd_w=gNgk1&content-id=amzn1.sym.57b80066-10e8-4be7-a5f2-ce3f1faa4959&pf_rd_p=57b80066-10e8-4be7-a5f2-ce3f1faa4959&pf_rd_r=3E887D4ZNKKQYJVPVAFJ&pd_rd_wg=FjLM5&pd_rd_r=270dead3-8624-4dae-888e-3c0b267a0bab&th=1"
        },
        "record_id": "68577d0d1cfb2fbd5687536e",
        "result_image_url": "https://faishionai.s3.amazonaws.com/tryon-results/1750564061.png",
        "timestamp": "2025-06-22T03:48:29.401000",
        "user_email": "alinapanyue@gmail.com",
        "user_id": "680befac49e3107d70440d3d"
    },
    {
        "product_info": {
            "brand_name": "EDSTAR",
            "domain": "www.amazon.com",
            "price": "$28.99",
            "product_name": "EDSTAR Women Dolman Batwing Sleeves Knitted Sweaters Winter Boat Neck Pullovers Tops",
            "product_url": "https://www.amazon.com/dp/B0CWRDP7WT/ref=sspa_dk_browse_0/?_encoding=UTF8&ie=UTF8&sp_csd=d2lkZ2V0TmFtZT1zcF9icm93c2VfdGhlbWF0aWM%3D&pd_rd_w=Sq7Tv&content-id=amzn1.sym.3f42e3f9-f82f-42ca-8d18-eb6a0d6a19a3&pf_rd_p=3f42e3f9-f82f-42ca-8d18-eb6a0d6a19a3&pf_rd_r=9VJ45X8VCVTEHQ813PCH&pd_rd_wg=TnjhF&pd_rd_r=7930e71e-1ec3-4f5e-b388-4a51de94ae78&ref_=sspa_dk_browse&th=1&psc=1"
        },
        "record_id": "68576a071cfb2fbd5687536d",
        "result_image_url": "https://faishionai.s3.amazonaws.com/tryon-results/1750559194.png",
        "timestamp": "2025-06-22T02:27:19.062000",
        "user_email": "alinapanyue@gmail.com",
        "user_id": "680befac49e3107d70440d3d"
    },
    {
        "product_info": {
            "brand_name": "Fuinloth",
            "domain": "www.amazon.com",
            "price": "$35.99",
            "product_name": "Fuinloth Women's Cardigan Sweater, Oversized Chunky Knit Button Closure with Pockets",
            "product_url": "https://www.amazon.com/Fuinloth-Cardigan-Sweater-Oversized-Closure/dp/B08V21TRWZ?ref_=pd_ci_mcx_mh_pe_rm_d1_cai_p_2_0&pd_rd_i=B08V21TRWZ&pd_rd_w=gNgk1&content-id=amzn1.sym.57b80066-10e8-4be7-a5f2-ce3f1faa4959&pf_rd_p=57b80066-10e8-4be7-a5f2-ce3f1faa4959&pf_rd_r=3E887D4ZNKKQYJVPVAFJ&pd_rd_wg=FjLM5&pd_rd_r=270dead3-8624-4dae-888e-3c0b267a0bab&th=1&psc=1"
        },
        "record_id": "6856e18d1cfb2fbd5687536c",
        "result_image_url": "https://faishionai.s3.amazonaws.com/tryon-results/1750524252.png",
        "timestamp": "2025-06-21T16:45:01.022000",
        "user_email": "alinapanyue@gmail.com",
        "user_id": "680befac49e3107d70440d3d"
    }
]

        setProducts(res);
      } catch (error) {
        console.error('Error fetching history:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [accessToken]);

  const NoHistory = !loading && products.length === 0;

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
            <TryOnSubHeader />
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 w-full">
              {products.map((item) => {
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
                {selectedProduct.product_info?.brand_name || 'Brand'} - {selectedProduct.product_info?.product_name || 'Product Name'}
              </h2>
              <p className="text-gray-500 text-sm">{selectedProduct.product_info?.brand_name}</p>
              <div className="flex items-center gap-3">
                <span className="text-2xl font-bold text-black">
                  {selectedProduct.product_info?.price}
                </span>
                <span className="line-through text-gray-400">
                  $129.00
                </span>
                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded font-semibold">
                  20% OFF
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
