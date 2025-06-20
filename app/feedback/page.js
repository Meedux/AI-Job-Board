'use client';

import { useState } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { colors, typography, components, layout } from '../../utils/designSystem';

export default function FeedbackPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    content: ''
  });
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      setShowModal(true);
      setFormData({ name: '', email: '', content: '' });
    }, 1000);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  return (
    <div className={`min-h-screen ${colors.neutral.background} font-sans`}>
      <Header />
      
      {/* Hero Section */}
      <div className="py-20 px-4">
        <div className="max-w-screen-lg mx-auto text-center">
          <div className="max-w-2xl py-10 mx-auto">
            <h1 className={`text-4xl lg:text-6xl font-bold ${colors.neutral.textPrimary}`}>
              Request Feedback
            </h1>
            <h2 className={`mt-5 text-xl ${colors.neutral.textTertiary}`}>
              If you have an idea for our next best feature, we want to hear it.
            </h2>
          </div>
        </div>
      </div>

      {/* Feedback Form */}
      <div className="px-4 mb-20">
        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-6">
              {/* Name Field */}
              <div>
                <label className={`block ${typography.bodyBase} ${colors.neutral.textPrimary} mb-2`}>
                  Your name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className={`w-full rounded-lg border ${colors.neutral.border} bg-transparent px-3 py-2.5 ${typography.bodyBase} placeholder:text-slate-400 hover:border-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200`}
                  placeholder="Enter your full name"
                />
              </div>

              {/* Email Field */}
              <div>
                <label className={`block ${typography.bodyBase} ${colors.neutral.textPrimary} mb-2`}>
                  Your email address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className={`w-full rounded-lg border ${colors.neutral.border} bg-transparent px-3 py-2.5 ${typography.bodyBase} placeholder:text-slate-400 hover:border-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200`}
                  placeholder="Enter your email address"
                />
              </div>

              {/* Content Field */}
              <div>
                <label className={`block ${typography.bodyBase} ${colors.neutral.textPrimary} mb-2`}>
                  Content
                </label>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  required
                  rows="6"
                  className={`w-full rounded-lg border ${colors.neutral.border} bg-transparent px-3 py-2.5 ${typography.bodyBase} placeholder:text-slate-400 hover:border-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 resize-vertical`}
                  placeholder="Share your feedback, suggestions, or ideas..."
                />
              </div>

              {/* Submit Button */}
              <div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full ${components.button.base} ${components.button.primary} ${components.button.sizes.large} flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <span>Send</span>
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                      </svg>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Success Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={closeModal}></div>
          <div className="relative max-w-md w-full bg-white rounded-lg p-6 text-center">
            <div className="text-4xl mb-4">🎉</div>
            <h3 className={`${typography.h4} ${colors.neutral.textPrimary} mb-4`}>
              Thanks for feedback!
            </h3>
            <p className={`${typography.bodyBase} ${colors.neutral.textTertiary} mb-6`}>
              Thank you for your feedback! We appreciate your input and will use it to improve our service.
            </p>
            <button
              onClick={closeModal}
              className={`${components.button.base} ${components.button.secondary} flex items-center justify-center space-x-2 mx-auto`}
            >
              <span>Close</span>
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}