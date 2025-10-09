// 获取访问token的共享方法
export const getAccessToken = (): string | null => {
  // 判断是否为测试环境
  if (
    typeof window !== 'undefined' &&
    (window.location.host === 'login-frontend-puce.vercel.app' || window.location.host.includes('localhost'))
  ) {
    return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OGQ4OTU4MGZkMWY5YzNlMTE3MzExYTUiLCJwaWN0dXJlIjoiaHR0cHM6Ly9saDMuZ29vZ2xldXNlcmNvbnRlbnQuY29tL2EvQUNnOG9jSXoxY3V3RVAwWFowTEVRa2gzVlVreUlBWXhMMjN1eVNpaEl6NjhqVDgtLWRfTEN0ZlNCZz1zOTYtYyIsImVtYWlsIjoicGFuZ21pbmdrYWlAZ21haWwuY29tIiwiaWF0IjoxNzYwMDQ5OTkzLCJleHAiOjE3NjAwNTA4OTN9.Zmimki_bKwVppt6Gh2FY_viBAw0f_dA292RHJglg1eo';
  }
  return localStorage.getItem('accessToken');
};

// 获取刷新token的共享方法
export const getRefreshToken = (): string | null => {
  return localStorage.getItem('refreshToken');
};

// 检查token是否过期
export const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = JSON.parse(atob(token.split('.')[1]));
    return Date.now() >= decoded.exp * 1000;
  } catch {
    return true;
  }
};

// 清除所有认证信息
export const clearAuthTokens = (): void => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('userId');
};