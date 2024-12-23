import { useTheme } from '../context/ThemeContext'
import ContactSection from '../components/Home/ContactSection'
import FeaturesSection from '../components/Home/FeatureSection'
import HeroSection from '../components/Home/HeroSection'
import HowItWorksSection from '../components/Home/HowItWorksSection'
import PricingSection from '../components/Home/PricingSection'
import TestimonialsSection from '../components/Home/TestimonialsSection'

const Home = () => {
  const { isDarkMode } = useTheme()

  return (
    <main className={`transition-colors duration-300 ${isDarkMode ? 'bg-primary text-light' : 'bg-light text-primary'}`}>
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <PricingSection />
      <ContactSection />
    </main>
  )
}

export default Home
