import Features from '@/components/Features'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function FeaturesPage() {
  return (
    <main className="min-h-screen">
      <Header />
      <div className="pt-16">
        <Features />
      </div>
      <Footer />
    </main>
  )
}