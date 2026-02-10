import { createContext, useState } from 'react'

// Create the context
export const SearchContext = createContext()

// Provider component that wraps the app
export const SearchProvider = ({ children }) => {
  // State to store the search term (what user types)
  const [searchTerm, setSearchTerm] = useState('')

  // Function to update search term (called from SearchBar)
  const updateSearch = (term) => {
    setSearchTerm(term)
  }

  // Provide both value and function to all children components
  const value = {
    searchTerm,
    updateSearch
  }

  return <SearchContext.Provider value={value}>{children}</SearchContext.Provider>
}
