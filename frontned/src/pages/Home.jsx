import FeaturesSection from '../components/Home/FeatureSection'
import HeroSection from '../components/Home/HeroSection'
import HowItWorksSection from '../components/Home/HowItWorksSection'
import TestimonialsSection from '../components/Home/TestimonialsSection'

/* Pagrindinis puslapis */
const Home = () => {
  return (
    <main>
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <TestimonialsSection />
    </main>
  )
}

export default Home
