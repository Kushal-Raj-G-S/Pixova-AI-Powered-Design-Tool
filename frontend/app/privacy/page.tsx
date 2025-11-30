import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function PrivacyPage() {
  return (
    <main className="min-h-screen">
      <Header />
      <div className="pt-16">
        <div className="section-padding">
          <div className="mx-auto max-w-4xl px-6 lg:px-8">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Privacy Policy
              </h1>
              <p className="text-lg text-gray-600">
                How we collect, use, and protect your information
              </p>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100 prose prose-lg max-w-none">
              <h2>Your Privacy Matters</h2>
              <p>
                At Pixoa, we take your privacy seriously. This policy outlines how we handle 
                your personal information when you use our AI design platform.
              </p>

              <h3>Information We Collect</h3>
              <ul>
                <li><strong>Account Information:</strong> Name, email, and account preferences</li>
                <li><strong>Design Content:</strong> Text prompts and generated designs</li>
                <li><strong>Usage Data:</strong> How you interact with our platform</li>
                <li><strong>Technical Data:</strong> IP address, browser type, device information</li>
              </ul>

              <h3>How We Use Your Information</h3>
              <ul>
                <li>Generate AI designs based on your prompts</li>
                <li>Improve our AI models and platform features</li>
                <li>Provide customer support</li>
                <li>Send important account and service updates</li>
              </ul>

              <h3>Data Protection</h3>
              <p>
                We implement industry-standard security measures to protect your data, 
                including encryption, secure servers, and regular security audits.
              </p>

              <h3>Your Rights</h3>
              <p>
                You have the right to access, update, or delete your personal information. 
                Contact us at privacy@pixoa.com for any data-related requests.
              </p>

              <div className="bg-primary-50 rounded-lg p-6 mt-8">
                <p className="text-sm text-gray-600 mb-0">
                  Last updated: October 2025. If you have questions about this policy, 
                  please contact us at privacy@pixoa.com
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