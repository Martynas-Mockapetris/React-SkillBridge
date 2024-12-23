import { useTheme } from '../context/ThemeContext'
import SearchBar from '../components/shared/SearchBar'

const Listings = () => {
  const { isDarkMode } = useTheme()

  return (
    <main className={`transition-colors duration-300 ${isDarkMode ? 'bg-primary text-light' : 'bg-light text-primary'}`}>
      <SearchBar />
    </main>
  )
}

export default Listings
