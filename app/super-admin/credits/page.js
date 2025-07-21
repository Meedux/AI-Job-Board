'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import ProtectedRoute from '../../../components/ProtectedRoute';
import { 
  CreditCard, 
  Plus, 
  Edit, 
  Trash2, 
  ArrowLeft, 
  X,
  Zap,
  Star,
  Gift,
  Trophy,
  DollarSign,
  Calendar,
  Users,
  Eye
} from 'lucide-react';

export default function CreditManagement() {
  const { user } = useAuth();
  const router = useRouter();
  const [creditPackages, setCreditPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    creditType: 'ai_credit',
    amount: '',
    price: '',
    bonusAmount: '',
    isPopular: false,
    isActive: true,
    expiryDays: '',
    features: []
  });
  const [newFeature, setNewFeature] = useState('');

  useEffect(() => {
    if (user && user.role !== 'super_admin') {
      router.push('/dashboard');
    } else if (user) {
      loadCreditPackages();
    }
  }, [user, router]);

  const loadCreditPackages = async () => {
    try {
      const response = await fetch('/api/super-admin/credit-packages', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setCreditPackages(data.packages);
        }
      } else {
        const data = await response.json();
        console.error('Credit packages API Error:', data.error);
      }
    } catch (error) {
      console.error('Error loading credit packages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const method = editingPackage ? 'PUT' : 'POST';
      const url = editingPackage 
        ? `/api/super-admin/credit-packages/${editingPackage.id}` 
        : '/api/super-admin/credit-packages';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          amount: parseInt(formData.amount) || 0,
          price: parseFloat(formData.price) || 0,
          bonusAmount: parseInt(formData.bonusAmount) || 0,
          expiryDays: parseInt(formData.expiryDays) || 0,
        }),
      });

      if (response.ok) {
        setShowModal(false);
        setEditingPackage(null);
        resetForm();
        loadCreditPackages();
      }
    } catch (error) {
      console.error('Error saving credit package:', error);
    }
  };

  const handleDelete = async (packageId) => {
    if (!confirm('Are you sure you want to delete this credit package?')) return;
    
    try {
      const response = await fetch(`/api/super-admin/credit-packages/${packageId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        loadCreditPackages();
      }
    } catch (error) {
      console.error('Error deleting credit package:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      creditType: 'ai_credit',
      amount: '',
      price: '',
      bonusAmount: '',
      isPopular: false,
      isActive: true,
      expiryDays: '',
      features: []
    });
  };

  const handleEdit = (pkg) => {
    setEditingPackage(pkg);
    setFormData({
      name: pkg.name || '',
      description: pkg.description || '',
      creditType: pkg.creditType || 'ai_credit',
      amount: pkg.creditAmount?.toString() || '',
      price: pkg.price?.toString() || '',
      bonusAmount: pkg.bonusCredits?.toString() || '',
      isPopular: pkg.bundleConfig?.isPopular || false,
      isActive: pkg.isActive !== false,
      expiryDays: pkg.validityDays?.toString() || '',
      features: Array.isArray(pkg.bundleConfig?.features) ? pkg.bundleConfig.features : []
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

  const getCreditTypeIcon = (creditType) => {
    switch (creditType) {
      case 'ai_credit': return Zap;
      case 'job_posting': return Star;
      case 'resume_view': return Eye;
      default: return CreditCard;
    }
  };

  const getCreditTypeColor = (creditType) => {
    switch (creditType) {
      case 'ai_credit': return 'from-yellow-600 to-orange-600';
      case 'job_posting': return 'from-blue-600 to-purple-600';
      case 'resume_view': return 'from-green-600 to-teal-600';
      default: return 'from-gray-600 to-gray-700';
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
                    Credit Package Management
                  </h1>
                  <p className="text-gray-400">Create and manage credit packages for users</p>
                </div>
              </div>
              
              <button
                onClick={() => {
                  resetForm();
                  setEditingPackage(null);
                  setShowModal(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add New Package
              </button>
            </div>

            {/* Credit Packages Grid */}
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="text-gray-400">Loading credit packages...</div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {creditPackages.map((pkg) => {
                  const CreditIcon = getCreditTypeIcon(pkg.creditType);
                  const totalCredits = pkg.creditAmount + (pkg.bonusCredits || 0);
                  const isPopular = pkg.bundleConfig?.isPopular || false;
                  const features = pkg.bundleConfig?.features || [];
                  
                  return (
                    <div
                      key={pkg.id}
                      className={`bg-gray-800/50 rounded-xl p-6 border border-gray-700/50 relative group ${
                        isPopular ? 'ring-2 ring-yellow-500/50' : ''
                      }`}
                    >
                      {/* Popular Badge */}
                      {isPopular && (
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                          <div className="bg-yellow-500 text-black px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                            <Star className="w-3 h-3" />
                            POPULAR
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                        <button
                          onClick={() => handleEdit(pkg)}
                          className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(pkg.id)}
                          className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Package Header */}
                      <div className="flex items-center gap-3 mb-4">
                        <div className={`w-12 h-12 bg-gradient-to-r ${getCreditTypeColor(pkg.creditType)} rounded-lg flex items-center justify-center`}>
                          <CreditIcon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-white">{pkg.name}</h3>
                          <p className="text-gray-400 text-sm capitalize">{pkg.creditType.replace('_', ' ')}</p>
                        </div>
                      </div>

                      {/* Pricing */}
                      <div className="mb-4">
                        <div className="flex items-baseline gap-2">
                          <span className="text-3xl font-bold text-white">₱{pkg.price}</span>
                          <span className="text-gray-400">for {totalCredits} credits</span>
                        </div>
                        <div className="text-sm text-gray-400">
                          ₱{(pkg.price / totalCredits).toFixed(2)} per credit
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-gray-300 text-sm mb-4">{pkg.description}</p>

                      {/* Credit Breakdown */}
                      <div className="space-y-2 text-sm mb-4">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Base Credits:</span>
                          <span className="text-white font-medium">{pkg.creditAmount}</span>
                        </div>
                        {pkg.bonusCredits > 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-400">Bonus Credits:</span>
                            <span className="text-green-400 font-medium">+{pkg.bonusCredits}</span>
                          </div>
                        )}
                        <div className="flex justify-between border-t border-gray-700 pt-2">
                          <span className="text-gray-300 font-medium">Total Credits:</span>
                          <span className="text-white font-bold">{totalCredits}</span>
                        </div>
                        
                        {pkg.validityDays > 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-400">Expires in:</span>
                            <span className="text-yellow-400">{pkg.validityDays} days</span>
                          </div>
                        )}
                      </div>

                      {/* Features */}
                      {features && features.length > 0 && (
                        <div className="space-y-1 text-sm">
                          {features.map((feature, index) => (
                            <div key={index} className="flex items-center gap-2 text-blue-400">
                              <div className="w-1 h-1 bg-blue-400 rounded-full" />
                              <span>{feature}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Status */}
                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-700">
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                          pkg.isActive 
                            ? 'bg-green-600/20 text-green-400' 
                            : 'bg-gray-600/20 text-gray-400'
                        }`}>
                          {pkg.isActive ? 'Active' : 'Inactive'}
                        </div>
                        
                        {pkg.bonusCredits > 0 && (
                          <div className="flex items-center gap-1 text-xs text-yellow-400">
                            <Gift className="w-3 h-3" />
                            Bonus Included
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
                      {editingPackage ? 'Edit Credit Package' : 'Create New Credit Package'}
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
                          Package Name *
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
                          Credit Type *
                        </label>
                        <select
                          value={formData.creditType}
                          onChange={(e) => setFormData(prev => ({ ...prev, creditType: e.target.value }))}
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="ai_credit">AI Credit</option>
                          <option value="job_posting">Job Posting</option>
                          <option value="resume_view">Resume View</option>
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
                        placeholder="Brief description of the package..."
                      />
                    </div>

                    {/* Credit & Pricing */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Base Credits *
                        </label>
                        <input
                          type="number"
                          value={formData.amount}
                          onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Bonus Credits
                        </label>
                        <input
                          type="number"
                          value={formData.bonusAmount}
                          onChange={(e) => setFormData(prev => ({ ...prev, bonusAmount: e.target.value }))}
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Price (₱) *
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={formData.price}
                          onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Expiry Days (0 = Never)
                        </label>
                        <input
                          type="number"
                          value={formData.expiryDays}
                          onChange={(e) => setFormData(prev => ({ ...prev, expiryDays: e.target.value }))}
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    {/* Options */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={formData.isPopular}
                          onChange={(e) => setFormData(prev => ({ ...prev, isPopular: e.target.checked }))}
                          className="w-4 h-4 text-yellow-600 bg-gray-700 border-gray-600 rounded focus:ring-yellow-500"
                        />
                        <span className="text-gray-300">Mark as Popular</span>
                      </label>
                      
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={formData.isActive}
                          onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                          className="w-4 h-4 text-green-600 bg-gray-700 border-gray-600 rounded focus:ring-green-500"
                        />
                        <span className="text-gray-300">Active Package</span>
                      </label>
                    </div>

                    {/* Features */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Package Features
                      </label>
                      <div className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={newFeature}
                          onChange={(e) => setNewFeature(e.target.value)}
                          className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Add a feature..."
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
                        {editingPackage ? 'Update Package' : 'Create Package'}
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
