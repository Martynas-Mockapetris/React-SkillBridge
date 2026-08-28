import React from 'react'
import { motion } from 'framer-motion'
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts'

const ApplicationStatus = ({ data }) => {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className='bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700'>
      <h2 className='text-xl font-bold mb-4 theme-text'>Application Status Breakdown</h2>
      <ResponsiveContainer width='100%' height={300}>
        <PieChart>
          <Pie data={data} cx='50%' cy='50%' labelLine={false} label={({ name, value }) => `${name}: ${value}`} outerRadius={80} fill='#8884d8' dataKey='value'>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', color: '#000' }} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </motion.div>
  )
}

export default ApplicationStatus
