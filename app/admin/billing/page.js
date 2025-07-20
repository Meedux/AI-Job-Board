'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import Header from '@/components/Header';

export default function BillingPage() {
  const { user, loading } = useAuth();
  const { subscription, loadUserData } = useSubscription();
  const [mounted, setMounted] = useState(false);
  const [billingHistory, setBillingHistory] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (user && ['employer_admin', 'super_admin'].includes(user.role)) {
      loadBillingData();
      loadUserData();
    }
  }, [user]);

  const loadBillingData = async () => {
    try {
      const [historyResponse, methodsResponse] = await Promise.all([
        fetch('/api/admin/billing/history'),
        fetch('/api/admin/billing/payment-methods')
      ]);

      if (historyResponse.ok) {
        const historyData = await historyResponse.json();
        setBillingHistory(historyData.history || []);
      }

      if (methodsResponse.ok) {
        const methodsData = await methodsResponse.json();
        setPaymentMethods(methodsData.methods || []);
      }
    } catch (error) {
      console.error('Error loading billing data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const cancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your subscription? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch('/api/admin/billing/cancel-subscription', {
        method: 'POST',
      });

      if (response.ok) {
        alert('Subscription cancelled successfully');
        loadUserData();
      } else {
        const error = await response.json();
        alert(`Error: ${error.message || 'Failed to cancel subscription'}`);
      }
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      alert('Error cancelling subscription. Please try again.');
    }
  };

  const addPaymentMethod = async () => {
    // This would typically open a payment modal or redirect to a secure payment form
    alert('Payment method addition would be implemented with your payment processor');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount / 100); // Assuming amount is in cents
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      active: 'bg-green-900 text-green-300',
      cancelled: 'bg-red-900 text-red-300',
      past_due: 'bg-yellow-900 text-yellow-300',
      unpaid: 'bg-red-900 text-red-300',
      paid: 'bg-green-900 text-green-300',
      pending: 'bg-yellow-900 text-yellow-300',
      failed: 'bg-red-900 text-red-300'
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[status] || 'bg-gray-900 text-gray-300'}`}>
        {status.replace('_', ' ').toUpperCase()}
      </span>
    );
  };

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
            <p className="text-gray-300">You need employer admin privileges to access billing.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="bg-gray-900 text-white pt-16 min-h-screen">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Billing & Payments</h1>
            <p className="text-gray-300">Manage your subscription and payment information</p>
          </div>

          {/* Tabs */}
          <div className="mb-8">
            <nav className="flex space-x-8">
              {[
                { id: 'overview', name: 'Overview' },
                { id: 'history', name: 'Billing History' },
                { id: 'methods', name: 'Payment Methods' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-400'
                      : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
                  }`}
                >
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Current Subscription */}
              <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                <h2 className="text-xl font-semibold text-white mb-4">Current Subscription</h2>
                {subscription ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-gray-400 text-sm">Plan</p>
                      <p className="text-white text-lg font-medium">{subscription.plan_name || 'Free Plan'}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Status</p>
                      <div className="mt-1">
                        {getStatusBadge(subscription.status || 'active')}
                      </div>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Next Billing Date</p>
                      <p className="text-white">
                        {subscription.current_period_end 
                          ? formatDate(subscription.current_period_end)
                          : 'N/A'
                        }
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Amount</p>
                      <p className="text-white text-lg font-medium">
                        {subscription.amount ? formatAmount(subscription.amount) : '$0.00'}/month
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-400">No active subscription</p>
                    <button className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                      Upgrade Plan
                    </button>
                  </div>
                )}
                
                {subscription && subscription.status === 'active' && (
                  <div className="mt-6 pt-6 border-t border-gray-700">
                    <button
                      onClick={cancelSubscription}
                      className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                    >
                      Cancel Subscription
                    </button>
                  </div>
                )}
              </div>

              {/* Usage Summary */}
              <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                <h2 className="text-xl font-semibold text-white mb-4">Current Usage</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400">5</div>
                    <p className="text-gray-400 text-sm">Active Job Posts</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">147</div>
                    <p className="text-gray-400 text-sm">Resume Views</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-400">23</div>
                    <p className="text-gray-400 text-sm">AI Operations</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Billing History Tab */}
          {activeTab === 'history' && (
            <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-700">
                <h2 className="text-lg font-semibold text-white">Billing History</h2>
              </div>

              {isLoading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <p className="text-gray-400">Loading billing history...</p>
                </div>
              ) : billingHistory.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-gray-400">No billing history available</p>
                </div>
              ) : (
                <div className="max-h-96 overflow-y-auto">
                  <table className="w-full">
                    <thead className="bg-gray-700 sticky top-0">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Description
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Invoice
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                      {billingHistory.map((transaction, index) => (
                        <tr key={index} className="hover:bg-gray-700/50">
                          <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                            {formatDate(transaction.date)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-white">
                            {transaction.description}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-white font-medium">
                            {formatAmount(transaction.amount)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(transaction.status)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {transaction.invoice_url ? (
                              <a
                                href={transaction.invoice_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-400 hover:text-blue-300"
                              >
                                Download
                              </a>
                            ) : (
                              <span className="text-gray-500">N/A</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Payment Methods Tab */}
          {activeTab === 'methods' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-white">Payment Methods</h2>
                <button
                  onClick={addPaymentMethod}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Add Payment Method
                </button>
              </div>

              {paymentMethods.length === 0 ? (
                <div className="bg-gray-800 p-8 rounded-lg border border-gray-700 text-center">
                  <p className="text-gray-400 mb-4">No payment methods on file</p>
                  <button
                    onClick={addPaymentMethod}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    Add Your First Payment Method
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {paymentMethods.map((method, index) => (
                    <div key={index} className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-8 bg-gray-700 rounded flex items-center justify-center">
                            <span className="text-gray-300 text-xs">****</span>
                          </div>
                          <div>
                            <p className="text-white font-medium">
                              **** **** **** {method.last4}
                            </p>
                            <p className="text-gray-400 text-sm">
                              {method.brand} • Expires {method.exp_month}/{method.exp_year}
                            </p>
                            {method.is_default && (
                              <span className="text-green-400 text-xs">Default</span>
                            )}
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          {!method.is_default && (
                            <button className="text-blue-400 hover:text-blue-300 text-sm">
                              Make Default
                            </button>
                          )}
                          <button className="text-red-400 hover:text-red-300 text-sm">
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
