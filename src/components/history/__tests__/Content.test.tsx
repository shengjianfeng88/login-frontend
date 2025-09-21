import { render, screen, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import Content from '../Content';
import axios from 'axios';

// Mock axios
vi.mock('axios', () => ({
  default: {
    get: vi.fn(),
  },
}));

const mockedAxios = axios as typeof axios & {
  get: ReturnType<typeof vi.fn>;
};

// Mock store with history reducer
const mockStore = configureStore({
  reducer: {
    user: (state = {}) => state,
    history: (state = {
      products: [],
      currentPage: 1,
      hasMore: true,
      loading: false,
      searchQuery: '',
      sortOrder: null,
      scrollPosition: 0,
      initialized: false,
    }) => state,
  },
});

// Mock setSearchQuery function
const mockSetSearchQuery = vi.fn();

describe('Facebook Share Feature', () => {
  beforeEach(() => {
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn(() => 'fake-access-token'),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
      },
      writable: true,
    });

    // Mock window.open
    Object.defineProperty(window, 'open', {
      value: vi.fn(),
      writable: true,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Component Loading States', () => {
    it('should render without crashing', () => {
      mockedAxios.get.mockResolvedValue({ data: [] });

      render(
        <Provider store={mockStore}>
          <Content searchQuery="" setSearchQuery={mockSetSearchQuery} />
        </Provider>
      );

      expect(screen.getByText('Try-on History')).toBeInTheDocument();
    });

    it('should render component without error when no products are returned', async () => {
      mockedAxios.get.mockResolvedValue({ data: [] });

      render(
        <Provider store={mockStore}>
          <Content searchQuery="" setSearchQuery={mockSetSearchQuery} />
        </Provider>
      );

      await waitFor(() => {
        expect(screen.getByText('Try-on History')).toBeInTheDocument();
      });
    });
  });

  describe('Facebook Share Button Functionality', () => {
    it('should render component successfully', async () => {
      mockedAxios.get.mockResolvedValue({ data: [] });

      render(
        <Provider store={mockStore}>
          <Content searchQuery="" setSearchQuery={mockSetSearchQuery} />
        </Provider>
      );

      await waitFor(() => {
        expect(screen.getByText('Try-on History')).toBeInTheDocument();
      });
    });
  });
});
