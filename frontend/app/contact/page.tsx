import FAQ from '@/components/FAQ'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ContactForm from '@/components/ContactForm'

export default function ContactPage() {
  return (
    <main className="min-h-screen">
      <Header />
      <div className="pt-16">
        <ContactForm />
        <FAQ />
      </div>
      <Footer />
    </main>
  )
}