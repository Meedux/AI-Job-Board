import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import { hasPremiumFeature, getPremiumFeatureDescriptions } from '../utils/premiumFeatures';

const PremiumFeatureButton = ({ 
  feature, 
  onClick, 
  disabled = false, 
  className = "",
  children,
  variant = "primary"
}) => {
  const { user } = useAuth();
  const { subscription } = useSubscription();
  
  const hasFeature = hasPremiumFeature(feature, user, subscription);
  const featureDescriptions = getPremiumFeatureDescriptions();
  const featureInfo = featureDescriptions[feature];
  
  const baseClasses = "inline-flex items-center justify-center px-4 py-2 rounded-lg font-medium transition-all duration-200 relative";
  
  const variantClasses = {
    primary: hasFeature 
      ? "bg-blue-600 hover:bg-blue-700 text-white" 
      : "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white",
    secondary: hasFeature 
      ? "bg-gray-200 hover:bg-gray-300 text-gray-800" 
      : "bg-gradient-to-r from-purple-100 to-pink-100 hover:from-purple-200 hover:to-pink-200 text-purple-800 border border-purple-300",
    outline: hasFeature 
      ? "border border-gray-300 hover:bg-gray-50 text-gray-700" 
      : "border-2 border-transparent bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700"
  };
  
  const handleClick = () => {
    if (!hasFeature) {
      // Redirect to pricing page or show upgrade modal
      window.location.href = '/pricing';
      return;
    }
    
    if (onClick) {
      onClick();
    }
  };
  
  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      title={!hasFeature ? `Upgrade to use ${featureInfo?.title}` : featureInfo?.description}
    >
      {!hasFeature && (
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center text-xs font-bold text-yellow-900">
          ⭐
        </div>
      )}
      
      {featureInfo?.icon && (
        <span className="mr-2 text-lg">{featureInfo.icon}</span>
      )}
      
      {children || featureInfo?.title}
      
      {!hasFeature && (
        <span className="ml-2 text-xs bg-white/20 px-2 py-1 rounded font-bold">
          PRO
        </span>
      )}
    </button>
  );
};

export default PremiumFeatureButton;
