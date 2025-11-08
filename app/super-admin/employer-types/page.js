'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import ProtectedRoute from '../../../components/ProtectedRoute';
import {
  Building2,
  Plus,
  Edit,
  Trash2,
  Eye,
  Search,
  Filter,
  ArrowLeft,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react';

export default function EmployerTypesManagement() {
  const router = useRouter();
  const [employerTypes, setEmployerTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterType, setFilterType] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingType, setEditingType] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    label: '',
    category: '',
    type: '',
    subtype: '',
    description: '',
    isActive: true
  });

  useEffect(() => {
    loadEmployerTypes();
  }, []);

  const loadEmployerTypes = async () => {
    try {
      const response = await fetch('/api/super-admin/employer-types', {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setEmployerTypes(data.employerTypes);
        }
      }
    } catch (error) {
      console.error('Error loading employer types:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const url = editingType
        ? `/api/super-admin/employer-types/${editingType.id}`
        : '/api/super-admin/employer-types';

      const method = editingType ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        await loadEmployerTypes();
        setShowAddModal(false);
        setEditingType(null);
        resetForm();
      }
    } catch (error) {
      console.error('Error saving employer type:', error);
    }
  };

  const handleEdit = (employerType) => {
    setEditingType(employerType);
    setFormData({
      code: employerType.code,
      label: employerType.label,
      category: employerType.category,
      type: employerType.type,
      subtype: employerType.subtype || '',
      description: employerType.description || '',
      isActive: employerType.isActive
    });
    setShowAddModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this employer type?')) return;

    try {
      const response = await fetch(`/api/super-admin/employer-types/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        await loadEmployerTypes();
      }
    } catch (error) {
      console.error('Error deleting employer type:', error);
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    try {
      const response = await fetch(`/api/super-admin/employer-types/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ isActive: !currentStatus })
      });

      if (response.ok) {
        await loadEmployerTypes();
      }
    } catch (error) {
      console.error('Error toggling status:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      label: '',
      category: '',
      type: '',
      subtype: '',
      description: '',
      isActive: true
    });
  };

  const filteredTypes = employerTypes.filter(type => {
    const matchesSearch = type.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         type.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !filterCategory || type.category === filterCategory;
    const matchesType = !filterType || type.type === filterType;

    return matchesSearch && matchesCategory && matchesType;
  });

  const getCategoryColor = (category) => {
    switch (category) {
      case 'local': return 'bg-green-100 text-green-800';
      case 'abroad': return 'bg-blue-100 text-blue-800';
      case 'both': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'direct': return 'bg-orange-100 text-orange-800';
      case 'agency': return 'bg-red-100 text-red-800';
      case 'sub_agency': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-950 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading employer types...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-950 text-white">
        <Header />

        <main className="pt-20 pb-16">
          <div className="max-w-7xl mx-auto px-4">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-4">
                <button
                  onClick={() => router.push('/super-admin')}
                  className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                >
                  <ArrowLeft size={20} />
                  Back to Dashboard
                </button>
              </div>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-indigo-600/20 border border-indigo-500/30 rounded-lg flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-indigo-400" />
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                    Employer Types Management
                  </h1>
                  <p className="text-gray-400">Manage employer type categories and classifications</p>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <div className="flex items-center gap-3">
                  <Building2 className="w-8 h-8 text-blue-400" />
                  <div>
                    <p className="text-2xl font-bold text-white">{employerTypes.length}</p>
                    <p className="text-sm text-gray-400">Total Types</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-8 h-8 text-green-400" />
                  <div>
                    <p className="text-2xl font-bold text-white">
                      {employerTypes.filter(t => t.isActive).length}
                    </p>
                    <p className="text-sm text-gray-400">Active Types</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <div className="flex items-center gap-3">
                  <Eye className="w-8 h-8 text-purple-400" />
                  <div>
                    <p className="text-2xl font-bold text-white">
                      {employerTypes.filter(t => t.category === 'local').length}
                    </p>
                    <p className="text-sm text-gray-400">Local Types</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-8 h-8 text-orange-400" />
                  <div>
                    <p className="text-2xl font-bold text-white">
                      {employerTypes.filter(t => t.category === 'abroad').length}
                    </p>
                    <p className="text-sm text-gray-400">Abroad Types</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Filters and Search */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 mb-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Search employer types..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">All Categories</option>
                  <option value="local">Local</option>
                  <option value="abroad">Abroad</option>
                  <option value="both">Both</option>
                </select>

                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">All Types</option>
                  <option value="direct">Direct</option>
                  <option value="agency">Agency</option>
                  <option value="sub_agency">Sub-Agency</option>
                </select>

                <button
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <Plus size={16} />
                  Add Type
                </button>
              </div>
            </div>

            {/* Employer Types Table */}
            <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Code & Label
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {filteredTypes.map((type) => (
                      <tr key={type.id} className="hover:bg-gray-700/50">
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-white">{type.label}</div>
                            <div className="text-sm text-gray-400">{type.code}</div>
                            {type.description && (
                              <div className="text-xs text-gray-500 mt-1">{type.description}</div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(type.category)}`}>
                            {type.category}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(type.type)}`}>
                              {type.type}
                            </span>
                            {type.subtype && (
                              <div className="text-xs text-gray-400 mt-1">{type.subtype}</div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => toggleStatus(type.id, type.isActive)}
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              type.isActive
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {type.isActive ? 'Active' : 'Inactive'}
                          </button>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEdit(type)}
                              className="text-indigo-400 hover:text-indigo-300"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(type.id)}
                              className="text-red-400 hover:text-red-300"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredTypes.length === 0 && (
                <div className="text-center py-12">
                  <Building2 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">No employer types found</h3>
                  <p className="text-gray-400">
                    {searchTerm || filterCategory || filterType
                      ? 'Try adjusting your search or filters'
                      : 'Get started by adding your first employer type'
                    }
                  </p>
                </div>
              )}
            </div>
          </div>
        </main>

        {/* Add/Edit Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-medium text-white mb-4">
                {editingType ? 'Edit Employer Type' : 'Add Employer Type'}
              </h3>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Code *
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Label *
                  </label>
                  <input
                    type="text"
                    value={formData.label}
                    onChange={(e) => setFormData(prev => ({ ...prev, label: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Category *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    >
                      <option value="">Select Category</option>
                      <option value="local">Local</option>
                      <option value="abroad">Abroad</option>
                      <option value="both">Both</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Type *
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    >
                      <option value="">Select Type</option>
                      <option value="direct">Direct</option>
                      <option value="agency">Agency</option>
                      <option value="sub_agency">Sub-Agency</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Subtype
                  </label>
                  <select
                    value={formData.subtype}
                    onChange={(e) => setFormData(prev => ({ ...prev, subtype: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select Subtype</option>
                    <option value="single_entity">Single Entity</option>
                    <option value="corporate">Corporate</option>
                    <option value="pea">PEA</option>
                    <option value="lb">LB</option>
                    <option value="ma">MA</option>
                    <option value="poea">POEA</option>
                    <option value="dmw">DMW</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="w-4 h-4 text-indigo-600 bg-gray-700 border-gray-600 rounded focus:ring-indigo-500"
                  />
                  <label className="text-sm text-gray-300">Active</label>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    {editingType ? 'Update' : 'Add'} Type
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setEditingType(null);
                      resetForm();
                    }}
                    className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <Footer />
      </div>
    </ProtectedRoute>
  );
}