// 基础配置
export const config = {
  // API 基础地址
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  // 请求超时时间（毫秒）
  timeout: 10000,
  // 是否使用 Mock
  useMock: import.meta.env.VITE_USE_MOCK === 'true',
}
