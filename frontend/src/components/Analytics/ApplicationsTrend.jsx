import React from 'react'
import { motion } from 'framer-motion'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const ApplicationsTrend = ({ data }) => {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className='bg-white/5 backdrop-blur-md rounded-xl p-6 border border-white/10'>
      <h2 className='text-xl font-bold mb-4'>Applications Trend (30 Days)</h2>
      <ResponsiveContainer width='100%' height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray='3 3' stroke='rgba(255,255,255,0.1)' />
          <XAxis dataKey='date' stroke='rgba(255,255,255,0.5)' />
          <YAxis stroke='rgba(255,255,255,0.5)' />
          <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid rgba(255,255,255,0.2)' }} labelStyle={{ color: '#fff' }} />
          <Line type='monotone' dataKey='applications' stroke='#3b82f6' strokeWidth={2} dot={{ fill: '#3b82f6', r: 5 }} />
        </LineChart>
      </ResponsiveContainer>
    </motion.div>
  )
}

export default ApplicationsTrend
