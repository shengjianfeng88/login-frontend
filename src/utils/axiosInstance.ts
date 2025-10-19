import axios from "axios";
import { getAccessToken, getRefreshToken, isTokenExpired } from "./auth";
import { store } from "@/store/store";
import { setUser } from "@/store/features/userSlice";

// 开发环境强制使用相对路径走 Vite 代理，避免 CORS
// 生产环境使用环境变量或默认值
const apiUrl = import.meta.env.DEV
  ? "/v1"
  : import.meta.env.VITE_API_URL || "https://api-auth.faishion.ai/v1";

const axiosInstance = axios.create({
  baseURL: apiUrl,
  withCredentials: true, // 必须有，带上 cookie
});

// 标记是否正在刷新token，防止重复刷新
let isRefreshing = false;
// 存储待重试的请求
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

// 处理队列中的请求
const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token!);
    }
  });
  failedQueue = [];
};

// 请求拦截器 - 自动添加token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token && !isTokenExpired(token)) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器 - 处理token过期
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // 如果是401错误且不是刷新token的请求
    if (error.response?.status === 401 && !originalRequest._retry) {
      // 如果正在刷新token，将请求加入队列
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosInstance(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = getRefreshToken();

      if (refreshToken) {
        try {
          // 调用刷新token的API，使用指定的staging端点
          const refreshEndpoint = "https://staging-api-auth.faishion.ai/v1/auth/refresh-token-checkout";
          const response = await axios.post(
            refreshEndpoint,
            {
              refreshToken,
            }
          );

          const {
            success,
            accessToken,
            refreshToken: newRefreshToken,
            userId,
            email,
          } = response.data;

          if (!success) {
            throw new Error("Refresh token failed");
          }

          // 保存新的tokens和用户信息
          localStorage.setItem("accessToken", accessToken);
          if (newRefreshToken) {
            localStorage.setItem("refreshToken", newRefreshToken);
          }
          if (userId) {
            localStorage.setItem("userId", userId);
          }
          if (email) {
            localStorage.setItem("email", email);
          }

          // 更新 Redux store 中的用户信息
          try {
            // 从token中解析用户信息
            const decoded = JSON.parse(atob(accessToken.split(".")[1]));
            const userEmail = email || decoded.email || "";
            const userPicture = decoded.picture || "";
            
            // 只有当头像信息存在时才更新
            if (userPicture) {
              store.dispatch(
                setUser({
                  email: userEmail,
                  picture: userPicture,
                })
              );
              console.log("Updated user info in Redux store:", { email: userEmail, hasPicture: !!userPicture });
            } else {
              // 只更新email，保持原有头像
              const currentState = store.getState().user;
              store.dispatch(
                setUser({
                  email: userEmail,
                  picture: currentState.picture,
                })
              );
              console.log("Updated email only, keeping existing picture");
            }
          } catch (error) {
            console.error(
              "Failed to decode and update user info in Redux store:",
              error
            );
          }

          // 处理队列中的请求
          processQueue(null, accessToken);

          // 重新发送原始请求
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return axiosInstance(originalRequest);
        } catch (refreshError: unknown) {
          // 刷新失败，检查是否是API返回的错误消息
          let errorMessage = "Token refresh failed";

          const axiosError = refreshError as {
            response?: { data?: { message?: string } };
          };
          if (axiosError.response?.data?.message) {
            errorMessage = axiosError.response.data.message;
          }

          console.error("Token refresh failed:", errorMessage);

          // 刷新失败，清除tokens并重定向到登录页
          processQueue(refreshError, null);

          // // 清除认证信息
          // localStorage.removeItem('accessToken');
          // localStorage.removeItem('refreshToken');
          // localStorage.removeItem('userId');

          // 如果在浏览器环境中，重定向到登录页
          if (typeof window !== "undefined") {
            window.location.href = "/signin";
          }

          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      } else {
        // 没有refresh token，清除认证信息并重定向
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("userId");
        if (typeof window !== "undefined") {
          window.location.href = "/signin";
        }
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
