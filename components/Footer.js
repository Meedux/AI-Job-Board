import Image from 'next/image';
import Link from 'next/link';
import { colors, typography, components, layout, spacing, animations } from '../utils/designSystem';

const Footer = () => {
  const socialLinks = [
    { name: 'Twitter', href: 'https://x.com/GetGetHired', icon: '𝕏' },
    { name: 'LinkedIn', href: 'https://linkedin.com/company/getgethired', icon: 'in' },
    { name: 'Facebook', href: 'https://facebook.com/getgethired', icon: 'f' },
    { name: 'Instagram', href: 'https://instagram.com/getgethired', icon: '📷' }
  ];

  return (
    <footer className={`${colors.neutral.surface} ${colors.neutral.borderLight} border-t mt-20`}>
      <div className={`${layout.container} py-10`}>
        <div className="text-center">
          {/* Logo */}
          <Link href="/" className="inline-flex items-center space-x-3 mb-6">
            <div className="w-8 h-8 relative">
              <Image
                src="https://i.imgur.com/DNx92fD.png"
                alt="GetGetHired"
                width={32}
                height={32}
                className="rounded"
              />
            </div>
            <h2 className={`${typography.h5} ${colors.neutral.textPrimary}`}>
              GetGetHired
            </h2>
          </Link>

          {/* Social Links */}
          <div className={`flex justify-center ${spacing.gapSmall} mb-6`}>
            {socialLinks.map((social) => (
              <a
                key={social.name}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`w-10 h-10 flex items-center justify-center ${colors.neutral.backgroundTertiary} hover:${colors.neutral.backgroundSecondary} rounded-full ${animations.transition}`}
                aria-label={social.name}
              >
                <span className={`${colors.neutral.textTertiary} ${typography.bodySmall} font-medium`}>
                  {social.icon}
                </span>
              </a>
            ))}
          </div>

          {/* Navigation Links */}
          <div className={`flex flex-wrap justify-center ${spacing.gapMedium} mb-6`}>
            <Link href="/about" className={`${components.nav.link} ${typography.bodyBase}`}>
              About
            </Link>
            <Link href="/terms" className={`${components.nav.link} ${typography.bodyBase}`}>
              Terms of Service
            </Link>
          </div>

          {/* Copyright */}
          <div className={`${typography.bodySmall} ${colors.neutral.textMuted}`}>
            © 2025 GetGetHired - All Rights Reserved
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
