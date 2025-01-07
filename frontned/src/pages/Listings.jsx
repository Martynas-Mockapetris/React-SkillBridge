import { useTheme } from '../context/ThemeContext'
import SearchBar from '../components/shared/SearchBar'
import ListingTabs from '../components/Listings/ListingTabs'

const Listings = () => {
  const { isDarkMode } = useTheme()

  return (
    <main className={`transition-colors duration-300 ${isDarkMode ? 'bg-primary text-light' : 'bg-light text-primary'}`}>
      <SearchBar />
      <ListingTabs />
    </main>
  )
}

export default Listings
