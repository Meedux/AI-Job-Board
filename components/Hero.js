import { colors, typography, components, layout, gradients, spacing } from '../utils/designSystem';

const Hero = () => {
  return (
    <section className={`${gradients.hero} ${layout.section}`}>
      <div className={layout.container}>
        <div className={`${layout.maxWidth} text-center`}>
          <h1 className={`${typography.h1} ${colors.neutral.textPrimary} mb-6`}>
            Latest remote jobs to grow your{' '}
            <span className={`${gradients.primary} bg-clip-text text-transparent`}>
              Tech careers
            </span>
          </h1>
          <p className={`${typography.bodyLarge} ${colors.neutral.textTertiary} mb-8 max-w-3xl mx-auto`}>
            We share the best Tech remote jobs every single day, helping you stay ahead by applying before anyone else.
          </p>
          <div className={`flex flex-col sm:flex-row ${spacing.gapSmall} justify-center`}>
            <button className={`${components.button.base} ${components.button.primary} ${components.button.sizes.large}`}>
              Browse Jobs
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
