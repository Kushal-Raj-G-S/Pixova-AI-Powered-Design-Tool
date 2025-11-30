import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function HelpPage() {
  return (
    <main className="min-h-screen">
      <Header />
      <div className="pt-16">
        <div className="section-padding">
          <div className="mx-auto max-w-4xl px-6 lg:px-8">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Help Center
              </h1>
              <p className="text-lg text-gray-600">
                Find answers to common questions and get support for Pixoa
              </p>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                🚧 Help Center Coming Soon
              </h2>
              <p className="text-gray-600 mb-6">
                We're working on building a comprehensive help center with tutorials, 
                FAQs, and troubleshooting guides to help you get the most out of Pixoa.
              </p>
              <div className="bg-primary-50 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-3">
                  Need help right now? Contact us:
                </h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>📧 Email: support@pixoa.com</li>
                  <li>💬 Live Chat: Available on our website</li>
                  <li>📞 Phone: +1 (555) 123-4567</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}