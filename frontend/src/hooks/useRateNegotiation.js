import { useState } from 'react'
import { proposeRate, counterRate, acceptRate } from '../services/projectService'

export const useRateNegotiation = (projectId, loadProject) => {
  const [rateAmount, setRateAmount] = useState('')
  const [rateType, setRateType] = useState('hourly')
  const [rateLoading, setRateLoading] = useState(false)
  const [rateError, setRateError] = useState('')

  const handleProposeRate = async () => {
    if (!rateAmount || Number(rateAmount) <= 0) {
      setRateError('Enter a valid amount')
      return
    }

    try {
      setRateLoading(true)
      setRateError('')
      await proposeRate(projectId, { amount: Number(rateAmount), type: rateType })
      await loadProject()
      setRateAmount('')
    } catch (error) {
      setRateError(error.response?.data?.message || 'Failed to propose rate')
    } finally {
      setRateLoading(false)
    }
  }

  const handleCounterRate = async () => {
    if (!rateAmount || Number(rateAmount) <= 0) {
      setRateError('Enter a valid amount')
      return
    }

    try {
      setRateLoading(true)
      setRateError('')
      await counterRate(projectId, { amount: Number(rateAmount), type: rateType })
      await loadProject()
      setRateAmount('')
    } catch (error) {
      setRateError(error.response?.data?.message || 'Failed to counter rate')
    } finally {
      setRateLoading(false)
    }
  }

  const handleAcceptRate = async () => {
    try {
      setRateLoading(true)
      setRateError('')
      const result = await acceptRate(projectId)
      console.log('Accept rate response:', result)
      console.log('Budget in response:', result.budget)
      await loadProject()
    } catch (error) {
      setRateError(error.response?.data?.message || 'Failed to accept rate')
    } finally {
      setRateLoading(false)
    }
  }

  return {
    // State
    rateAmount,
    setRateAmount,
    rateType,
    setRateType,
    rateLoading,
    rateError,
    setRateError,
    // Handlers
    handleProposeRate,
    handleCounterRate,
    handleAcceptRate
  }
}
