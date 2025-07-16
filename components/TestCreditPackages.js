// Enhanced Test Credit Packages Component for Freemium Job Posting Site
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function TestCreditPackages() {
  const { user } = useAuth();
  const [packages, setPackages] = useState({});
  const [allPackages, setAllPackages] = useState([]);
  const [credits, setCredits] = useState({});
  const [usageLimits, setUsageLimits] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      console.log('🔄 Loading enhanced subscription data...');
      
      // Load credit packages
      const packagesResponse = await fetch('/api/credits/packages');
      const packagesData = await packagesResponse.json();
      
      if (packagesData.success) {
        setPackages(packagesData.packages);
        setAllPackages(packagesData.all);
        console.log('📦 Credit packages loaded:', packagesData.packages);
      }

      // Load user credits
      const creditsResponse = await fetch('/api/credits/balance');
      const creditsData = await creditsResponse.json();
      
      if (creditsData.success) {
        setCredits(creditsData.credits);
        console.log('💰 User credits loaded:', creditsData.credits);
      }

      // Load usage limits
      const limitsResponse = await fetch('/api/subscription/status');
      const limitsData = await limitsResponse.json();
      
      if (limitsData.success) {
        setUsageLimits(limitsData.subscription.usage);
        console.log('📊 Usage limits loaded:', limitsData.subscription.usage);
      }

      setLoading(false);
    } catch (error) {
      console.error('❌ Error loading data:', error);
      setError('Failed to load data');
      setLoading(false);
    }
  };

  const handlePurchasePackage = async (packageId) => {
    try {
      console.log('💳 Purchasing package:', packageId);
      
      const response = await fetch('/api/credits/packages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ packageId }),
      });

      const data = await response.json();
      
      if (data.success) {
        console.log('✅ Payment intent created:', data.paymentIntent);
        // In a real app, you would redirect to payment page
        alert('Payment intent created! Check console for details.');
      } else {
        console.error('❌ Failed to create payment:', data.error);
        alert('Failed to create payment: ' + data.error);
      }
    } catch (error) {
      console.error('❌ Error purchasing package:', error);
      alert('Error purchasing package: ' + error.message);
    }
  };

  const handleUseCredit = async (creditType) => {
    try {
      console.log('🎯 Using credit:', creditType);
      
      const response = await fetch('/api/credits/balance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          creditType, 
          amount: 1, 
          action: 'use' 
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        console.log('✅ Credit used:', data.result);
        setCredits(data.credits);
        alert(`Credit used successfully! Source: ${data.result.source}`);
      } else {
        console.error('❌ Failed to use credit:', data.error);
        alert('Failed to use credit: ' + data.error);
      }
    } catch (error) {
      console.error('❌ Error using credit:', error);
      alert('Error using credit: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-700 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-700 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/20 rounded-lg p-6 border border-red-700">
        <p className="text-red-400">Error: {error}</p>
        <button 
          onClick={loadData}
          className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Debug Info */}
      <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
        <h3 className="text-lg font-bold text-white mb-4">🔧 Debug Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <h4 className="font-semibold text-blue-400 mb-2">Current Credits</h4>
            <pre className="bg-gray-800 p-2 rounded text-gray-300 overflow-x-auto">
              {JSON.stringify(credits, null, 2)}
            </pre>
          </div>
          <div>
            <h4 className="font-semibold text-green-400 mb-2">Usage Limits</h4>
            <pre className="bg-gray-800 p-2 rounded text-gray-300 overflow-x-auto">
              {JSON.stringify(usageLimits, null, 2)}
            </pre>
          </div>
          <div>
            <h4 className="font-semibold text-purple-400 mb-2">Available Packages</h4>
            <pre className="bg-gray-800 p-2 rounded text-gray-300 overflow-x-auto">
              {JSON.stringify(Object.keys(packages), null, 2)}
            </pre>
          </div>
        </div>
      </div>

      {/* Credit Actions */}
      <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
        <h3 className="text-lg font-bold text-white mb-4">💳 Credit Actions</h3>
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => handleUseCredit('resume_contact')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            Use Resume Contact Credit
          </button>
          <button 
            onClick={() => handleUseCredit('ai_credit')}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg"
          >
            Use AI Credit
          </button>
          <button 
            onClick={loadData}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
          >
            Refresh Data
          </button>
        </div>
      </div>

      {/* Credit Packages */}
      {Object.entries(packages).map(([type, typePackages]) => (
        <div key={type} className="bg-gray-900 rounded-lg p-4 border border-gray-700">
          <h3 className="text-lg font-bold text-white mb-4 capitalize">
            {type.replace('_', ' ')} Packages
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {typePackages.map((pkg) => (
              <div key={pkg.id} className="bg-gray-800 rounded-lg p-4 border border-gray-600">
                <h4 className="font-semibold text-white mb-2">{pkg.name}</h4>
                <p className="text-gray-400 text-sm mb-3">{pkg.description}</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Credits:</span>
                    <span className="text-white">{pkg.creditAmount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Bonus:</span>
                    <span className="text-green-400">+{pkg.bonusCredits}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Price:</span>
                    <span className="text-yellow-400">₱{pkg.price}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Per Credit:</span>
                    <span className="text-blue-400">₱{pkg.pricePerCredit.toFixed(2)}</span>
                  </div>
                  {pkg.validityDays && (
                    <div className="flex justify-between">
                      <span className="text-gray-300">Validity:</span>
                      <span className="text-purple-400">{pkg.validityDays} days</span>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => handlePurchasePackage(pkg.id)}
                  className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition-colors"
                >
                  Purchase Package
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Bundle Packages */}
      {packages.bundle && (
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
          <h3 className="text-lg font-bold text-white mb-4">🎁 Bundle Packages</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {packages.bundle.map((pkg) => (
              <div key={pkg.id} className="bg-gray-800 rounded-lg p-4 border border-gray-600">
                <h4 className="font-semibold text-white mb-2">{pkg.name}</h4>
                <p className="text-gray-400 text-sm mb-3">{pkg.description}</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Price:</span>
                    <span className="text-yellow-400">₱{pkg.price}</span>
                  </div>
                  {pkg.bundleConfig && (
                    <div className="bg-gray-700 rounded p-2 mt-2">
                      <span className="text-gray-300 text-xs">Bundle Includes:</span>
                      {Object.entries(pkg.bundleConfig).map(([creditType, amount]) => (
                        <div key={creditType} className="flex justify-between text-xs">
                          <span className="text-gray-400 capitalize">{creditType.replace('_', ' ')}:</span>
                          <span className="text-white">{amount}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => handlePurchasePackage(pkg.id)}
                  className="w-full mt-4 bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg transition-colors"
                >
                  Purchase Bundle
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
