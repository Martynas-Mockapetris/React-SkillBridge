import { useTheme } from '../context/ThemeContext'
import ListingTabs from '../components/Listings/ListingTabs'

const Listings = () => {
  const { isDarkMode } = useTheme()

  return (
    <main className={`transition-colors duration-300 ${isDarkMode ? 'bg-primary text-light' : 'bg-light text-primary'}`}>
      <ListingTabs />
    </main>
  )
}

export default Listings
