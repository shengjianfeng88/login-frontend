// 获取访问token的共享方法
export const getAccessToken = (): string | null => {
  // 判断是否为测试环境
  if (
    typeof window !== 'undefined' &&
    (window.location.host === 'login-frontend-puce.vercel.app' || window.location.host.includes('localhost'))
  ) {
    return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ODM5MzVmZWIzMjliNTI0MTNkOGQ2YTUiLCJwaWN0dXJlIjoiaHR0cHM6Ly9saDMuZ29vZ2xldXNlcmNvbnRlbnQuY29tL2EvQUNnOG9jSVN5dHEtQnNWcTItRTNXNGFoTG9CZTdYRVdZb0h1RmhoU3V4VjRLTy02cEdUTHlBPXM5Ni1jIiwiZW1haWwiOiJqaWFuZmVuZ3NoZW5nMEBnbWFpbC5jb20iLCJpYXQiOjE3NTY1NDgwMTAsImV4cCI6MTc1NjU0ODkxMH0.z4sDXh8_GF0ET2MYiKmW0QuKBZ_Qd0Q7qUYke1p4MaA';
  }
  return localStorage.getItem('accessToken');
};