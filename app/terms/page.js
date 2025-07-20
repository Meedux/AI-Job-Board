'use client';

import Header from '../../components/Header';
import Footer from '../../components/Footer';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header />
      
      {/* Hero Section */}
      <div className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-white mb-4">
            Terms of Use
          </h1>
          <p className="text-gray-400">
            Effective Date: July 19, 2025
          </p>
        </div>
      </div>

      {/* Terms Content */}
      <div className="px-4 pb-20">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gray-800 rounded-lg p-8 border border-gray-700 space-y-8">
            
            {/* Introduction */}
            <div className="mb-8">
              <p className="text-gray-300 leading-relaxed">
                Welcome to <strong>JobSite</strong> (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;), an AI-powered job platform dedicated to helping job seekers and hirers connect, collaborate, and find ideal opportunities. By accessing or using our website, platform, and services (collectively, the &ldquo;Services&rdquo;), you agree to be bound by the following <strong>Terms of Use</strong> (&ldquo;Terms&rdquo;). Please read them carefully.
              </p>
            </div>

            {/* Section 1 */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4 border-b border-gray-600 pb-2">
                1. Acceptance of Terms
              </h2>
              <p className="text-gray-300 leading-relaxed">
                By using JobSite, you agree to comply with and be bound by these Terms. If you do not agree with these Terms, do not access or use our platform.
              </p>
            </section>

            {/* Section 2 */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4 border-b border-gray-600 pb-2">
                2. User Types and Account Management
              </h2>
              <div className="text-gray-300 leading-relaxed space-y-4">
                <p>Our platform supports different user types with specific roles and permissions:</p>
                <div className="bg-gray-700 p-4 rounded border border-gray-600 space-y-3">
                  <div>
                    <h3 className="font-semibold text-white mb-2">Job Seekers</h3>
                    <p>Individual users who can search and apply for jobs, upload resumes, and manage their professional profiles.</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-2">Hirers/Employers</h3>
                    <p>Companies or individuals who can post jobs, search resumes, manage applications, and create sub-user accounts with specific permissions.</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-2">Sub-Users</h3>
                    <p>Staff members, vendors, or partners with limited access based on permissions granted by their parent account.</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 3 */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4 border-b border-gray-600 pb-2">
                3. Account Security and Email Verification
              </h2>
              <div className="text-gray-300 leading-relaxed space-y-3">
                <p>Account security is essential. Users must:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Verify their email address during registration</li>
                  <li>Provide accurate and complete information</li>
                  <li>Keep login credentials secure and confidential</li>
                  <li>Report any unauthorized access immediately</li>
                  <li>Be responsible for all activities under their account</li>
                </ul>
              </div>
            </section>

            {/* Section 4 */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4 border-b border-gray-600 pb-2">
                4. User Responsibilities
              </h2>
              <div className="text-gray-300 leading-relaxed space-y-3">
                <p>You agree to use JobSite only for lawful purposes and in accordance with these Terms. You will not engage in any of the following:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Violating applicable laws or regulations</li>
                  <li>Interfering with the functionality of the platform</li>
                  <li>Posting or transmitting harmful, defamatory, obscene, or otherwise unlawful content</li>
                  <li>Impersonating another individual or entity</li>
                  <li>Using automated systems or software to access or scrape data from the platform without our permission</li>
                </ul>
              </div>
            </section>

            {/* Section 5 */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4 border-b border-gray-600 pb-2">
                5. Job Seekers and Hirers
              </h2>
              <div className="text-gray-300 leading-relaxed space-y-3">
                <p>JobSite provides a platform for job seekers to connect with hirers offering opportunities. We are not involved in the hiring process and do not guarantee job placements, the success of the recruitment process, or the accuracy of job listings.</p>
                <ul className="list-disc pl-6 space-y-2 mt-4">
                  <li><strong>For Job Seekers:</strong> You are responsible for the content and accuracy of your profile, including your resume, skills, and other job-related details. You acknowledge that JobSite does not guarantee job offers or interviews.</li>
                  <li><strong>For Hirers:</strong> You are responsible for the accuracy of job listings, including descriptions, requirements, and compensation details. Hirers must follow all applicable laws and regulations related to hiring practices.</li>
                </ul>
              </div>
            </section>

            {/* Section 6 */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4 border-b border-gray-600 pb-2">
                6. AI-Powered Features
              </h2>
              <p className="text-gray-300 leading-relaxed">
                JobSite utilizes AI tools to help improve job matches between job seekers and hirers. These tools analyze data and provide recommendations, but the ultimate decision-making is yours. We make no guarantees regarding the AI&apos;s ability to match job seekers with hirers or ensure job placement success.
              </p>
            </section>

            {/* Section 7 */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4 border-b border-gray-600 pb-2">
                7. Privacy and Data Protection
              </h2>
              <p className="text-gray-300 leading-relaxed">
                We value your privacy. Please refer to our <strong>Privacy Policy</strong> to understand how we collect, use, and protect your personal information. By using our platform, you consent to the collection and processing of your data as described in the Privacy Policy.
              </p>
            </section>

            {/* Section 8 */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4 border-b border-gray-600 pb-2">
                8. Subscription and Credits
              </h2>
              <div className="text-gray-300 leading-relaxed space-y-3">
                <p>For premium features and employer accounts:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Subscription fees are charged in advance</li>
                  <li>Credits are allocated based on subscription plans</li>
                  <li>Sub-user credit allocations are managed by parent accounts</li>
                  <li>Cancellations take effect at the end of the current billing period</li>
                  <li>Refunds are provided according to our refund policy</li>
                </ul>
              </div>
            </section>

            {/* Section 9 */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4 border-b border-gray-600 pb-2">
                9. Content Ownership and Intellectual Property
              </h2>
              <p className="text-gray-300 leading-relaxed">
                All content on JobSite, including text, graphics, logos, images, videos, and software, is the property of JobSite or its content providers and is protected by intellectual property laws. Users retain ownership of their uploaded content but grant us a license to use it for providing our services.
              </p>
            </section>

            {/* Section 10 */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4 border-b border-gray-600 pb-2">
                10. Termination and Account Suspension
              </h2>
              <p className="text-gray-300 leading-relaxed">
                We reserve the right to suspend or terminate your access to JobSite at our sole discretion, without notice, if we believe you have violated these Terms or for any other reason. Upon termination, your access to certain features of the platform may be restricted. Users may also delete their accounts at any time through their profile settings.
              </p>
            </section>

            {/* Section 11 */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4 border-b border-gray-600 pb-2">
                11. Disclaimers and Limitation of Liability
              </h2>
              <div className="text-gray-300 leading-relaxed space-y-3">
                <p>JobSite is provided &ldquo;as is&rdquo; and &ldquo;as available,&rdquo; without any warranties or representations, express or implied. We do not guarantee the accuracy, reliability, or completeness of the platform&apos;s content or services.</p>
                <p>To the fullest extent permitted by law, JobSite will not be liable for any indirect, incidental, special, or consequential damages arising from or related to your use of the platform. Our total liability in any event will be limited to the amount you have paid for access to the platform in the 30 days preceding the claim.</p>
              </div>
            </section>

            {/* Section 12 */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4 border-b border-gray-600 pb-2">
                12. Changes to Terms
              </h2>
              <p className="text-gray-300 leading-relaxed">
                We may update, modify, or change these Terms at any time, and such changes will be effective immediately upon posting. We recommend reviewing these Terms periodically to stay informed of any updates. Your continued use of our platform after the changes are posted constitutes your acceptance of the revised Terms.
              </p>
            </section>

            {/* Contact Section */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4 border-b border-gray-600 pb-2">
                13. Contact Information
              </h2>
              <div className="text-gray-300 leading-relaxed">
                <p>For questions about these terms, contact us at:</p>
                <div className="mt-4 bg-gray-700 p-4 rounded border border-gray-600">
                  <p>Email: support@jobsite.com</p>
                  <p>Address: [Your Company Address]</p>
                  <p>Phone: [Your Phone Number]</p>
                </div>
              </div>
            </section>

          </div>

          {/* Back to Registration */}
          <div className="text-center mt-8">
            <a 
              href="/register"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
            >
              Back to Registration
            </a>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
             