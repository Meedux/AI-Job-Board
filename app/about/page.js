'use client';

import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { colors, typography, components, layout, spacing } from '../../utils/designSystem';

export default function AboutPage() {
  const teamMembers = [
    {
      name: 'Sarah Johnson',
      role: 'CEO & Founder',
      image: 'https://i.imgur.com/placeholder1.jpg',
      bio: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'
    },
    {
      name: 'Michael Chen',
      role: 'CTO',
      image: 'https://i.imgur.com/placeholder2.jpg',
      bio: 'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.'
    },
    {
      name: 'Emily Rodriguez',
      role: 'Head of Product',
      image: 'https://i.imgur.com/placeholder3.jpg',
      bio: 'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.'
    },
    {
      name: 'David Thompson',
      role: 'VP of Engineering',
      image: 'https://i.imgur.com/placeholder4.jpg',
      bio: 'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
    }
  ];

  const values = [
    {
      icon: '🎯',
      title: 'Mission-Driven',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'
    },
    {
      icon: '🤝',
      title: 'Trust & Transparency',
      description: 'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.'
    },
    {
      icon: '⚡',
      title: 'Innovation First',
      description: 'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.'
    },
    {
      icon: '🌟',
      title: 'Excellence',
      description: 'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
    }
  ];

  const stats = [
    { number: '10,000+', label: 'Companies Trust Us' },
    { number: '500K+', label: 'Jobs Posted' },
    { number: '2M+', label: 'Candidates Reached' },
    { number: '98%', label: 'Customer Satisfaction' }
  ];

  return (
    <div className={`min-h-screen ${colors.neutral.background} font-sans`}>
      <Header />
      
      {/* Hero Section */}
      <div className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className={`${typography.h1} ${colors.neutral.textPrimary} mb-6`}>
            About GetGetHired
          </h1>
          <p className={`${typography.bodyLarge} ${colors.neutral.textTertiary} max-w-3xl mx-auto mb-8`}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
          </p>
        </div>
      </div>

      {/* Stats Section */}
      <div className="px-4 py-16 bg-gray-800 dark:bg-gray-800">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className={`${typography.h1} ${colors.primary.text} font-bold mb-2`}>
                  {stat.number}
                </div>
                <div className={`${typography.bodyBase} ${colors.neutral.textTertiary}`}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Our Story Section */}
      <div className="px-4 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className={`${typography.h2} ${colors.neutral.textPrimary} mb-6`}>
                Our Story
              </h2>
              <div className="space-y-4">
                <p className={`${typography.bodyBase} ${colors.neutral.textTertiary}`}>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                </p>
                <p className={`${typography.bodyBase} ${colors.neutral.textTertiary}`}>
                  Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                </p>
                <p className={`${typography.bodyBase} ${colors.neutral.textTertiary}`}>
                  Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis.
                </p>
              </div>
            </div>
            <div className={`${components.card.base} ${components.card.padding} text-center`}>
              <div className="text-6xl mb-4">🚀</div>
              <h3 className={`${typography.h4} ${colors.neutral.textPrimary} mb-4`}>
                Founded in 2020
              </h3>
              <p className={`${typography.bodyBase} ${colors.neutral.textTertiary}`}>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="px-4 py-20 bg-gray-800 dark:bg-gray-800">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className={`${typography.h2} ${colors.neutral.textPrimary} mb-4`}>
              Our Values
            </h2>
            <p className={`${typography.bodyLarge} ${colors.neutral.textTertiary} max-w-3xl mx-auto`}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className={`${components.card.base} ${components.card.padding} text-center`}>
                <div className="text-4xl mb-4">{value.icon}</div>
                <h3 className={`${typography.h5} ${colors.neutral.textPrimary} mb-3`}>
                  {value.title}
                </h3>
                <p className={`${typography.bodyBase} ${colors.neutral.textTertiary}`}>
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="px-4 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className={`${typography.h2} ${colors.neutral.textPrimary} mb-4`}>
              Meet Our Team
            </h2>
            <p className={`${typography.bodyLarge} ${colors.neutral.textTertiary} max-w-3xl mx-auto`}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <div key={index} className={`${components.card.base} ${components.card.padding} text-center`}>
                <div className="w-24 h-24 mx-auto mb-4 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                  <span className="text-2xl">👤</span>
                </div>
                <h3 className={`${typography.h5} ${colors.neutral.textPrimary} mb-1`}>
                  {member.name}
                </h3>
                <p className={`${typography.bodySmall} ${colors.primary.text} mb-3 font-medium`}>
                  {member.role}
                </p>
                <p className={`${typography.bodySmall} ${colors.neutral.textTertiary}`}>
                  {member.bio}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mission Statement */}
      <div className="px-4 py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className={`${typography.h2} text-white mb-6`}>
            Our Mission
          </h2>
          <p className={`${typography.bodyLarge} text-blue-100 max-w-3xl mx-auto mb-8`}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
          </p>          <blockquote className={`${typography.h4} text-white font-light italic border-l-4 border-white pl-6 mx-auto max-w-2xl text-left`}>
            &ldquo;Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.&rdquo;
          </blockquote>
        </div>
      </div>

      {/* Contact CTA */}
      <div className="px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className={`${typography.h2} ${colors.neutral.textPrimary} mb-4`}>
            Get In Touch
          </h2>
          <p className={`${typography.bodyLarge} ${colors.neutral.textTertiary} mb-8 max-w-2xl mx-auto`}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Have questions or want to learn more about our platform?
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/feedback"
              className={`${components.button.base} ${components.button.primary} ${components.button.sizes.large} flex items-center justify-center space-x-2`}
            >
              <span>Contact Us</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </a>
            <a
              href="/pricing"
              className={`${components.button.base} ${components.button.secondary} ${components.button.sizes.large} flex items-center justify-center space-x-2`}
            >
              <span>View Pricing</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}