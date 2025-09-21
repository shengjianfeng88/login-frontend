// API配置管理
export const isDevelopment = import.meta.env.DEV;
export const isProduction = import.meta.env.PROD;

// API域名配置
export const API_DOMAINS = {
  // 主要认证API
  AUTH_API: isDevelopment 
    ? '/v1'  // 开发环境使用proxy 
    : 'https://api-auth.faishion.ai/v1',  // 生产环境使用实际域名
  
  // 试穿服务API (第三方服务，不通过proxy)
  TRYON_API: 'https://tryon-advanced-canary.faishion.ai',
  
  // 上传服务API
  UPLOAD_API: isDevelopment 
    ? '/v1'  // 开发环境使用proxy
    : 'https://staging-api-auth.faishion.ai',  // 生产环境使用实际域名
  
  // 聊天机器人API
  CHATBOT_API: isDevelopment 
    ? ''  // 开发环境使用vite proxy (已配置 /chat 和 /health)
    : 'https://chatbot.faishion.ai',  // 生产环境使用实际域名
  
  // 历史记录API
  HISTORY_API: isDevelopment 
    ? ''  // 开发环境使用vite proxy (已配置 /history)
    : 'https://tryon-history.faishion.ai',  // 生产环境使用实际域名

  // 收藏功能API
  FAVORITE_API: isDevelopment 
    ? ''  // 开发环境使用vite proxy (已配置 /favorite)
    : 'https://tryon-history.faishion.ai',  // 生产环境使用实际域名

  // 订阅服务API
  SUBSCRIPTION_API: 'https://subscriptions.faishion.ai',

  // 主要网站域名
  MAIN_WEBSITE: 'https://www.faishion.ai',
  FAISHION_MAIN: 'https://faishion.ai',
};

// 获取完整的API URL
export const getApiUrl = (service: keyof typeof API_DOMAINS, path: string = '') => {
  const baseUrl = API_DOMAINS[service];
  return `${baseUrl}${path}`;
};

// 环境信息
export const ENV_CONFIG = {
  isDevelopment,
  isProduction,
  mode: import.meta.env.MODE,
};