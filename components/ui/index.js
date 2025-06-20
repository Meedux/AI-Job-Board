import { colors, typography, components, animations } from '../../utils/designSystem';

const LoadingSpinner = ({ size = 'md', color = 'blue' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const colorClasses = {
    blue: colors.primary.text,
    gray: colors.neutral.textTertiary,
    white: 'text-white'
  };

  return (
    <div className="flex justify-center items-center">
      <svg
        className={`animate-spin ${sizeClasses[size]} ${colorClasses[color]}`}
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </div>
  );
};

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'medium', 
  disabled = false, 
  loading = false,
  className = '',
  onClick,
  type = 'button',
  ...props 
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return `${components.button.primary}`;
      case 'secondary':
        return `${components.button.secondary}`;
      case 'ghost':
        return `${components.button.ghost}`;
      default:
        return `${components.button.primary}`;
    }
  };

  const getSizeClasses = () => {
    return components.button.sizes[size] || components.button.sizes.medium;
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${components.button.base} ${getVariantClasses()} ${getSizeClasses()} ${className}`}
      {...props}
    >
      {loading ? (
        <div className="flex items-center space-x-2">
          <LoadingSpinner size="sm" color={variant === 'primary' ? 'white' : 'gray'} />
          <span>Loading...</span>
        </div>
      ) : (
        children
      )}
    </button>
  );
};

const Badge = ({ children, variant = 'default', size = 'medium' }) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'success':
        return `${colors.success.background} ${colors.success.text}`;
      case 'warning':
        return `${colors.warning.background} ${colors.warning.text}`;
      case 'error':
        return `${colors.error.background} ${colors.error.text}`;
      case 'info':
        return `${colors.primary[100]} ${colors.primary.text}`;
      default:
        return `${colors.neutral.backgroundTertiary} ${colors.neutral.textSecondary}`;
    }
  };

  const getSizeClasses = () => {
    return size === 'small' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-0.5 text-sm';
  };

  return (
    <span className={`inline-flex items-center rounded-full font-medium ${getVariantClasses()} ${getSizeClasses()}`}>
      {children}
    </span>
  );
};

const Card = ({ children, className = '', padding = true, hover = false, ...props }) => {
  const cardClasses = `
    ${components.card.base}
    ${hover ? components.card.hover : ''}
    ${padding ? components.card.padding : ''}
    ${className}
  `.trim();

  return (
    <div 
      className={cardClasses}
      {...props}
    >
      {children}
    </div>
  );
};

const Input = ({ error = false, className = '', ...props }) => {
  const inputClasses = `
    ${components.input.base}
    ${error ? components.input.error : ''}
    ${className}
  `.trim();

  return <input className={inputClasses} {...props} />;
};

const TextArea = ({ error = false, className = '', ...props }) => {
  const textareaClasses = `
    ${components.input.base}
    ${error ? components.input.error : ''}
    resize-vertical
    ${className}
  `.trim();

  return <textarea className={textareaClasses} {...props} />;
};

export { LoadingSpinner, Button, Badge, Card, Input, TextArea };
