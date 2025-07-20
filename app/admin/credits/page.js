'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { USER_ROLES, getAvailableCredits } from '@/utils/roleSystem';
import Header from '@/components/Header';

export default function CreditsPage() {
  const { user, loading } = useAuth();
  const { subscription, credits, loadUserData } = useSubscription();
  const [mounted, setMounted] = useState(false);
  const [creditHistory, setCreditHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (user && ['employer_admin', 'super_admin'].includes(user.role)) {
      loadCreditHistory();
      loadUserData();
    }
  }, [user]);

  const loadCreditHistory = async () => {
    try {
      const response = await fetch('/api/admin/credits/history');
      if (response.ok) {
        const data = await response.json();
        setCreditHistory(data.history || []);
      }
    } catch (error) {
      console.error('Error loading credit history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const purchaseCredits = async (package_type, amount) => {
    try {
      const response = await fetch('/api/admin/credits/purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          package_type,
          amount
        }),
      });

      if (response.ok) {
        const result = await response.json();
        alert('Credits purchased successfully!');
        loadUserData();
        loadCreditHistory();
      } else {
        const error = await response.json();
        alert(`Error: ${error.message || 'Failed to purchase credits'}`);
      }
    } catch (error) {
      console.error('Error purchasing credits:', error);
      alert('Error purchasing credits. Please try again.');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'purchase':
        return '💳';
      case 'usage':
        return '📄';
      case 'refund':
        return '↩️';
      case 'bonus':
        return '🎁';
      default:
        return '💰';
    }
  };

  const creditPackages = [
    {
      id: 'resume_basic',
      name: 'Resume Credits - Basic',
      type: 'resume',
      credits: 10,
      price: 9.99,
      description: 'Access 10 resume views'
    },
    {
      id: 'resume_pro',
      name: 'Resume Credits - Pro',
      type: 'resume',
      credits: 50,
      price: 39.99,
      description: 'Access 50 resume views (20% savings)'
    },
    {
      id: 'ai_basic',
      name: 'AI Credits - Basic',
      type: 'ai',
      credits: 100,
      price: 19.99,
      description: '100 AI-powered operations'
    },
    {
      id: 'ai_pro',
      name: 'AI Credits - Pro',
      type: 'ai',
      credits: 500,
      price: 79.99,
      description: '500 AI-powered operations (20% savings)'
    }
  ];

  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="bg-gray-900 flex items-center justify-center pt-16 min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
            <p className="text-gray-300">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user || !['employer_admin', 'super_admin'].includes(user.role)) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="bg-gray-900 flex items-center justify-center pt-16 min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-4">Access Denied</h1>
            <p className="text-gray-300">You need employer admin privileges to manage credits.</p>
          </div>
        </div>
      </div>
    );
  }

  const availableResumeCredits = getAvailableCredits(user, 'resume');
  const availableAiCredits = getAvailableCredits(user, 'ai');

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="bg-gray-900 text-white pt-16 min-h-screen">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Credits Management</h1>
            <p className="text-gray-300">Manage your credits for resume access and AI features</p>
          </div>

          {/* Current Balance */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-900 rounded-lg flex items-center justify-center">
                  <span className="text-blue-300 text-xl">📄</span>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Resume Credits</p>
                  <p className="text-white text-2xl font-bold">{availableResumeCredits}</p>
                  <p className="text-gray-400 text-sm">Available for resume access</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-purple-900 rounded-lg flex items-center justify-center">
                  <span className="text-purple-300 text-xl">🤖</span>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">AI Credits</p>
                  <p className="text-white text-2xl font-bold">{availableAiCredits}</p>
                  <p className="text-gray-400 text-sm">Available for AI features</p>
                </div>
              </div>
            </div>
          </div>

          {/* Credit Packages */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">Purchase Credits</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {creditPackages.map((pkg) => (
                <div key={pkg.id} className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-white mb-2">{pkg.name}</h3>
                    <div className="text-3xl font-bold text-blue-400 mb-2">
                      {pkg.credits}
                    </div>
                    <p className="text-gray-400 text-sm mb-4">{pkg.description}</p>
                    <div className="text-2xl font-bold text-white mb-4">
                      ${pkg.price}
                    </div>
                    <button
                      onClick={() => purchaseCredits(pkg.type, pkg.credits)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                    >
                      Purchase
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Credit History */}
          <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-700">
              <h2 className="text-lg font-semibold text-white">Credit History</h2>
            </div>

            {isLoading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-gray-400">Loading credit history...</p>
              </div>
            ) : creditHistory.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-gray-400">No credit transactions yet</p>
              </div>
            ) : (
              <div className="max-h-96 overflow-y-auto">
                <table className="w-full">
                  <thead className="bg-gray-700 sticky top-0">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Credits
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Balance
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {creditHistory.map((transaction, index) => (
                      <tr key={index} className="hover:bg-gray-700/50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <span className="text-lg">{getTransactionIcon(transaction.type)}</span>
                            <span className="text-white capitalize">{transaction.type}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                          {transaction.description}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`font-medium ${
                            transaction.amount > 0 ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {transaction.amount > 0 ? '+' : ''}{transaction.amount}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                          {transaction.balance}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                          {formatDate(transaction.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
