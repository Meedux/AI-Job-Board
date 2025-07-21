'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import ProtectedRoute from '../../../components/ProtectedRoute';
import { 
  DollarSign, 
  Plus, 
  Edit, 
  Trash2, 
  ArrowLeft, 
  Check, 
  X,
  Crown,
  Users,
  Star
} from 'lucide-react';

export default function PricingManagement() {
  const { user } = useAuth();
  const router = useRouter();
  const [pricingTiers, setPricingTiers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTier, setEditingTier] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    planType: 'basic',
    priceMonthly: '',
    priceYearly: '',
    maxJobPostings: '',
    maxFeaturedJobs: '',
    maxResumeViews: '',
    maxDirectApplications: '',
    maxAiCredits: '',
    maxAiJobMatches: '',
    prioritySupport: false,
    advancedAnalytics: false,
    customBranding: false,
    trialDays: '',
    features: []
  });
  const [newFeature, setNewFeature] = useState('');

  useEffect(() => {
    if (user && user.role !== 'super_admin') {
      router.push('/dashboard');
    } else if (user) {
      loadPricingTiers();
    }
  }, [user, router]);

  const loadPricingTiers = async () => {
    try {
      const response = await fetch('/api/super-admin/pricing', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setPricingTiers(data.tiers);
        }
      }
    } catch (error) {
      console.error('Error loading pricing tiers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const method = editingTier ? 'PUT' : 'POST';
      const url = editingTier 
        ? `/api/super-admin/pricing/${editingTier.id}` 
        : '/api/super-admin/pricing';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          priceMonthly: parseFloat(formData.priceMonthly) || 0,
          priceYearly: parseFloat(formData.priceYearly) || 0,
          maxJobPostings: parseInt(formData.maxJobPostings) || 0,
          maxFeaturedJobs: parseInt(formData.maxFeaturedJobs) || 0,
          maxResumeViews: parseInt(formData.maxResumeViews) || 0,
          maxDirectApplications: parseInt(formData.maxDirectApplications) || 0,
          maxAiCredits: parseInt(formData.maxAiCredits) || 0,
          maxAiJobMatches: parseInt(formData.maxAiJobMatches) || 0,
          trialDays: parseInt(formData.trialDays) || 0,
        }),
      });

      if (response.ok) {
        setShowModal(false);
        setEditingTier(null);
        resetForm();
        loadPricingTiers();
      }
    } catch (error) {
      console.error('Error saving pricing tier:', error);
    }
  };

  const handleDelete = async (tierId) => {
    if (!confirm('Are you sure you want to delete this pricing tier?')) return;
    
    try {
      const response = await fetch(`/api/super-admin/pricing/${tierId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        loadPricingTiers();
      }
    } catch (error) {
      console.error('Error deleting pricing tier:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      planType: 'basic',
      priceMonthly: '',
      priceYearly: '',
      maxJobPostings: '',
      maxFeaturedJobs: '',
      maxResumeViews: '',
      maxDirectApplications: '',
      maxAiCredits: '',
      maxAiJobMatches: '',
      prioritySupport: false,
      advancedAnalytics: false,
      customBranding: false,
      trialDays: '',
      features: []
    });
  };

  const handleEdit = (tier) => {
    setEditingTier(tier);
    setFormData({
      name: tier.name || '',
      description: tier.description || '',
      planType: tier.planType || 'basic',
      priceMonthly: tier.priceMonthly?.toString() || '',
      priceYearly: tier.priceYearly?.toString() || '',
      maxJobPostings: tier.maxJobPostings?.toString() || '',
      maxFeaturedJobs: tier.maxFeaturedJobs?.toString() || '',
      maxResumeViews: tier.maxResumeViews?.toString() || '',
      maxDirectApplications: tier.maxDirectApplications?.toString() || '',
      maxAiCredits: tier.maxAiCredits?.toString() || '',
      maxAiJobMatches: tier.maxAiJobMatches?.toString() || '',
      prioritySupport: tier.prioritySupport || false,
      advancedAnalytics: tier.advancedAnalytics || false,
      customBranding: tier.customBranding || false,
      trialDays: tier.trialDays?.toString() || '',
      features: Array.isArray(tier.features) ? tier.features : []
    });
    setShowModal(true);
  };

  const addFeature = () => {
    if (newFeature.trim()) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, newFeature.trim()]
      }));
      setNewFeature('');
    }
  };

  const removeFeature = (index) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  const getPlanIcon = (planType) => {
    switch (planType) {
      case 'free': return Users;
      case 'premium': return Crown;
      case 'enterprise': return Star;
      default: return DollarSign;
    }
  };

  if (!user || user.role !== 'super_admin') {
    return <div className="min-h-screen bg-gray-950" />;
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-950 text-white">
        <Header />
        
        <main className="pt-20 pb-16">
          <div className="max-w-7xl mx-auto px-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => router.push('/super-admin')}
                  className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                    Pricing Tiers Management
                  </h1>
                  <p className="text-gray-400">Create and manage subscription plans</p>
                </div>
              </div>
              
              <button
                onClick={() => {
                  resetForm();
                  setEditingTier(null);
                  setShowModal(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add New Tier
              </button>
            </div>

            {/* Pricing Tiers Grid */}
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="text-gray-400">Loading pricing tiers...</div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pricingTiers.map((tier) => {
                  const PlanIcon = getPlanIcon(tier.planType);
                  return (
                    <div
                      key={tier.id}
                      className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50 relative group"
                    >
                      {/* Action Buttons */}
                      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                        <button
                          onClick={() => handleEdit(tier)}
                          className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(tier.id)}
                          className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Plan Header */}
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-blue-600 rounded-lg flex items-center justify-center">
                          <PlanIcon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-white">{tier.name}</h3>
                          <p className="text-gray-400 text-sm capitalize">{tier.planType}</p>
                        </div>
                      </div>

                      {/* Pricing */}
                      <div className="mb-4">
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-bold text-white">₱{tier.priceMonthly}</span>
                          <span className="text-gray-400">/month</span>
                        </div>
                        {tier.priceYearly > 0 && (
                          <div className="text-sm text-gray-400">
                            ₱{tier.priceYearly}/year (Save {Math.round((1 - (tier.priceYearly / (tier.priceMonthly * 12))) * 100)}%)
                          </div>
                        )}
                      </div>

                      {/* Description */}
                      <p className="text-gray-300 text-sm mb-4">{tier.description}</p>

                      {/* Features */}
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Job Postings:</span>
                          <span className="text-white">{tier.maxJobPostings === -1 ? 'Unlimited' : tier.maxJobPostings}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Featured Jobs:</span>
                          <span className="text-white">{tier.maxFeaturedJobs === -1 ? 'Unlimited' : tier.maxFeaturedJobs}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Resume Views:</span>
                          <span className="text-white">{tier.maxResumeViews === -1 ? 'Unlimited' : tier.maxResumeViews}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">AI Credits:</span>
                          <span className="text-white">{tier.maxAiCredits === -1 ? 'Unlimited' : tier.maxAiCredits}</span>
                        </div>
                        
                        {/* Boolean Features */}
                        <div className="pt-2 border-t border-gray-700">
                          {tier.prioritySupport && (
                            <div className="flex items-center gap-2 text-green-400">
                              <Check className="w-4 h-4" />
                              <span>Priority Support</span>
                            </div>
                          )}
                          {tier.advancedAnalytics && (
                            <div className="flex items-center gap-2 text-green-400">
                              <Check className="w-4 h-4" />
                              <span>Advanced Analytics</span>
                            </div>
                          )}
                          {tier.customBranding && (
                            <div className="flex items-center gap-2 text-green-400">
                              <Check className="w-4 h-4" />
                              <span>Custom Branding</span>
                            </div>
                          )}
                        </div>

                        {/* Custom Features */}
                        {tier.features && tier.features.length > 0 && (
                          <div className="pt-2 border-t border-gray-700">
                            {tier.features.map((feature, index) => (
                              <div key={index} className="flex items-center gap-2 text-blue-400">
                                <Check className="w-4 h-4" />
                                <span>{feature}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Modal */}
            {showModal && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-gray-800 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-white">
                      {editingTier ? 'Edit Pricing Tier' : 'Create New Pricing Tier'}
                    </h2>
                    <button
                      onClick={() => setShowModal(false)}
                      className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5 text-gray-400" />
                    </button>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Basic Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Plan Name *
                        </label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Plan Type *
                        </label>
                        <select
                          value={formData.planType}
                          onChange={(e) => setFormData(prev => ({ ...prev, planType: e.target.value }))}
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="free">Free</option>
                          <option value="basic">Basic</option>
                          <option value="premium">Premium</option>
                          <option value="enterprise">Enterprise</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Description
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 h-20 resize-none"
                        placeholder="Brief description of the plan..."
                      />
                    </div>

                    {/* Pricing */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Monthly Price (₱)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={formData.priceMonthly}
                          onChange={(e) => setFormData(prev => ({ ...prev, priceMonthly: e.target.value }))}
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Yearly Price (₱)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={formData.priceYearly}
                          onChange={(e) => setFormData(prev => ({ ...prev, priceYearly: e.target.value }))}
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Trial Days
                        </label>
                        <input
                          type="number"
                          value={formData.trialDays}
                          onChange={(e) => setFormData(prev => ({ ...prev, trialDays: e.target.value }))}
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    {/* Limits */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Job Postings (-1 = Unlimited)
                        </label>
                        <input
                          type="number"
                          value={formData.maxJobPostings}
                          onChange={(e) => setFormData(prev => ({ ...prev, maxJobPostings: e.target.value }))}
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Featured Jobs
                        </label>
                        <input
                          type="number"
                          value={formData.maxFeaturedJobs}
                          onChange={(e) => setFormData(prev => ({ ...prev, maxFeaturedJobs: e.target.value }))}
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Resume Views
                        </label>
                        <input
                          type="number"
                          value={formData.maxResumeViews}
                          onChange={(e) => setFormData(prev => ({ ...prev, maxResumeViews: e.target.value }))}
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Direct Applications
                        </label>
                        <input
                          type="number"
                          value={formData.maxDirectApplications}
                          onChange={(e) => setFormData(prev => ({ ...prev, maxDirectApplications: e.target.value }))}
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          AI Credits
                        </label>
                        <input
                          type="number"
                          value={formData.maxAiCredits}
                          onChange={(e) => setFormData(prev => ({ ...prev, maxAiCredits: e.target.value }))}
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          AI Job Matches
                        </label>
                        <input
                          type="number"
                          value={formData.maxAiJobMatches}
                          onChange={(e) => setFormData(prev => ({ ...prev, maxAiJobMatches: e.target.value }))}
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    {/* Boolean Features */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={formData.prioritySupport}
                          onChange={(e) => setFormData(prev => ({ ...prev, prioritySupport: e.target.checked }))}
                          className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                        />
                        <span className="text-gray-300">Priority Support</span>
                      </label>
                      
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={formData.advancedAnalytics}
                          onChange={(e) => setFormData(prev => ({ ...prev, advancedAnalytics: e.target.checked }))}
                          className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                        />
                        <span className="text-gray-300">Advanced Analytics</span>
                      </label>
                      
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={formData.customBranding}
                          onChange={(e) => setFormData(prev => ({ ...prev, customBranding: e.target.checked }))}
                          className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                        />
                        <span className="text-gray-300">Custom Branding</span>
                      </label>
                    </div>

                    {/* Custom Features */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Custom Features
                      </label>
                      <div className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={newFeature}
                          onChange={(e) => setNewFeature(e.target.value)}
                          className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Add a custom feature..."
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                        />
                        <button
                          type="button"
                          onClick={addFeature}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                        >
                          Add
                        </button>
                      </div>
                      
                      {/* Features List */}
                      {formData.features.length > 0 && (
                        <div className="space-y-2 max-h-32 overflow-y-auto">
                          {formData.features.map((feature, index) => (
                            <div key={index} className="flex items-center justify-between bg-gray-700 px-3 py-2 rounded">
                              <span className="text-white">{feature}</span>
                              <button
                                type="button"
                                onClick={() => removeFeature(index)}
                                className="text-red-400 hover:text-red-300"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Submit Buttons */}
                    <div className="flex gap-3 pt-4">
                      <button
                        type="submit"
                        className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                      >
                        {editingTier ? 'Update Tier' : 'Create Tier'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowModal(false)}
                        className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        </main>
        
        <Footer />
      </div>
    </ProtectedRoute>
  );
}
