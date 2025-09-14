import axios from 'axios';

// 创建 axios 实例用于试穿服务（第三方 API，不通过 proxy）
const axiosInstance = axios.create({
  baseURL: 'https://tryon-advanced-canary.faishion.ai',
  headers: {
    'Content-Type': 'application/json',
  },
});

// 创建用于上传图片的 axios 实例（使用 proxy）
const uploadAxiosInstance = axios.create({
  baseURL: 'https://staging-api-auth.faishion.ai',
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});

// 创建用于保存测试结果的 axios 实例（使用 proxy）
const saveTestResultsAxiosInstance = axios.create({
  baseURL: 'https://staging-api-auth.faishion.ai',
  headers: {
    'Content-Type': 'application/json',
  },
});

// 类型定义
export type UploadImageResponse = {
  success: boolean;
  url?: string;
  message?: string;
  error?: string;
};

export type TestHistoryItem = {
  _id: string;
  testNo?: string;
  userImage: string;
  clothingImage: string;
  generatedResult: string;
  taskId: string;
  status: string;
  completedSteps?: number;
  estimatedSteps?: number;
  executionTime: number;
  delayTime?: number;
  cost?: number;
  score?: number;
  error?: string | null;
  savedAt?: string;
  createdAt: string;
  __v: number;
  modelId?: string;
};

export type TestHistoryQuery = {
  queryType: 'all' | 'byFilter';
  taskId?: string;
  modelId?: string;
  startTime?: string;
  endTime?: string;
  page?: number;
  limit?: number;
};

export type QueryTestHistoryResponse = {
  success: boolean;
  data: TestHistoryItem[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  queryInfo: {
    queryType: string;
  };
};

export type TestHistoryResponse = {
  success: boolean;
  data: TestHistoryItem[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

export type TestResult = {
  userImage: string;
  clothingImage: string;
  generatedResult?: string;
  status: string;
  taskId?: string;
  executionTime?: number;
};

export type TryOnResponse = {
  image: string;
  uuid?: string;
  status: string;
  result_image_url?: string;
  modelId?: string;
};

export type DealsRecommendParams = {
  price_min?: number;
  price_max?: number;
  size?: string;
  keyword?: string;
  page_size?: number;
  affiliate?: string;
};

export type DealsItem = {
  Id: string;
  Name: string;
  Description: string;
  Manufacturer?: string;
  ImageUrl: string;
  Url: string;
  CurrentPrice: string;
  OriginalPrice?: string;
  DiscountPercentage?: string;
  Currency: string;
  Size?: string;
  Colors?: string[];
  StockAvailability?: string;
  CampaignName?: string;
  Category?: string;
  Labels?: string[];
};

export type DealsResponse = {
  success: boolean;
  data: DealsItem[];
  total?: number;
  page?: number;
  page_size?: number;
};

// 辅助函数：将 File 对象转换为 FormData
function createFormData(file: File): FormData {
  const formData = new FormData();
  formData.append('file', file); // 字段名必须是 'file'
  return formData;
}

// API 函数
export const tryonApi = {
  // 上传图片
  async uploadImage(file: File): Promise<UploadImageResponse> {
    try {
      // 获取认证 token
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('未找到认证 token，请先登录');
      }

      const formData = createFormData(file);
      const response = await uploadAxiosInstance.post('/V1/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });

      // 后端返回格式: { url: data.Location }
      return {
        success: true,
        url: response.data.url,
        message: '图片上传成功',
      };
    } catch (error: unknown) {
      console.error('图片上传失败:', error);

      // 处理不同类型的错误
      if (axios.isAxiosError(error)) {
        // 服务器返回错误响应
        const errorMessage = error.response?.data?.error || '图片上传失败';
        return {
          success: false,
          error: errorMessage,
        };
      } else if (error instanceof Error) {
        // 其他错误
        return {
          success: false,
          error: error.message || '图片上传失败',
        };
      } else {
        // 未知错误
        return {
          success: false,
          error: '图片上传失败',
        };
      }
    }
  },

  // 发起试穿请求
  async startTryon(
    userImage: string,
    clothingImage: string,
    signal?: AbortSignal
  ): Promise<TryOnResponse> {
    try {
      // 直接使用图片 URL，不再转换为 base64
      const response = await axiosInstance.post(
        '/upload/images',
        {
          // access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ODM5MzVmZWIzMjliNTI0MTNkOGQ2YTUiLCJwaWN0dXJlIjoiaHR0cHM6Ly9saDMuZ29vZ2xldXNlcmNvbnRlbnQuY29tL2EvQUNnOG9jSVN5dHEtQnNWcTItRTNXNGFoTG9CZTdYRVdZb0h1RmhoU3V4VjRLTy02cEdUTHlBPXM5Ni1jIiwiZW1haWwiOiJqaWFuZmVuZ3NoZW5nMEBnbWFpbC5jb20iLCJpYXQiOjE3NDk4ODg4NTgsImV4cCI6MTc0OTg4OTc1OH0.woufGJfaaL9fz6DDJmAc3GAxm4Bg2aGMLFqgxlbAhaA',
          face: userImage, // 直接使用 URL
          model: clothingImage, // 直接使用 URL
          prompt: '',
        },
        {
          signal, // 添加 signal 用于终止请求
        }
      );
      return response.data;
    } catch (error) {
      console.error('试穿请求失败:', error);
      throw error;
    }
  },

  // 统一查询接口
  async queryTestHistory(
    query: TestHistoryQuery
  ): Promise<QueryTestHistoryResponse> {
    try {
      const response = await saveTestResultsAxiosInstance.post(
        '/v1/auth/test-history/query',
        query
      );
      return response.data;
    } catch (error) {
      console.error('查询测试历史记录失败:', error);
      throw error;
    }
  },

  // 保存测试结果
  saveTestResults: async (results: TestResult[]): Promise<void> => {
    try {
      // 获取认证 token
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('未找到认证 token，请先登录');
      }

      await saveTestResultsAxiosInstance.post(
        '/v1/auth/test-history/save',
        results,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    } catch (error) {
      console.error('保存测试结果失败:', error);
      throw error;
    }
  },

  // 更新测试结果分数
  updateScore: async (
    taskId: string,
    score: number
  ): Promise<TestHistoryItem> => {
    try {
      // 获取认证 token
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('未找到认证 token，请先登录');
      }

      const response = await saveTestResultsAxiosInstance.post(
        '/v1/auth/test-history/update-score',
        { taskId, score },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data.data;
    } catch (error) {
      console.error('更新分数失败:', error);
      throw error;
    }
  },

  // 批量删除测试结果
  deleteTestResults: async (
    taskIds: string[]
  ): Promise<{ deletedCount: number; taskIds: string[] }> => {
    try {
      // 获取认证 token
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('未找到认证 token，请先登录');
      }

      const response = await saveTestResultsAxiosInstance.post(
        '/v1/auth/test-history/delete-task',
        { taskIds },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data.data;
    } catch (error) {
      console.error('删除测试结果失败:', error);
      throw error;
    }
  },

  // 根据 taskId 获取单个测试结果
  getTestResultByTaskId: async (taskId: string): Promise<TestHistoryItem> => {
    try {
      // 获取认证 token
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('未找到认证 token，请先登录');
      }

      const response = await saveTestResultsAxiosInstance.post(
        '/v1/auth/test-history/get-task',
        { taskId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data.data;
    } catch (error) {
      console.error('获取测试结果失败:', error);
      throw error;
    }
  },

  // 按时间范围获取测试结果
  getTestResultsByTimeRange: async (
    startTime: string,
    endTime: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{
    data: TestHistoryItem[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
    timeRange: { startTime: Date; endTime: Date };
  }> => {
    try {
      const response = await saveTestResultsAxiosInstance.post(
        '/v1/auth/test-history/get-by-time-range',
        {
          startTime,
          endTime,
          page,
          limit,
        }
      );

      return {
        data: response.data.data || [],
        pagination: response.data.pagination || {
          total: 0,
          page: 1,
          limit: 10,
          totalPages: 0,
        },
        timeRange: response.data.timeRange || {
          startTime: new Date(),
          endTime: new Date(),
        },
      };
    } catch (error) {
      console.error('按时间范围获取测试结果失败:', error);
      throw error;
    }
  },

  // 添加收藏
  addToFavorites: async (product_url: string): Promise<void> => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('未找到认证 token，请先登录');
      }

      await axios.post(
        'https://tryon-history.faishion.ai/history/favorite',
        { product_url },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );
    } catch (error) {
      console.error('添加收藏失败:', error);
      throw error;
    }
  },

  // 获取所有收藏
  getFavorites: async (): Promise<string[]> => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('未找到认证 token，请先登录');
      }

      const response = await axios.get(
        'https://tryon-history.faishion.ai/history/favorites',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      return response.data.data || [];
    } catch (error) {
      console.error('获取收藏失败:', error);
      throw error;
    }
  },

  // 取消收藏 (使用POST方法，后端根据isFavorite自动判断)
  removeFromFavorites: async (product_url: string): Promise<void> => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('未找到认证 token，请先登录');
      }

      await axios.post(
        'https://tryon-history.faishion.ai/history/favorite',
        { product_url },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );
    } catch (error) {
      console.error('取消收藏失败:', error);
      throw error;
    }
  },

  // 获取推荐deals
  getDealsRecommend: async (params: DealsRecommendParams): Promise<DealsResponse> => {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.price_min !== undefined) queryParams.append('price_min', params.price_min.toString());
      if (params.price_max !== undefined) queryParams.append('price_max', params.price_max.toString());
      if (params.size) queryParams.append('size', params.size);
      if (params.keyword) queryParams.append('keyword', params.keyword);
      if (params.page_size !== undefined) queryParams.append('page_size', params.page_size.toString());
      if (params.affiliate) queryParams.append('affiliate', params.affiliate);

      const response = await axios.get(
        `https://deals-canary.faishion.ai/affiliate/recommend?${queryParams.toString()}`
      );

      return {
        success: true,
        data: response.data.items || [],
        total: response.data.meta?.limit || 0,
        page: 1,
        page_size: response.data.meta?.limit || 10
      };
    } catch (error) {
      console.error('获取deals推荐失败:', error);
      return {
        success: false,
        data: [],
        total: 0
      };
    }
  },
};
