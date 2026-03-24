import { authAxios } from '../utils/axiosConfig'

// Get full system config (admin)
export const getSystemConfig = async () => {
  try {
    const response = await authAxios.get('/api/config')
    return response.data
  } catch (error) {
    console.error('Failed to fetch system config:', error.response?.data || error.message)
    throw error
  }
}

// Update one config section (admin)
export const updateSystemConfigSection = async (section, payload) => {
  try {
    const response = await authAxios.put(`/api/config/${section}`, payload)
    return response.data
  } catch (error) {
    console.error('Failed to update config section:', error.response?.data || error.message)
    throw error
  }
}
