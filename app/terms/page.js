'use client';

import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { colors, typography, components, layout } from '../../utils/designSystem';

export default function TermsPage() {
  return (
    <div className={`min-h-screen ${colors.neutral.background} font-sans`}>
      <Header />
      
      {/* Hero Section */}
      <div className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className={`${typography.h1} ${colors.neutral.textPrimary} mb-4`}>
            Terms of Use
          </h1>
          <p className={`${typography.bodyBase} ${colors.neutral.textTertiary}`}>
            Effective Date: June 20, 2025
          </p>
        </div>
      </div>

      {/* Terms Content */}
      <div className="px-4 pb-20">
        <div className="max-w-4xl mx-auto">
          <div className={`${components.card.base} ${components.card.padding} prose prose-gray dark:prose-invert max-w-none`}>
            
            {/* Introduction */}
            <div className="mb-8">
              <p className={`${typography.bodyBase} ${colors.neutral.textTertiary} leading-relaxed`}>
                Welcome to <strong>GetGetHire.com</strong> (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;), an AI-powered remote job site dedicated to helping both job seekers and hirers connect, collaborate, and find ideal remote work opportunities. By accessing or using our website, platform, and services (collectively, the &ldquo;Services&rdquo;), you agree to be bound by the following <strong>Terms of Use</strong> (&ldquo;Terms&rdquo;). Please read them carefully.
              </p>
            </div>

            {/* Section 1 */}
            <section className="mb-8">
              <h2 className={`${typography.h3} ${colors.neutral.textPrimary} mb-4 border-b ${colors.neutral.borderLight} pb-2`}>
                1. Acceptance of Terms
              </h2>
              <p className={`${typography.bodyBase} ${colors.neutral.textTertiary} leading-relaxed`}>
                By using GetGetHire.com, you agree to comply with and be bound by these Terms. If you do not agree with these Terms, do not access or use our platform.
              </p>
            </section>

            {/* Section 2 */}
            <section className="mb-8">
              <h2 className={`${typography.h3} ${colors.neutral.textPrimary} mb-4 border-b ${colors.neutral.borderLight} pb-2`}>
                2. Changes to Terms
              </h2>
              <p className={`${typography.bodyBase} ${colors.neutral.textTertiary} leading-relaxed`}>
                We may update, modify, or change these Terms at any time, and such changes will be effective immediately upon posting. We recommend reviewing these Terms periodically to stay informed of any updates. Your continued use of our platform after the changes are posted constitutes your acceptance of the revised Terms.
              </p>
            </section>

            {/* Section 3 */}
            <section className="mb-8">
              <h2 className={`${typography.h3} ${colors.neutral.textPrimary} mb-4 border-b ${colors.neutral.borderLight} pb-2`}>
                3. Registration and Account
              </h2>
              <p className={`${typography.bodyBase} ${colors.neutral.textTertiary} leading-relaxed`}>
                To access certain features of our Services, you may be required to register for an account. You agree to provide accurate, complete, and current information during the registration process and to keep your account information updated. You are responsible for maintaining the confidentiality of your login credentials and for all activities that occur under your account.
              </p>
            </section>

            {/* Section 4 */}
            <section className="mb-8">
              <h2 className={`${typography.h3} ${colors.neutral.textPrimary} mb-4 border-b ${colors.neutral.borderLight} pb-2`}>
                4. User Responsibilities
              </h2>
              <p className={`${typography.bodyBase} ${colors.neutral.textTertiary} leading-relaxed mb-4`}>
                You agree to use GetGetHire.com only for lawful purposes and in accordance with these Terms. You will not engage in any of the following:
              </p>
              <ul className={`${typography.bodyBase} ${colors.neutral.textTertiary} space-y-2 ml-6`}>
                <li className="flex items-start space-x-2">
                  <span className={`${colors.primary.text} mt-1.5`}>•</span>
                  <span>Violating applicable laws or regulations</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className={`${colors.primary.text} mt-1.5`}>•</span>
                  <span>Interfering with the functionality of the platform</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className={`${colors.primary.text} mt-1.5`}>•</span>
                  <span>Posting or transmitting harmful, defamatory, obscene, or otherwise unlawful content</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className={`${colors.primary.text} mt-1.5`}>•</span>
                  <span>Impersonating another individual or entity</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className={`${colors.primary.text} mt-1.5`}>•</span>
                  <span>Using automated systems or software to access or scrape data from the platform without our permission</span>
                </li>
              </ul>
            </section>

            {/* Section 5 */}
            <section className="mb-8">
              <h2 className={`${typography.h3} ${colors.neutral.textPrimary} mb-4 border-b ${colors.neutral.borderLight} pb-2`}>
                5. Job Seekers and Hirers
              </h2>
              <p className={`${typography.bodyBase} ${colors.neutral.textTertiary} leading-relaxed mb-4`}>
                GetGetHire.com provides a platform for job seekers to connect with hirers offering remote work opportunities. We are not involved in the hiring process and do not guarantee job placements, the success of the recruitment process, or the accuracy of job listings.
              </p>
              <ul className={`${typography.bodyBase} ${colors.neutral.textTertiary} space-y-3 ml-6`}>
                <li className="flex items-start space-x-2">
                  <span className={`${colors.primary.text} mt-1.5`}>•</span>
                  <span><strong>For Job Seekers:</strong> You are responsible for the content and accuracy of your profile, including your resume, skills, and other job-related details. You acknowledge that GetGetHire.com does not guarantee job offers or interviews.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className={`${colors.primary.text} mt-1.5`}>•</span>
                  <span><strong>For Hirers:</strong> You are responsible for the accuracy of job listings, including descriptions, requirements, and compensation details. Hirers must follow all applicable laws and regulations related to hiring practices.</span>
                </li>
              </ul>
            </section>

            {/* Section 6 */}
            <section className="mb-8">
              <h2 className={`${typography.h3} ${colors.neutral.textPrimary} mb-4 border-b ${colors.neutral.borderLight} pb-2`}>
                6. AI-Powered Features
              </h2>
              <p className={`${typography.bodyBase} ${colors.neutral.textTertiary} leading-relaxed`}>
                GetGetHire.com utilizes AI tools to help improve job matches between job seekers and hirers. These tools analyze data and provide recommendations, but the ultimate decision-making is yours. We make no guarantees regarding the {"AI's"} ability to match job seekers with hirers or ensure job placement success.
              </p>
            </section>

            {/* Section 7 */}
            <section className="mb-8">
              <h2 className={`${typography.h3} ${colors.neutral.textPrimary} mb-4 border-b ${colors.neutral.borderLight} pb-2`}>
                7. Content Ownership
              </h2>
              <p className={`${typography.bodyBase} ${colors.neutral.textTertiary} leading-relaxed`}>
                All content on GetGetHire.com, including text, graphics, logos, images, videos, and software, is the property of GetGetHire.com or its content providers and is protected by intellectual property laws. You are granted a limited, non-exclusive, non-transferable license to use the platform solely for its intended purpose.
              </p>
            </section>

            {/* Section 8 */}
            <section className="mb-8">
              <h2 className={`${typography.h3} ${colors.neutral.textPrimary} mb-4 border-b ${colors.neutral.borderLight} pb-2`}>
                8. Third-Party Links
              </h2>
              <p className={`${typography.bodyBase} ${colors.neutral.textTertiary} leading-relaxed`}>
                Our platform may contain links to third-party websites or resources. We are not responsible for the content, accuracy, or availability of such third-party websites. The inclusion of any link does not imply endorsement or affiliation with GetGetHire.com.
              </p>
            </section>

            {/* Section 9 */}
            <section className="mb-8">
              <h2 className={`${typography.h3} ${colors.neutral.textPrimary} mb-4 border-b ${colors.neutral.borderLight} pb-2`}>
                9. Privacy and Data Collection
              </h2>
              <p className={`${typography.bodyBase} ${colors.neutral.textTertiary} leading-relaxed`}>
                We value your privacy. Please refer to our <strong>Privacy Policy</strong> to understand how we collect, use, and protect your personal information. By using our platform, you consent to the collection and processing of your data as described in the Privacy Policy.
              </p>
            </section>

            {/* Section 10 */}
            <section className="mb-8">
              <h2 className={`${typography.h3} ${colors.neutral.textPrimary} mb-4 border-b ${colors.neutral.borderLight} pb-2`}>
                10. Termination
              </h2>
              <p className={`${typography.bodyBase} ${colors.neutral.textTertiary} leading-relaxed`}>
                We reserve the right to suspend or terminate your access to GetGetHire.com at our sole discretion, without notice, if we believe you have violated these Terms or for any other reason. Upon termination, your access to certain features of the platform may be restricted.
              </p>
            </section>

            {/* Section 11 */}
            <section className="mb-8">
              <h2 className={`${typography.h3} ${colors.neutral.textPrimary} mb-4 border-b ${colors.neutral.borderLight} pb-2`}>
                11. Disclaimers
              </h2>
              <p className={`${typography.bodyBase} ${colors.neutral.textTertiary} leading-relaxed`}>
                GetGetHire.com is provided &ldquo;as is&rdquo; and &ldquo;as available,&rdquo; without any warranties or representations, express or implied. We do not guarantee the accuracy, reliability, or completeness of the {"platform's"} content or services. We disclaim all liability for any damages arising from your use of the platform.
              </p>
            </section>

            {/* Section 12 */}
            <section className="mb-8">
              <h2 className={`${typography.h3} ${colors.neutral.textPrimary} mb-4 border-b ${colors.neutral.borderLight} pb-2`}>
                12. Limitation of Liability
              </h2>
              <p className={`${typography.bodyBase} ${colors.neutral.textTertiary} leading-relaxed`}>
                To the fullest extent permitted by law, GetGetHire.com will not be liable for any indirect, incidental, special, or consequential damages arising from or related to your use of the platform. Our total liability in any event will be limited to the amount you have paid for access to the platform in the 30 days preceding the claim.
              </p>
            </section>

            {/* Section 13 */}
            <section className="mb-8">
              <h2 className={`${typography.h3} ${colors.neutral.textPrimary} mb-4 border-b ${colors.neutral.borderLight} pb-2`}>
                13. Governing Law
              </h2>
              <p className={`${typography.bodyBase} ${colors.neutral.textTertiary} leading-relaxed`}>
                These Terms will be governed by and construed in accordance with the laws of [Insert Jurisdiction], without regard to its conflict of law principles. Any disputes arising from these Terms or your use of GetGetHire.com will be resolved exclusively in the courts located in [Insert Jurisdiction].
              </p>
            </section>

            {/* Section 14 */}
            <section className="mb-8">
              <h2 className={`${typography.h3} ${colors.neutral.textPrimary} mb-4 border-b ${colors.neutral.borderLight} pb-2`}>
                14. Indemnification
              </h2>
              <p className={`${typography.bodyBase} ${colors.neutral.textTertiary} leading-relaxed`}>
                You agree to indemnify and hold harmless GetGetHire.com, its affiliates, employees, agents, and partners from any claims, losses, damages, or liabilities arising from your use of the platform or violation of these Terms.
              </p>
            </section>

            {/* Section 15 */}
            <section className="mb-8">
              <h2 className={`${typography.h3} ${colors.neutral.textPrimary} mb-4 border-b ${colors.neutral.borderLight} pb-2`}>
                15. Entire Agreement
              </h2>
              <p className={`${typography.bodyBase} ${colors.neutral.textTertiary} leading-relaxed`}>
                These Terms constitute the entire agreement between you and GetGetHire.com regarding your use of the platform. If any provision of these Terms is found to be invalid or unenforceable, the remaining provisions will continue in full force and effect.
              </p>
            </section>

            {/* Section 16 */}
            <section className="mb-8">
              <h2 className={`${typography.h3} ${colors.neutral.textPrimary} mb-4 border-b ${colors.neutral.borderLight} pb-2`}>
                16. Contact Information
              </h2>
              <p className={`${typography.bodyBase} ${colors.neutral.textTertiary} leading-relaxed mb-4`}>
                If you have any questions or concerns regarding these Terms, please contact us at:
              </p>
              <div className={`${colors.neutral.backgroundSecondary} rounded-lg p-4 ${typography.bodyBase}`}>
                <p className={`${colors.neutral.textPrimary} font-medium mb-1`}>GetGetHire.com</p>
                <p className={colors.neutral.textTertiary}>Email: gegethiredjobs@gmail.com</p>
              </div>
            </section>

            {/* Closing Statement */}
            <div className={`${colors.primary[50]} rounded-lg p-6 text-center mt-12`}>
              <p className={`${typography.bodyBase} ${colors.neutral.textPrimary} font-medium`}>
                By using GetGetHire.com, you acknowledge that you have read, understood, and agree to these Terms of Use.
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}