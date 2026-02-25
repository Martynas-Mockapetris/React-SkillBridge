import { useState, useEffect } from 'react'
import { getFavoriteProjects, addToFavorites, removeFromFavorites } from '../services/userService'

export const useFavorites = (projectId, currentUser) => {
  const [isFavorited, setIsFavorited] = useState(false)
  const [favoriteLoading, setFavoriteLoading] = useState(false)

  useEffect(() => {
    const loadFavorites = async () => {
      if (projectId && currentUser) {
        try {
          const favorites = await getFavoriteProjects()
          const favoriteIds = favorites.map((fav) => fav._id)
          setIsFavorited(favoriteIds.includes(projectId))
        } catch (error) {
          console.error('Error loading favorites:', error)
          setIsFavorited(false)
        }
      }
    }

    loadFavorites()
  }, [projectId, currentUser])

  const handleToggleFavorite = async () => {
    try {
      setFavoriteLoading(true)
      if (isFavorited) {
        await removeFromFavorites(projectId)
      } else {
        await addToFavorites(projectId)
      }
      setIsFavorited(!isFavorited)
    } catch (error) {
      console.error('Error toggling favorite:', error)
    } finally {
      setFavoriteLoading(false)
    }
  }

  return { isFavorited, favoriteLoading, handleToggleFavorite }
}
