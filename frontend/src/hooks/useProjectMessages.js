import { useState, useEffect } from 'react'
import { getProjectMessages } from '../services/messageService'

export const useProjectMessages = (project, currentUser) => {
  const [messages, setMessages] = useState([])
  const [messagesLoading, setMessagesLoading] = useState(false)

  useEffect(() => {
    const fetchMessages = async () => {
      if (project && currentUser && project.user?._id === currentUser._id) {
        try {
          setMessagesLoading(true)
          const data = await getProjectMessages(project._id)
          setMessages(data)
        } catch (error) {
          console.error('Error fetching messages:', error)
        } finally {
          setMessagesLoading(false)
        }
      }
    }

    fetchMessages()
  }, [project, currentUser])

  return { messages, messagesLoading }
}
