import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaDownload, FaChevronDown, FaFileCSV, FaFileJson, FaFileAlt } from 'react-icons/fa'
import { exportToCSV, exportToJSON, exportToMarkdown, getExportSummary } from '../../utils/exportResults'

const ExportResultsButton = ({ projects, filters, isDarkMode }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [showSummary, setShowSummary] = useState(false)

  if (!projects || projects.length === 0) {
    return null
  }

  const summary = getExportSummary(projects, filters)

  const exportOptions = [
    {
      label: 'CSV',
      icon: FaFileCSV,
      action: () => exportToCSV(projects, filters),
      description: 'Spreadsheet format'
    },
    {
      label: 'JSON',
      icon: FaFileJson,
      action: () => exportToJSON(projects, filters),
      description: 'Data format'
    },
    {
      label: 'Markdown',
      icon: FaFileAlt,
      action: () => exportToMarkdown(projects, filters),
      description: 'Document format'
    }
  ]

  return (
    <div className='relative'>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${isDarkMode ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-emerald-500 hover:bg-emerald-600 text-white'}`}>
        <FaDownload size={16} />
        <span>Export</span>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.3 }}>
          <FaChevronDown size={12} />
        </motion.div>
      </motion.button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -10 }}
            className={`absolute top-full right-0 mt-2 w-64 rounded-lg shadow-xl z-50 border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
            {/* Header */}
            <div className={`p-3 border-b ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}`}>
              <p className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Export Format</p>
            </div>

            {/* Export Options */}
            <div className='p-2'>
              {exportOptions.map((option) => {
                const Icon = option.icon
                return (
                  <motion.button
                    key={option.label}
                    whileHover={{ x: 4 }}
                    onClick={() => {
                      option.action()
                      setIsOpen(false)
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-left transition-colors mb-1 ${
                      isDarkMode ? 'hover:bg-slate-700 text-gray-300 hover:text-white' : 'hover:bg-gray-100 text-slate-700 hover:text-slate-900'
                    }`}>
                    <Icon size={16} className='text-emerald-500' />
                    <div className='flex-1'>
                      <p className='font-medium'>{option.label}</p>
                      <p className='text-xs opacity-70'>{option.description}</p>
                    </div>
                  </motion.button>
                )
              })}
            </div>

            {/* Summary Toggle */}
            <div className={`border-t p-3 ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}`}>
              <motion.button
                whileHover={{ scale: 1.02 }}
                onClick={() => setShowSummary(!showSummary)}
                className={`w-full text-sm font-medium py-2 px-2 rounded transition-colors ${isDarkMode ? 'hover:bg-slate-700 text-gray-400 hover:text-white' : 'hover:bg-gray-100 text-gray-600'}`}>
                {showSummary ? 'Hide' : 'Show'} Export Summary
              </motion.button>
            </div>

            {/* Summary Display */}
            <AnimatePresence>
              {showSummary && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className={`px-3 py-3 border-t text-xs ${isDarkMode ? 'border-slate-700 bg-slate-900' : 'border-gray-200 bg-gray-50'}`}>
                  <div className='space-y-2'>
                    <div className='flex justify-between'>
                      <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Total:</span>
                      <span className='font-bold text-emerald-500'>{summary.totalProjects}</span>
                    </div>
                    <div className='flex justify-between'>
                      <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Avg Budget:</span>
                      <span className='font-bold'>${summary.avgBudget.toLocaleString()}</span>
                    </div>
                    <div className={`mt-2 pt-2 border-t ${isDarkMode ? 'border-slate-700' : 'border-gray-300'}`}>
                      <p className={`font-semibold mb-1 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>By Priority:</p>
                      <div className='space-y-1'>
                        {Object.entries(summary.priorityCounts).map(
                          ([priority, count]) =>
                            count > 0 && (
                              <div key={priority} className='flex justify-between'>
                                <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>{priority}:</span>
                                <span className='font-bold'>{count}</span>
                              </div>
                            )
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default ExportResultsButton
