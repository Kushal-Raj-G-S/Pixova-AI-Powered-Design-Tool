import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function TermsPage() {
  return (
    <main className="min-h-screen">
      <Header />
      <div className="pt-16">
        <div className="section-padding">
          <div className="mx-auto max-w-4xl px-6 lg:px-8">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Terms of Service
              </h1>
              <p className="text-lg text-gray-600">
                Terms and conditions for using Pixoa
              </p>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100 prose prose-lg max-w-none">
              <h2>Agreement to Terms</h2>
              <p>
                By accessing and using Pixoa, you accept and agree to be bound by the 
                terms and provision of this agreement.
              </p>

              <h3>Use License</h3>
              <p>
                Permission is granted to temporarily use Pixoa for personal and commercial 
                design creation. This is the grant of a license, not a transfer of title.
              </p>

              <h3>User Account</h3>
              <ul>
                <li>You are responsible for safeguarding your account credentials</li>
                <li>You must provide accurate and complete information</li>
                <li>You must be at least 13 years old to use our service</li>
                <li>One person or legal entity may not maintain more than one free account</li>
              </ul>

              <h3>Acceptable Use</h3>
              <p>You may not use Pixoa to:</p>
              <ul>
                <li>Create content that is illegal, harmful, or violates others' rights</li>
                <li>Generate misleading, fraudulent, or deceptive designs</li>
                <li>Attempt to reverse engineer our AI models</li>
                <li>Violate any applicable laws or regulations</li>
              </ul>

              <h3>Intellectual Property</h3>
              <p>
                You retain ownership of designs you create. Pixoa retains ownership of 
                our platform, AI models, and technology. You grant us a license to use 
                your prompts to improve our services.
              </p>

              <h3>Service Availability</h3>
              <p>
                We strive to keep Pixoa available 24/7, but we may experience downtime 
                for maintenance or updates. We don't guarantee uninterrupted service.
              </p>

              <h3>Limitation of Liability</h3>
              <p>
                Pixoa shall not be liable for any indirect, incidental, special, 
                consequential, or punitive damages resulting from your use of the service.
              </p>

              <div className="bg-primary-50 rounded-lg p-6 mt-8">
                <p className="text-sm text-gray-600 mb-0">
                  Last updated: October 2025. For questions about these terms, 
                  contact us at legal@pixoa.com
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}