import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import { hasPremiumFeature, getPremiumFeatureDescriptions, getPremiumFeatureLimits } from '../utils/premiumFeatures';

const PremiumFeatureCard = ({ feature, onUpgrade }) => {
  const { user } = useAuth();
  const { subscription } = useSubscription();
  
  const hasFeature = hasPremiumFeature(feature, user, subscription);
  const featureDescriptions = getPremiumFeatureDescriptions();
  const featureInfo = featureDescriptions[feature];
  const limits = getPremiumFeatureLimits(feature, subscription);
  
  if (!featureInfo) return null;
  
  return (
    <div className={`relative p-6 rounded-lg border-2 transition-all duration-300 ${
      hasFeature 
        ? 'border-green-200 bg-green-50' 
        : 'border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50'
    }`}>
      {!hasFeature && (
        <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
          ⭐
        </div>
      )}
      
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="text-3xl">{featureInfo.icon}</div>
          <div>
            <h3 className="font-bold text-lg text-gray-900">{featureInfo.title}</h3>
            <p className="text-sm text-gray-600">{featureInfo.description}</p>
          </div>
        </div>
        
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
          hasFeature 
            ? 'bg-green-100 text-green-800' 
            : 'bg-purple-100 text-purple-800'
        }`}>
          {hasFeature ? 'Active' : 'Premium'}
        </div>
      </div>
      
      {hasFeature && limits.limit !== -1 && (
        <div className="mb-4">
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm text-gray-600">Usage</span>
            <span className="text-sm font-medium text-gray-900">
              {limits.used}/{limits.limit} {limits.period === 'month' ? 'this month' : ''}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min((limits.used / limits.limit) * 100, 100)}%` }}
            />
          </div>
        </div>
      )}
      
      {hasFeature && limits.limit === -1 && (
        <div className="mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm text-green-700 font-medium">Unlimited usage</span>
          </div>
        </div>
      )}
      
      {!hasFeature && (
        <button
          onClick={onUpgrade}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 transform hover:scale-105"
        >
          Upgrade to Access
        </button>
      )}
      
      {hasFeature && (
        <div className="text-center">
          <span className="text-sm text-green-600 font-medium">✓ Feature Active</span>
        </div>
      )}
    </div>
  );
};

export default PremiumFeatureCard;
