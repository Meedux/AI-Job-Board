import { colors, typography, components, layout, gradients, spacing } from '../utils/designSystem';

const Hero = () => {
  return (
    <section className={`${gradients.hero} ${layout.section}`}>
      <div className={layout.container}>
        <div className={`${layout.maxWidth} text-center`}>
          <h1 className={`${typography.h1} ${colors.neutral.textPrimary} mb-4 sm:mb-6 px-2 sm:px-0`}>
            Latest remote jobs to grow your{' '}
            <span className={`${gradients.primary} bg-clip-text text-transparent`}>
              Tech careers
            </span>
          </h1>
          <p className={`${typography.bodyLarge} ${colors.neutral.textTertiary} mb-6 sm:mb-8 max-w-3xl mx-auto px-4 sm:px-6 lg:px-0`}>
            We share the best Tech remote jobs every single day, helping you stay ahead by applying before anyone else.
          </p>
          <div className={`flex flex-col sm:flex-row ${spacing.gapSmall} justify-center px-4 sm:px-0`}>
            <button className={`${components.button.base} ${components.button.primary} ${components.button.sizes.large} w-full sm:w-auto min-h-[44px]`}>
              Browse Jobs
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
