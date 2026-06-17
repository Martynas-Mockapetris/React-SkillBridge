import authAxios from './axiosConfig'

export const getFreelancerAnalytics = async () => {
  try {
    const response = await authAxios.get('/api/analytics/freelancer')
    return response.data.data
  } catch (error) {
    console.error('Error fetching analytics:', error)
    throw error
  }
}

export const recordProfileView = async (userId) => {
  try {
    await authAxios.post(`/api/analytics/profile-view/${userId}`)
  } catch (error) {
    console.error('Error recording profile view:', error)
  }
}
