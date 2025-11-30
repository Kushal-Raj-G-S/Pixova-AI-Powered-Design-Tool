import Pricing from '@/components/Pricing'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function PricingPage() {
  return (
    <main className="min-h-screen">
      <Header />
      <div className="pt-16">
        <Pricing />
      </div>
      <Footer />
    </main>
  )
}