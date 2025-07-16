'use client';

import { useState, useEffect } from 'react';
import { useSubscription } from '../contexts/SubscriptionContext';
import { useAuth } from '../contexts/AuthContext';
import PaymentModal from './PaymentModal';
import { combineClasses } from '../utils/designSystem';

// Fallback data to ensure something always shows
const FALLBACK_PACKAGES = [
  {
    id: 'resume_starter',
    name: 'Resume Starter',
    description: 'Perfect for small recruiters',
    creditType: 'resume_contact',
    creditAmount: 25,
    price: 199,
    currency: 'PHP',
    bonusCredits: 5,
    isActive: true
  },
  {
    id: 'resume_pro',
    name: 'Resume Pro',
    description: 'Best for growing companies',
    creditType: 'resume_contact',
    creditAmount: 100,
    price: 599,
    currency: 'PHP',
    bonusCredits: 25,
    isActive: true
  },
  {
    id: 'ai_starter',
    name: 'AI Starter',
    description: 'Basic AI analysis',
    creditType: 'ai_credit',
    creditAmount: 10,
    price: 149,
    currency: 'PHP',
    bonusCredits: 2,
    isActive: true
  },
  {
    id: 'ai_pro',
    name: 'AI Pro',
    description: 'Advanced AI features',
    creditType: 'ai_credit',
    creditAmount: 50,
    price: 599,
    currency: 'PHP',
    bonusCredits: 15,
    isActive: true
  }
];

const CreditPackages = ({ packages: propPackages }) => {
  const { 
    packages: contextPackages, 
    loading, 
    loadPackages, 
    purchaseCredits 
  } = useSubscription();
  const { user } = useAuth();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [displayPackages, setDisplayPackages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Use prop packages first, then context packages, then fallback
    if (propPackages && propPackages.length > 0) {
      console.log('CreditPackages: Using prop packages:', propPackages.length);
      setDisplayPackages(propPackages);
      setIsLoading(false);
    } else if (contextPackages && Array.isArray(contextPackages) && contextPackages.length > 0) {
      console.log('CreditPackages: Using context packages:', contextPackages.length);
      setDisplayPackages(contextPackages);
      setIsLoading(false);
    } else {
      console.log('CreditPackages: Loading packages via API...');
      loadPackagesData();
    }
  }, [propPackages, contextPackages]);

  useEffect(() => {
    // This effect is now handled in the main useEffect above
  }, [contextPackages]);

  const loadPackagesData = async () => {
    try {
      setIsLoading(true);
      
      // Try to load from context first
      if (loadPackages) {
        await loadPackages();
      }
      
      // If that doesn't work, try direct API call
      if (!contextPackages || contextPackages.length === 0) {
        const response = await fetch('/api/credits/packages');
        const data = await response.json();
        
        if (data.success && data.all) {
          console.log('CreditPackages: Loaded', data.all.length, 'packages from API');
          setDisplayPackages(data.all);
        } else {
          console.log('CreditPackages: Using fallback packages');
          setDisplayPackages(FALLBACK_PACKAGES);
        }
      }
    } catch (error) {
      console.error('CreditPackages: Error loading packages:', error);
      setDisplayPackages(FALLBACK_PACKAGES);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePurchaseCredits = async (packageData) => {
    console.log('🛒 Starting credit purchase for package:', packageData);
    
    // Always redirect to login if not authenticated
    if (!user) {
      window.location.href = '/login';
      return;
    }

    try {
      // For authenticated users, create payment intent first
      console.log('🔄 Creating payment intent for package:', packageData.id);
      
      if (purchaseCredits) {
        const paymentIntent = await purchaseCredits(packageData.id);
        console.log('✅ Payment intent created:', paymentIntent);
      }
      
      // Show the payment modal
      setSelectedPackage(packageData);
      setShowPaymentModal(true);
      
    } catch (error) {
      console.error('Failed to initiate credit purchase:', error);
      alert('Failed to initiate payment. Please try again.');
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
        return '👁️';
      case 'ai_credits':
        return '🤖';
      case 'job_application':
        return '📋';
      default:
        return '💳';
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
    // Ensure displayPackages is always an array
    const packagesArray = Array.isArray(displayPackages) ? displayPackages : [];
    
    // Map the component types to database types
    const typeMapping = {
      'resume_view': 'resume_contact',
      'ai_credits': 'ai_credit',
      'job_application': 'job_application'
    };
    
    const dbType = typeMapping[type] || type;
    
    const filtered = packagesArray.filter(pkg => 
      pkg.creditType === dbType || 
      pkg.credit_type === dbType ||
      pkg.creditType === type || 
      pkg.credit_type === type
    );
    
    console.log(`CreditPackages: Filtering by type ${type} (db type: ${dbType}):`, filtered.length, 'packages');
    return filtered;
  };

  const getCreditTypeDescription = (type) => {
    switch (type) {
      case 'resume_view':
        return 'View contact information and resumes of job applicants';
      case 'ai_credits':
        return 'Use AI-powered tools for job matching and analysis';
      case 'job_application':
        return 'Apply to premium job postings with enhanced visibility';
      default:
        return 'Access premium features';
    }
  };

  if (isLoading) {
    console.log('CreditPackages: Still loading...');
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-400">Loading credit packages...</p>
      </div>
    );
  }

  console.log('CreditPackages: About to render with displayPackages:', displayPackages.length, 'packages');
  
  return (
    <div className="space-y-8">
      {/* Credit Packages Overview */}
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-white mb-4">Credit Packages</h2>
        <p className="text-gray-400 text-lg">
          Purchase credits to access premium features and enhance your job search experience
        </p>
      </div>

      {/* Resume View Credits */}
      <div className="bg-gray-900 rounded-2xl p-6 border border-gray-700">
        <div className="flex items-center gap-3 mb-6">
          <div className="text-blue-400 text-2xl">
            👁️
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Resume View Credits</h2>
            <p className="text-gray-400 text-sm">{getCreditTypeDescription('resume_view')}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {getPackagesByType('resume_view').length > 0 ? (
            getPackagesByType('resume_view').map((pkg) => (
              <div key={pkg.id} className="bg-gray-800 rounded-lg p-4 border border-gray-600 hover:border-blue-500 transition-colors">
                <div className="text-center">
                  <h3 className="font-semibold text-white mb-2">{pkg.name}</h3>
                  <p className="text-gray-400 text-sm mb-3">{pkg.description}</p>
                  <div className="text-2xl font-bold text-blue-400 mb-1">
                    {pkg.creditAmount || pkg.credit_amount} Credits
                  </div>
                  {(pkg.bonusCredits || pkg.bonus_credits) > 0 && (
                    <div className="text-sm text-green-400 mb-3">
                      +{pkg.bonusCredits || pkg.bonus_credits} bonus credits
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
                    {loading ? 'Processing...' : (user ? 'Purchase' : 'Login to Purchase')}
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-3 text-center py-8">
              <p className="text-gray-400">No resume view packages available</p>
            </div>
          )}
        </div>
      </div>

      {/* AI Credits */}
      <div className="bg-gray-900 rounded-2xl p-6 border border-gray-700">
        <div className="flex items-center gap-3 mb-6">
          <div className="text-purple-400 text-2xl">
            🤖
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">AI Credits</h2>
            <p className="text-gray-400 text-sm">{getCreditTypeDescription('ai_credits')}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {getPackagesByType('ai_credits').length > 0 ? (
            getPackagesByType('ai_credits').map((pkg) => (
              <div key={pkg.id} className="bg-gray-800 rounded-lg p-4 border border-gray-600 hover:border-purple-500 transition-colors">
                <div className="text-center">
                  <h3 className="font-semibold text-white mb-2">{pkg.name}</h3>
                  <p className="text-gray-400 text-sm mb-3">{pkg.description}</p>
                  <div className="text-2xl font-bold text-purple-400 mb-1">
                    {pkg.creditAmount || pkg.credit_amount} Credits
                  </div>
                  {(pkg.bonusCredits || pkg.bonus_credits) > 0 && (
                    <div className="text-sm text-green-400 mb-3">
                      +{pkg.bonusCredits || pkg.bonus_credits} bonus credits
                    </div>
                  )}
                  <div className="text-lg font-bold text-white mb-4">
                    ₱{pkg.price.toLocaleString()}
                  </div>                    <button
                      onClick={() => handlePurchaseCredits(pkg)}
                      disabled={loading}
                      className="w-full py-2 px-4 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
                    >
                      {loading ? 'Processing...' : (user ? 'Purchase' : 'Login to Purchase')}
                    </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-3 text-center py-8">
              <p className="text-gray-400">No AI credit packages available</p>
            </div>
          )}
        </div>
      </div>

      {/* Job Application Credits */}
      <div className="bg-gray-900 rounded-2xl p-6 border border-gray-700">
        <div className="flex items-center gap-3 mb-6">
          <div className="text-green-400 text-2xl">
            📋
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Job Application Credits</h2>
            <p className="text-gray-400 text-sm">{getCreditTypeDescription('job_application')}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {getPackagesByType('job_application').length > 0 ? (
            getPackagesByType('job_application').map((pkg) => (
              <div key={pkg.id} className="bg-gray-800 rounded-lg p-4 border border-gray-600 hover:border-green-500 transition-colors">
                <div className="text-center">
                  <h3 className="font-semibold text-white mb-2">{pkg.name}</h3>
                  <p className="text-gray-400 text-sm mb-3">{pkg.description}</p>
                  <div className="text-2xl font-bold text-green-400 mb-1">
                    {pkg.creditAmount || pkg.credit_amount} Credits
                  </div>
                  {(pkg.bonusCredits || pkg.bonus_credits) > 0 && (
                    <div className="text-sm text-green-400 mb-3">
                      +{pkg.bonusCredits || pkg.bonus_credits} bonus credits
                    </div>
                  )}
                  <div className="text-lg font-bold text-white mb-4">
                    ₱{pkg.price.toLocaleString()}
                  </div>
                  <button
                    onClick={() => handlePurchaseCredits(pkg)}
                    disabled={loading}
                    className="w-full py-2 px-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
                  >
                    {loading ? 'Processing...' : (user ? 'Purchase' : 'Login to Purchase')}
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-3 text-center py-8">
              <p className="text-gray-400">No job application packages available</p>
            </div>
          )}
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedPackage && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          onSuccess={handlePaymentSuccess}
          paymentType="credit"
          planData={selectedPackage}
        />
      )}
    </div>
  );
};

export default CreditPackages;
