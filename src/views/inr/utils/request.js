import axios from 'axios'
// import { useUserStoreHook } from "@/stores/modules/user";
// import router from '@/router'

// let url = 'https://api.c2c.thai2570.com';   // 本地开发
// if(location.href.indexOf('localhost') > -1 || location.href.indexOf('192.168') > -1) {
//   url = 'http://192.168.2.124:9555'
// } else{
//   url = '"https://api.c2c.thai2570.com'
// }
// 创建 axios 实例
const service = axios.create({
  // baseURL: url,
  baseURL: import.meta.env.VITE_API_URL,
  // withCredentials: true,
  // withXSRFToken: true,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json;charset=utf-8',
    'X-Requested-With': 'XMLHttpRequest',
  },
})

// 请求拦截器
service.interceptors.request.use(
  (config) => {
    // if (localStorage.TOKEN_KEY) {
    //   config.headers.Authorization = `''Bearer ${localStorage.TOKEN_KEY}`
    // }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)
// 响应拦截器
service.interceptors.response.use(
  (response) => {
    // 检查配置的响应类型是否为二进制类型（'blob' 或 'arraybuffer'）, 如果是，直接返回响应对象
    if (response.config.responseType === 'blob' || response.config.responseType === 'arraybuffer') {
      return response
    }
    // const req =
    return response.data
  },
  (error) => {
    const data = error?.response

    if (!data) {
      return Promise.reject({
        message: error?.message || 'Network Error',
      })
    }

    return Promise.reject(data.data || { message: 'Request Error' })
  },
)

// 导出 axios 实例
export default service
