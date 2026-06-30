import { motion } from 'framer-motion'
import { FaCheckDouble, FaSpinner } from 'react-icons/fa'
import { useState } from 'react'
import { toast } from 'react-toastify'

const BulkCompleteButton = ({ selectedProjectIds = [], onComplete, disabled = false }) => {
  const [isLoading, setIsLoading] = useState(false)

  const handleBulkComplete = async () => {
    if (selectedProjectIds.length === 0) {
      toast.info('No projects selected')
      return
    }

    if (!window.confirm(`Mark ${selectedProjectIds.length} project(s) as complete?`)) {
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/projects/bulk/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectIds: selectedProjectIds })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP ${response.status}`)
      }

      const result = await response.json()

      toast.success(`✓ Completed ${result.data.completed} project(s)`)

      if (result.data.failed > 0) {
        toast.warning(`⚠ Failed to complete ${result.data.failed} project(s)`)
      }

      if (onComplete) {
        onComplete(result.data.projects)
      }
    } catch (err) {
      toast.error(`Error completing projects: ${err.message}`)
      console.error('Error bulk completing:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <motion.button
      onClick={handleBulkComplete}
      disabled={disabled || isLoading || selectedProjectIds.length === 0}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className='flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200'>
      {isLoading ? (
        <>
          <FaSpinner className='animate-spin' />
          <span>Completing...</span>
        </>
      ) : (
        <>
          <FaCheckDouble />
          <span>Complete ({selectedProjectIds.length})</span>
        </>
      )}
    </motion.button>
  )
}

export default BulkCompleteButton
