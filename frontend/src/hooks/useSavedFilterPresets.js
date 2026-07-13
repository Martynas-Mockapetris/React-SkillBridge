import { useState, useCallback, useEffect } from 'react'
import { toast } from 'react-toastify'

const STORAGE_KEY = 'projectFilterPresets'

export const useSavedFilterPresets = () => {
  const [presets, setPresets] = useState([])
  const [loading, setLoading] = useState(true)

  // Load presets from localStorage on mount
  useEffect(() => {
    const savedPresets = localStorage.getItem(STORAGE_KEY)
    if (savedPresets) {
      try {
        const parsed = JSON.parse(savedPresets)
        setPresets(Array.isArray(parsed) ? parsed : [])
      } catch (err) {
        console.error('Failed to parse saved filter presets:', err)
        setPresets([])
      }
    }
    setLoading(false)
  }, [])

  // Save presets to localStorage whenever they change
  useEffect(() => {
    if (!loading) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(presets))
    }
  }, [presets, loading])

  const createPreset = useCallback(
    (name, filters) => {
      // Check for duplicate names
      if (presets.some((p) => p.name.toLowerCase() === name.toLowerCase())) {
        toast.warning('A preset with this name already exists')
        return false
      }

      const newPreset = {
        id: Date.now().toString(),
        name,
        filters: { ...filters },
        createdAt: new Date().toISOString(),
        usageCount: 0
      }

      setPresets((prev) => [...prev, newPreset])
      toast.success(`Filter preset "${name}" saved`)
      return true
    },
    [presets]
  )

  const updatePreset = useCallback((presetId, updates) => {
    setPresets((prev) =>
      prev.map((p) =>
        p.id === presetId
          ? {
              ...p,
              ...updates,
              updatedAt: new Date().toISOString()
            }
          : p
      )
    )
  }, [])

  const deletePreset = useCallback(
    (presetId) => {
      const preset = presets.find((p) => p.id === presetId)
      setPresets((prev) => prev.filter((p) => p.id !== presetId))
      toast.success(`Filter preset "${preset?.name}" deleted`)
    },
    [presets]
  )

  const loadPreset = useCallback(
    (presetId) => {
      const preset = presets.find((p) => p.id === presetId)
      if (preset) {
        // Increment usage count
        updatePreset(presetId, {
          usageCount: (preset.usageCount || 0) + 1,
          lastUsedAt: new Date().toISOString()
        })
        return preset.filters
      }
      return null
    },
    [presets, updatePreset]
  )

  const renamePreset = useCallback(
    (presetId, newName) => {
      // Check for duplicate names
      if (presets.some((p) => p.id !== presetId && p.name.toLowerCase() === newName.toLowerCase())) {
        toast.warning('A preset with this name already exists')
        return false
      }

      const oldPreset = presets.find((p) => p.id === presetId)
      updatePreset(presetId, { name: newName })
      toast.success(`Filter preset renamed to "${newName}"`)
      return true
    },
    [presets, updatePreset]
  )

  const getRecentPresets = useCallback(
    (limit = 5) => {
      return presets
        .sort((a, b) => {
          const aDate = new Date(a.lastUsedAt || a.createdAt)
          const bDate = new Date(b.lastUsedAt || b.createdAt)
          return bDate - aDate
        })
        .slice(0, limit)
    },
    [presets]
  )

  const getMostUsedPresets = useCallback(
    (limit = 5) => {
      return presets.sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0)).slice(0, limit)
    },
    [presets]
  )

  return {
    presets,
    loading,
    createPreset,
    updatePreset,
    deletePreset,
    loadPreset,
    renamePreset,
    getRecentPresets,
    getMostUsedPresets
  }
}
