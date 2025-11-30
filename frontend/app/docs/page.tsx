import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function DocsPage() {
  return (
    <main className="min-h-screen">
      <Header />
      <div className="pt-16">
        <div className="section-padding">
          <div className="mx-auto max-w-4xl px-6 lg:px-8">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Documentation
              </h1>
              <p className="text-lg text-gray-600">
                Learn how to use Pixoa's AI-powered design tools
              </p>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                📚 Documentation Coming Soon
              </h2>
              <p className="text-gray-600 mb-6">
                We're preparing detailed documentation, API references, and developer 
                guides to help you integrate and use Pixoa effectively.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="font-semibold text-gray-900 mb-3">
                    🚀 Getting Started
                  </h3>
                  <p className="text-sm text-gray-600">
                    Step-by-step guides to help you create your first designs
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="font-semibold text-gray-900 mb-3">
                    🛠️ API Reference
                  </h3>
                  <p className="text-sm text-gray-600">
                    Complete API documentation for developers
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}