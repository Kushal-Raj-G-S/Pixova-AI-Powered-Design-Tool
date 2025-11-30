import Testimonials from '@/components/Testimonials'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import AboutHero from '@/components/AboutHero'

export default function AboutPage() {
  return (
    <main className="min-h-screen">
      <Header />
      <div className="pt-16">
        <AboutHero />
        <Testimonials />
      </div>
      <Footer />
    </main>
  )
}