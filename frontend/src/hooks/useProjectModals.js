import { useState } from 'react'

// Manages all modal states
export const useProjectModals = () => {
  const [isContactModalOpen, setIsContactModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false)
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false)
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false)

  return {
    isContactModalOpen,
    setIsContactModalOpen,
    isEditModalOpen,
    setIsEditModalOpen,
    isSubmitModalOpen,
    setIsSubmitModalOpen,
    isReviewModalOpen,
    setIsReviewModalOpen,
    isRescheduleModalOpen,
    setIsRescheduleModalOpen
  }
}
