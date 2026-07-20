/**
 * Accessibility utilities for filter components
 * Provides ARIA labels, keyboard navigation helpers, and focus management
 */

export const a11yLabels = {
  // Filter panel
  filterPanel: 'Filter projects by budget, status, skills, and priority',
  filterToggle: 'Toggle filter panel visibility on mobile devices',
  clearAllFilters: 'Clear all applied filters and reset to default',

  // Budget filter
  minBudgetInput: 'Minimum budget in dollars',
  maxBudgetInput: 'Maximum budget in dollars',
  budgetRangeSlider: 'Select budget range using slider',

  // Status filter
  statusCheckbox: (status) => `Filter projects by ${status} status`,
  statusGroup: 'Filter projects by completion status',

  // Skills filter
  skillsCheckbox: (skill) => `Filter projects requiring ${skill} skill`,
  skillsGroup: 'Filter projects by required skills',
  skillMatchType: 'Choose to match any or all selected skills',

  // Priority filter
  priorityCheckbox: (priority) => `Filter projects by ${priority} priority level`,
  priorityGroup: 'Filter projects by priority level',

  // Sort filter
  sortRadio: (sortType) => `Sort results by ${sortType}`,
  sortGroup: 'Sort results by date, budget, or relevance',

  // Results
  resultsList: 'List of filtered projects',
  projectCard: (projectTitle) => `Project: ${projectTitle}`,
  exportButton: 'Export current filtered results to CSV, JSON, or Markdown',
  noResults: 'No projects match your selected filters. Try adjusting your criteria.',

  // Sidebar
  sidebar: 'Filter sidebar - use to refine project search results',
  sidebarClose: 'Close filter sidebar',

  // Empty state
  emptyState: 'No filters applied. Select filters to discover projects matching your criteria.'
}

export const useKeyboardNavigation = (isOpen, onClose) => {
  return {
    onKeyDown: (e) => {
      // ESC key to close filters
      if (e.key === 'Escape' && isOpen) {
        onClose?.()
        e.preventDefault()
      }
    }
  }
}

export const focusManagement = {
  // Trap focus within modal
  createFocusTrap: (container) => {
    const focusableElements = container.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
    return {
      firstElement: focusableElements[0],
      lastElement: focusableElements[focusableElements.length - 1],
      elements: focusableElements
    }
  },

  // Handle tab key within modal
  handleTabKey: (e, focusTrap) => {
    if (e.key !== 'Tab') return

    if (e.shiftKey) {
      // Shift + Tab - move backwards
      if (document.activeElement === focusTrap.firstElement) {
        focusTrap.lastElement?.focus()
        e.preventDefault()
      }
    } else {
      // Tab - move forwards
      if (document.activeElement === focusTrap.lastElement) {
        focusTrap.firstElement?.focus()
        e.preventDefault()
      }
    }
  },

  // Restore focus when modal closes
  returnFocus: (previouslyFocusedElement) => {
    if (previouslyFocusedElement && typeof previouslyFocusedElement.focus === 'function') {
      previouslyFocusedElement.focus()
    }
  }
}

export const ariaLiveRegions = {
  // Announce filter changes to screen readers
  announceFilterChange: (filterName, value) => {
    return `${filterName} filter updated to ${value}`
  },

  // Announce result count
  announceResultCount: (count) => {
    return `Found ${count} project${count !== 1 ? 's' : ''} matching your filters`
  },

  // Announce export completion
  announceExport: (format, count) => {
    return `Exported ${count} project${count !== 1 ? 's' : ''} to ${format} format`
  },

  // Announce loading state
  announceLoading: () => {
    return 'Loading filtered results, please wait'
  }
}

export const useAriaLive = (message) => {
  return {
    role: 'status',
    'aria-live': 'polite',
    'aria-atomic': 'true',
    children: message
  }
}

export const getAriaDescription = (componentType) => {
  const descriptions = {
    filterPanel: 'This panel contains filter options to refine your project search. Use status, budget, skills, and priority filters to narrow down results.',
    sidebarToggle: 'On mobile devices, use this button to show or hide the filter sidebar',
    sortOptions: 'Choose how to sort the displayed results',
    exportOptions: 'Download the filtered results in your preferred format'
  }
  return descriptions[componentType] || ''
}

export const accessibilityAnnouncements = {
  noFiltersApplied: 'No filters currently applied. Use the filter panel to start searching.',
  filtersApplied: (count) => `${count} filter${count !== 1 ? 's' : ''} applied. Results are being updated.`,
  filterRemoved: (filterName) => `${filterName} filter has been removed.`,
  allFiltersCleared: 'All filters have been cleared. View all projects.',
  resultsLoading: 'Loading search results...',
  resultsEmpty: 'No projects found matching your filters.',
  exportStarted: (format) => `Exporting results to ${format} format...`,
  keyboardShortcuts: 'Press Escape to close the filter panel, Tab to navigate between filter options'
}
