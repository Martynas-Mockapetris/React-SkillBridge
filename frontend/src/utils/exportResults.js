/**
 * Export utilities for filtered project results
 * Supports CSV, JSON, and PDF formats
 */

export const exportToCSV = (projects, filters = {}) => {
  if (!projects || projects.length === 0) {
    alert('No projects to export')
    return
  }

  const headers = ['Title', 'Budget', 'Status', 'Skills', 'Priority', 'Category']
  const rows = projects.map((p) => [p.title, p.budget || 'N/A', p.status || 'N/A', (p.skills && p.skills.join(', ')) || 'N/A', p.priority || 'N/A', p.category || 'N/A'])

  // Build CSV content
  const csvContent = [headers.join(','), ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))].join('\n')

  // Download CSV
  downloadFile(csvContent, 'projects.csv', 'text/csv')
}

export const exportToJSON = (projects, filters = {}) => {
  if (!projects || projects.length === 0) {
    alert('No projects to export')
    return
  }

  const exportData = {
    exportDate: new Date().toISOString(),
    totalResults: projects.length,
    appliedFilters: filters,
    projects: projects.map((p) => ({
      id: p._id,
      title: p.title,
      description: p.description,
      budget: p.budget,
      status: p.status,
      skills: p.skills || [],
      priority: p.priority,
      category: p.category,
      createdAt: p.createdAt,
      deadline: p.deadline
    }))
  }

  const jsonContent = JSON.stringify(exportData, null, 2)
  downloadFile(jsonContent, 'projects.json', 'application/json')
}

export const exportToMarkdown = (projects, filters = {}) => {
  if (!projects || projects.length === 0) {
    alert('No projects to export')
    return
  }

  let markdown = `# Filtered Projects Export\n\n`
  markdown += `**Export Date:** ${new Date().toLocaleDateString()}\n`
  markdown += `**Total Results:** ${projects.length}\n\n`

  if (Object.keys(filters).length > 0) {
    markdown += `## Applied Filters\n`
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        markdown += `- **${key}:** ${Array.isArray(value) ? value.join(', ') : value}\n`
      }
    })
    markdown += `\n`
  }

  markdown += `## Projects\n\n`
  projects.forEach((p, idx) => {
    markdown += `### ${idx + 1}. ${p.title}\n`
    markdown += `**Budget:** $${p.budget || 'N/A'}\n`
    markdown += `**Status:** ${p.status || 'N/A'}\n`
    markdown += `**Priority:** ${p.priority || 'N/A'}\n`
    if (p.skills && p.skills.length > 0) {
      markdown += `**Skills:** ${p.skills.join(', ')}\n`
    }
    if (p.description) {
      markdown += `\n${p.description}\n`
    }
    markdown += `\n---\n\n`
  })

  downloadFile(markdown, 'projects.md', 'text/markdown')
}

const downloadFile = (content, filename, mimeType) => {
  const blob = new Blob([content], { type: mimeType })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}

export const getExportSummary = (projects, filters) => {
  return {
    totalProjects: projects.length,
    totalBudget: projects.reduce((sum, p) => sum + (p.budget || 0), 0),
    avgBudget: projects.length > 0 ? Math.round(projects.reduce((sum, p) => sum + (p.budget || 0), 0) / projects.length) : 0,
    priorityCounts: {
      urgent: projects.filter((p) => p.priority === 'urgent').length,
      high: projects.filter((p) => p.priority === 'high').length,
      medium: projects.filter((p) => p.priority === 'medium').length,
      low: projects.filter((p) => p.priority === 'low').length
    },
    statusCounts: {
      active: projects.filter((p) => p.status === 'active').length,
      completed: projects.filter((p) => p.status === 'completed').length,
      pending: projects.filter((p) => p.status === 'pending').length
    }
  }
}
