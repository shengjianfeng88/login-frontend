import { createSlice, PayloadAction } from '@reduxjs/toolkit';

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
  tryOnImages: string[];
}

interface HistoryState {
  products: ProductItem[];
  currentPage: number;
  hasMore: boolean;
  loading: boolean;
  searchQuery: string;
  sortOrder: 'low-to-high' | 'high-to-low' | null;
  scrollPosition: number;
  initialized: boolean; // Track if data has been loaded
}

const initialState: HistoryState = {
  products: [],
  currentPage: 1,
  hasMore: true,
  loading: false,
  searchQuery: '',
  sortOrder: null,
  scrollPosition: 0,
  initialized: false,
};

const historySlice = createSlice({
  name: 'history',
  initialState,
  reducers: {
    setProducts: (state, action: PayloadAction<ProductItem[]>) => {
      state.products = action.payload;
      state.initialized = true;
    },
    appendProducts: (state, action: PayloadAction<ProductItem[]>) => {
      state.products = [...state.products, ...action.payload];
    },
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
    setHasMore: (state, action: PayloadAction<boolean>) => {
      state.hasMore = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setSortOrder: (state, action: PayloadAction<'low-to-high' | 'high-to-low' | null>) => {
      state.sortOrder = action.payload;
    },
    setScrollPosition: (state, action: PayloadAction<number>) => {
      state.scrollPosition = action.payload;
    },
    updateProductFavorite: (state, action: PayloadAction<{ productUrl: string; isFavorite: boolean }>) => {
      const { productUrl, isFavorite } = action.payload;
      state.products = state.products.map(p => {
        const url = p.productInfo?.product_url || p.productInfo?.url || 'unknown';
        if (url === productUrl) {
          return { ...p, isFavorite };
        }
        return p;
      });
    },
    removeProduct: (state, action: PayloadAction<string>) => {
      const productUrl = action.payload;
      state.products = state.products.filter(p => {
        const url = p.productInfo?.product_url || p.productInfo?.url || 'unknown';
        return url !== productUrl;
      });
    },
    resetHistory: (state) => {
      return initialState;
    },
  },
});

export const {
  setProducts,
  appendProducts,
  setCurrentPage,
  setHasMore,
  setLoading,
  setSearchQuery,
  setSortOrder,
  setScrollPosition,
  updateProductFavorite,
  removeProduct,
  resetHistory,
} = historySlice.actions;

export default historySlice.reducer;