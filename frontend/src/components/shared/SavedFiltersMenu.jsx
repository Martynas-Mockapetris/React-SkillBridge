import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaBookmark, FaSave, FaTimes, FaEdit2, FaTrash, FaClock, FaFire } from 'react-icons/fa'
import { useSavedFilterPresets } from '../../hooks/useSavedFilterPresets'

export const SavedFiltersMenu = ({ currentFilters, onLoadPreset, onSavePreset }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [view, setView] = useState('list') // 'list', 'recent', 'popular', 'save'
  const [presetName, setPresetName] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editingName, setEditingName] = useState('')
  const { presets, createPreset, deletePreset, loadPreset, renamePreset, getRecentPresets, getMostUsedPresets } = useSavedFilterPresets()

  const handleSavePreset = () => {
    if (!presetName.trim()) return
    if (createPreset(presetName, currentFilters)) {
      setPresetName('')
      setView('list')
      onSavePreset?.()
    }
  }

  const handleLoadPreset = (presetId) => {
    const filters = loadPreset(presetId)
    if (filters) {
      onLoadPreset?.(filters)
      setIsOpen(false)
    }
  }

  const handleRename = (presetId, newName) => {
    if (renamePreset(presetId, newName)) {
      setEditingId(null)
      setEditingName('')
    }
  }

  const recentPresets = getRecentPresets(5)
  const popularPresets = getMostUsedPresets(5)

  return (
    <div className='relative'>
      {/* Toggle button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className='p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors flex items-center gap-2'
        title='Manage saved filter presets'>
        <FaBookmark />
        <span className='hidden sm:inline text-sm font-medium'>Presets</span>
        {presets.length > 0 && <span className='ml-1 px-2 py-0.5 bg-blue-500 text-white text-xs rounded-full'>{presets.length}</span>}
      </motion.button>

      {/* Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            className='absolute top-12 right-0 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50'>
            {/* Menu header */}
            <div className='flex items-center justify-between p-4 border-b border-gray-200'>
              <h3 className='font-semibold text-gray-900'>Saved Filters</h3>
              <button onClick={() => setIsOpen(false)} className='p-1 hover:bg-gray-100 rounded-lg transition-colors'>
                <FaTimes size={16} className='text-gray-600' />
              </button>
            </div>

            {/* View tabs */}
            <div className='flex gap-2 p-3 border-b border-gray-200 bg-gray-50'>
              <button onClick={() => setView('list')} className={`flex-1 px-3 py-1.5 rounded text-sm font-medium transition-colors ${view === 'list' ? 'bg-blue-500 text-white' : 'hover:bg-gray-200'}`}>
                All ({presets.length})
              </button>
              <button
                onClick={() => setView('recent')}
                className={`flex-1 px-3 py-1.5 rounded text-sm font-medium transition-colors flex items-center justify-center gap-1 ${view === 'recent' ? 'bg-blue-500 text-white' : 'hover:bg-gray-200'}`}>
                <FaClock size={12} /> Recent
              </button>
              <button
                onClick={() => setView('popular')}
                className={`flex-1 px-3 py-1.5 rounded text-sm font-medium transition-colors flex items-center justify-center gap-1 ${view === 'popular' ? 'bg-blue-500 text-white' : 'hover:bg-gray-200'}`}>
                <FaFire size={12} /> Popular
              </button>
            </div>

            {/* Content */}
            <div className='p-4 max-h-96 overflow-y-auto'>
              {view === 'save' ? (
                <div className='space-y-3'>
                  <input
                    type='text'
                    placeholder='Enter preset name'
                    value={presetName}
                    onChange={(e) => setPresetName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSavePreset()}
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm'
                    autoFocus
                  />
                  <div className='flex gap-2'>
                    <button
                      onClick={handleSavePreset}
                      disabled={!presetName.trim()}
                      className='flex-1 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors flex items-center justify-center gap-2 text-sm font-medium'>
                      <FaSave size={14} />
                      Save Preset
                    </button>
                    <button
                      onClick={() => {
                        setView('list')
                        setPresetName('')
                      }}
                      className='flex-1 px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium'>
                      Cancel
                    </button>
                  </div>
                </div>
              ) : view === 'recent' ? (
                <div className='space-y-2'>
                  {recentPresets.length === 0 ? (
                    <p className='text-sm text-gray-500 text-center py-4'>No recent presets</p>
                  ) : (
                    recentPresets.map((preset) => (
                      <PresetItem
                        key={preset.id}
                        preset={preset}
                        isEditing={editingId === preset.id}
                        editingName={editingName}
                        onEdit={() => {
                          setEditingId(preset.id)
                          setEditingName(preset.name)
                        }}
                        onSave={() => handleRename(preset.id, editingName)}
                        onCancel={() => setEditingId(null)}
                        onLoad={() => handleLoadPreset(preset.id)}
                        onDelete={() => deletePreset(preset.id)}
                        onEditNameChange={setEditingName}
                      />
                    ))
                  )}
                </div>
              ) : view === 'popular' ? (
                <div className='space-y-2'>
                  {popularPresets.length === 0 ? (
                    <p className='text-sm text-gray-500 text-center py-4'>No popular presets</p>
                  ) : (
                    popularPresets.map((preset) => (
                      <PresetItem
                        key={preset.id}
                        preset={preset}
                        isEditing={editingId === preset.id}
                        editingName={editingName}
                        onEdit={() => {
                          setEditingId(preset.id)
                          setEditingName(preset.name)
                        }}
                        onSave={() => handleRename(preset.id, editingName)}
                        onCancel={() => setEditingId(null)}
                        onLoad={() => handleLoadPreset(preset.id)}
                        onDelete={() => deletePreset(preset.id)}
                        onEditNameChange={setEditingName}
                      />
                    ))
                  )}
                </div>
              ) : (
                <div className='space-y-2'>
                  {presets.length === 0 ? (
                    <p className='text-sm text-gray-500 text-center py-4'>No saved presets yet</p>
                  ) : (
                    presets.map((preset) => (
                      <PresetItem
                        key={preset.id}
                        preset={preset}
                        isEditing={editingId === preset.id}
                        editingName={editingName}
                        onEdit={() => {
                          setEditingId(preset.id)
                          setEditingName(preset.name)
                        }}
                        onSave={() => handleRename(preset.id, editingName)}
                        onCancel={() => setEditingId(null)}
                        onLoad={() => handleLoadPreset(preset.id)}
                        onDelete={() => deletePreset(preset.id)}
                        onEditNameChange={setEditingName}
                      />
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Footer action */}
            {view !== 'save' && (
              <button onClick={() => setView('save')} className='w-full p-3 border-t border-gray-200 text-blue-600 hover:bg-blue-50 transition-colors flex items-center justify-center gap-2 text-sm font-medium'>
                <FaSave size={14} />
                Save Current Filters
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Preset item component
const PresetItem = ({ preset, isEditing, editingName, onEdit, onSave, onCancel, onLoad, onDelete, onEditNameChange }) => {
  if (isEditing) {
    return (
      <div className='flex gap-2 p-2 bg-gray-50 rounded-lg'>
        <input
          type='text'
          value={editingName}
          onChange={(e) => onEditNameChange(e.target.value)}
          className='flex-1 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500'
          autoFocus
        />
        <button onClick={onSave} className='px-2 py-1 bg-blue-500 text-white rounded text-xs font-medium hover:bg-blue-600'>
          Save
        </button>
        <button onClick={onCancel} className='px-2 py-1 bg-gray-300 text-gray-700 rounded text-xs font-medium hover:bg-gray-400'>
          Cancel
        </button>
      </div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className='p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group'>
      <div className='flex items-center justify-between gap-2 mb-2'>
        <button onClick={onLoad} className='flex-1 text-left font-medium text-gray-900 hover:text-blue-600 transition-colors truncate'>
          {preset.name}
        </button>
        <button onClick={onEdit} className='p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors' title='Rename'>
          <FaEdit2 size={12} />
        </button>
        <button onClick={onDelete} className='p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors' title='Delete'>
          <FaTrash size={12} />
        </button>
      </div>
      <div className='flex items-center justify-between text-xs text-gray-500'>
        <span>Used {preset.usageCount || 0} times</span>
        <button onClick={onLoad} className='px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors font-medium'>
          Load
        </button>
      </div>
    </motion.div>
  )
}
