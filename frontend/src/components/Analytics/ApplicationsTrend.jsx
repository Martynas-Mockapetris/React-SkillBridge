import React from 'react'
import { motion } from 'framer-motion'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const ApplicationsTrend = ({ data }) => {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className='bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700'>
      <h2 className='text-xl font-bold mb-4 theme-text'>Applications Trend (30 Days)</h2>
      <ResponsiveContainer width='100%' height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray='3 3' stroke='rgba(0,0,0,0.1)' />
          <XAxis dataKey='date' stroke='rgba(0,0,0,0.5)' />
          <YAxis stroke='rgba(0,0,0,0.5)' />
          <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', color: '#000' }} labelStyle={{ color: '#000' }} />
          <Line type='monotone' dataKey='applications' stroke='#00ADB5' strokeWidth={2} dot={{ fill: '#00ADB5', r: 5 }} />
        </LineChart>
      </ResponsiveContainer>
    </motion.div>
  )
}

export default ApplicationsTrend
