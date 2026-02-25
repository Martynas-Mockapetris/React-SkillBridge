import { useState } from 'react'

// Manages all 8 modal states
export const useProjectModals = () => {
  const [isContactModalOpen, setIsContactModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false)
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false)

  return {
    isContactModalOpen,
    setIsContactModalOpen,
    isEditModalOpen,
    setIsEditModalOpen,
    isSubmitModalOpen,
    setIsSubmitModalOpen,
    isReviewModalOpen,
    setIsReviewModalOpen
  }
}
