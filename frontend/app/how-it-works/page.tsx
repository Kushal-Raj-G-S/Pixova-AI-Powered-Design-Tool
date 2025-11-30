import HowItWorks from '@/components/HowItWorks'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function HowItWorksPage() {
  return (
    <main className="min-h-screen">
      <Header />
      <div className="pt-16">
        <HowItWorks />
      </div>
      <Footer />
    </main>
  )
}