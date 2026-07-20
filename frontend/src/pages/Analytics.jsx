import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FaChartLine, FaUsers, FaEye, FaCheckCircle, FaClipboardList, FaShieldAlt } from 'react-icons/fa'
import { getFreelancerAnalytics } from '../services/analyticsService'
import LoadingSpinner from '../components/shared/LoadingSpinner'
import PageBackground from '../components/shared/PageBackground'
import AnalyticsOverview from '../components/Analytics/AnalyticsOverview'
import ApplicationsTrend from '../components/Analytics/ApplicationsTrend'
import ApplicationStatus from '../components/Analytics/ApplicationStatus'
import VerificationMetrics from '../components/Analytics/VerificationMetrics'

const Analytics = () => {
  const [analyticsData, setAnalyticsData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const data = await getFreelancerAnalytics()
        setAnalyticsData(data)
      } catch (err) {
        setError('Failed to load analytics')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [])

  if (loading) return <LoadingSpinner />
  if (error) return <div className='text-center text-red-500 p-8'>{error}</div>
  if (!analyticsData) return <div className='text-center p-8'>No data available</div>

  return (
    <PageBackground>
      <div className='min-h-screen py-12 px-4 sm:px-6'>
        <div className='max-w-7xl mx-auto'>
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className='mb-12'>
            <h1 className='text-4xl font-bold mb-2'>Analytics Dashboard</h1>
            <p className='text-gray-400'>Track your applications, profile performance, and conversion metrics</p>
          </motion.div>

          {/* Overview Stats */}
          <AnalyticsOverview stats={analyticsData.stats} />

          {/* Charts Row */}
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8'>
            <ApplicationsTrend data={analyticsData.trendData} />
            <ApplicationStatus data={analyticsData.statusBreakdown} />
          </div>

          {/* Verification Metrics */}
          <VerificationMetrics stats={analyticsData.stats} />

          {/* Recent Applications */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className='mt-8 bg-white/5 backdrop-blur-md rounded-xl p-6 border border-white/10'>
            <h2 className='text-xl font-bold mb-4'>Recent Applications</h2>
            {analyticsData.recentApplications.length > 0 ? (
              <div className='space-y-3'>
                {analyticsData.recentApplications.map((app, idx) => (
                  <div key={idx} className='flex items-center justify-between p-3 bg-white/5 rounded border border-white/5'>
                    <div>
                      <p className='font-semibold'>{app.projectTitle}</p>
                      <p className='text-sm text-gray-400'>{new Date(app.applicationDate).toLocaleDateString()}</p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded text-sm font-semibold ${
                        app.status === 'accepted' ? 'bg-green-500/20 text-green-400' : app.status === 'rejected' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'
                      }`}>
                      {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className='text-gray-400'>No applications yet</p>
            )}
          </motion.div>
        </div>
      </div>
    </PageBackground>
  )
}

export default Analytics
