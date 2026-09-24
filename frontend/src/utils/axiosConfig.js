import axios from 'axios'

// Create authenticated axios instance with auth token
const createAuthAxios = () => {
  const apiBaseUrl = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')
  const instance = axios.create({
    baseURL: apiBaseUrl
  })

  // Add request interceptor to attach token
  instance.interceptors.request.use(
    (config) => {
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      const token = user.token
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    },
    (error) => Promise.reject(error)
  )

  // Add response interceptor for error handling
  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        localStorage.removeItem('user')
        localStorage.removeItem('token')
      }
      return Promise.reject(error)
    }
  )

  return instance
}

const authAxios = createAuthAxios()

export { authAxios }
