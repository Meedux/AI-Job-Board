'use client';

import { useState, useEffect } from 'react';
import { useSubscription } from '../contexts/SubscriptionContext';
import { useAuth } from '../contexts/AuthContext';
import PaymentModal from './PaymentModal';
import { combineClasses } from '../utils/designSystem';

const CreditsDashboard = () => {
  const { 
    credits, 
    packages, 
    loading, 
    loadPackages, 
    purchaseCredits,
    getCreditBalance 
  } = useSubscription();
  const { user } = useAuth();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);

  useEffect(() => {
    loadPackages();
  }, []);

  const handlePurchaseCredits = async (packageData) => {
    if (!user) {
      window.location.href = '/login';
      return;
    }

    try {
      await purchaseCredits(packageData.id);
      setSelectedPackage(packageData);
      setShowPaymentModal(true);
    } catch (error) {
      console.error('Failed to initiate credit purchase:', error);
    }
  };

  const handlePaymentSuccess = () => {
    setShowPaymentModal(false);
    setSelectedPackage(null);
    // Refresh credits
    window.location.reload();
  };

  const getCreditIcon = (type) => {
    switch (type) {
      case 'resume_view':
        return (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 0h8v12H6V4z" clipRule="evenodd" />
          </svg>
        );
      case 'ai_credits':
        return (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        );
      case 'job_application':
        return (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
          </svg>
        );
      default:
        return (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  const getCreditTypeLabel = (type) => {
    switch (type) {
      case 'resume_view':
        return 'Resume Views';
      case 'ai_credits':
        return 'AI Credits';
      case 'job_application':
        return 'Job Applications';
      default:
        return type;
    }
  };

  const getCreditTypeColor = (type) => {
    switch (type) {
      case 'resume_view':
        return 'text-blue-400';
      case 'ai_credits':
        return 'text-purple-400';
      case 'job_application':
        return 'text-green-400';
      default:
        return 'text-gray-400';
    }
  };

  const getPackagesByType = (type) => {
    return packages.filter(pkg => pkg.credit_type === type);
  };

  return (
    <div className="space-y-6">
      {/* Credit Balances */}
      <div className="bg-gray-900 rounded-2xl p-6 border border-gray-700">
        <h2 className="text-xl font-bold text-white mb-6">Your Credits</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(credits).map(([type, creditData]) => (
            <div key={type} className="bg-gray-800 rounded-lg p-4 border border-gray-600">
              <div className="flex items-center gap-3 mb-2">
                <div className={combineClasses("text-lg", getCreditTypeColor(type))}>
                  {getCreditIcon(type)}
                </div>
                <div>
                  <h3 className="font-medium text-white">{getCreditTypeLabel(type)}</h3>
                  <p className="text-2xl font-bold text-white">{creditData?.balance || 0}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Credit Packages */}
      <div className="space-y-6">
        {/* Resume View Credits */}
        <div className="bg-gray-900 rounded-2xl p-6 border border-gray-700">
          <div className="flex items-center gap-3 mb-6">
            <div className="text-blue-400">
              {getCreditIcon('resume_view')}
            </div>
            <h2 className="text-xl font-bold text-white">Resume View Credits</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {getPackagesByType('resume_view').map((pkg) => (
              <div key={pkg.id} className="bg-gray-800 rounded-lg p-4 border border-gray-600 hover:border-blue-500 transition-colors">
                <div className="text-center">
                  <h3 className="font-semibold text-white mb-2">{pkg.name}</h3>
                  <p className="text-gray-400 text-sm mb-3">{pkg.description}</p>
                  <div className="text-2xl font-bold text-blue-400 mb-1">
                    {pkg.credit_amount} Credits
                  </div>
                  {pkg.bonus_credits > 0 && (
                    <div className="text-sm text-green-400 mb-3">
                      +{pkg.bonus_credits} bonus credits
                    </div>
                  )}
                  <div className="text-lg font-bold text-white mb-4">
                    ₱{pkg.price.toLocaleString()}
                  </div>
                  <button
                    onClick={() => handlePurchaseCredits(pkg)}
                    disabled={loading}
                    className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
                  >
                    {loading ? 'Processing...' : 'Purchase'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Credits */}
        <div className="bg-gray-900 rounded-2xl p-6 border border-gray-700">
          <div className="flex items-center gap-3 mb-6">
            <div className="text-purple-400">
              {getCreditIcon('ai_credits')}
            </div>
            <h2 className="text-xl font-bold text-white">AI Credits</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {getPackagesByType('ai_credits').map((pkg) => (
              <div key={pkg.id} className="bg-gray-800 rounded-lg p-4 border border-gray-600 hover:border-purple-500 transition-colors">
                <div className="text-center">
                  <h3 className="font-semibold text-white mb-2">{pkg.name}</h3>
                  <p className="text-gray-400 text-sm mb-3">{pkg.description}</p>
                  <div className="text-2xl font-bold text-purple-400 mb-1">
                    {pkg.credit_amount} Credits
                  </div>
                  {pkg.bonus_credits > 0 && (
                    <div className="text-sm text-green-400 mb-3">
                      +{pkg.bonus_credits} bonus credits
                    </div>
                  )}
                  <div className="text-lg font-bold text-white mb-4">
                    ₱{pkg.price.toLocaleString()}
                  </div>
                  <button
                    onClick={() => handlePurchaseCredits(pkg)}
                    disabled={loading}
                    className="w-full py-2 px-4 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
                  >
                    {loading ? 'Processing...' : 'Purchase'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        paymentType="credits"
        planData={selectedPackage}
        onSuccess={handlePaymentSuccess}
      />
    </div>
  );
};

export default CreditsDashboard;
