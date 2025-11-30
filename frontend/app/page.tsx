import Hero from '@/components/Hero'
import FeaturesPreview from '@/components/FeaturesPreview'
import CTASection from '@/components/CTASection'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <main className="min-h-screen">
      <Header />
      <Hero />
      <FeaturesPreview />
      <CTASection />
      <Footer />
    </main>
  )
}