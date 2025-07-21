'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import ProtectedRoute from '../../../components/ProtectedRoute';
import { 
  Users, 
  Search, 
  Filter, 
  MoreVertical, 
  ArrowLeft, 
  Shield, 
  ShieldCheck,
  Crown,
  Ban,
  CheckCircle,
  XCircle,
  Mail,
  Calendar,
  Eye,
  Edit,
  UserCheck,
  UserX
} from 'lucide-react';

export default function UserManagement() {
  const { user } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (user && user.role !== 'super_admin') {
      router.push('/dashboard');
    } else if (user) {
      loadUsers();
    }
  }, [user, router]);

  const loadUsers = async () => {
    try {
      const response = await fetch('/api/super-admin/users', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setUsers(data.users);
        }
      } else {
        const data = await response.json();
        console.error('API Error:', data.error);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateUserStatus = async (userId, status) => {
    setActionLoading(true);
    try {
      const response = await fetch(`/api/super-admin/users/${userId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        loadUsers();
        setShowUserModal(false);
      }
    } catch (error) {
      console.error('Error updating user status:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const updateUserRole = async (userId, role) => {
    if (!confirm(`Are you sure you want to change this user's role to ${role}?`)) return;
    
    setActionLoading(true);
    try {
      const response = await fetch(`/api/super-admin/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ role }),
      });

      if (response.ok) {
        loadUsers();
        setShowUserModal(false);
      }
    } catch (error) {
      console.error('Error updating user role:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = !searchTerm || 
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.lastName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || u.accountStatus === statusFilter;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleIcon = (role) => {
    switch (role) {
      case 'super_admin': return ShieldCheck;
      case 'admin': return Shield;
      case 'employer': return Crown;
      default: return Users;
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'super_admin': return 'bg-red-600';
      case 'admin': return 'bg-purple-600';
      case 'employer': return 'bg-blue-600';
      default: return 'bg-gray-600';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return CheckCircle;
      case 'suspended': return Ban;
      case 'pending': return XCircle;
      default: return XCircle;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-400';
      case 'suspended': return 'text-red-400';
      case 'pending': return 'text-yellow-400';
      default: return 'text-gray-400';
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
                    User Management
                  </h1>
                  <p className="text-gray-400">Manage users, roles, and permissions</p>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50 mb-6">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Search */}
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search users by email or name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Role Filter */}
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="pl-10 pr-8 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none min-w-[150px]"
                  >
                    <option value="all">All Roles</option>
                    <option value="user">User</option>
                    <option value="employer">Employer</option>
                    <option value="admin">Admin</option>
                    <option value="super_admin">Super Admin</option>
                  </select>
                </div>

                {/* Status Filter */}
                <div className="relative">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none min-w-[150px]"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="pending">Pending</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Users Table */}
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="text-gray-400">Loading users...</div>
              </div>
            ) : (
              <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-700/50">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">User</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Role</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Status</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Joined</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Subscription</th>
                        <th className="px-6 py-4 text-right text-sm font-medium text-gray-300">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700/50">
                      {filteredUsers.map((u) => {
                        const RoleIcon = getRoleIcon(u.role);
                        const StatusIcon = getStatusIcon(u.status);
                        
                        return (
                          <tr key={u.id} className="hover:bg-gray-700/30 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-blue-600 rounded-full flex items-center justify-center">
                                  <span className="text-white font-medium">
                                    {(u.firstName?.[0] || u.email[0]).toUpperCase()}
                                  </span>
                                </div>
                                <div>
                                  <div className="text-white font-medium">
                                    {u.firstName && u.lastName ? `${u.firstName} ${u.lastName}` : u.email}
                                  </div>
                                  <div className="text-gray-400 text-sm">{u.email}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <RoleIcon className="w-4 h-4 text-gray-400" />
                                <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${getRoleBadgeColor(u.role)}`}>
                                  {u.role.replace('_', ' ').toUpperCase()}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <StatusIcon className={`w-4 h-4 ${getStatusColor(u.accountStatus)}`} />
                                <span className={`capitalize ${getStatusColor(u.accountStatus)}`}>
                                  {u.accountStatus}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-gray-300">
                              {new Date(u.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4">
                              {u.subscriptions && u.subscriptions.length > 0 ? (
                                <div className="text-sm">
                                  <div className="text-white font-medium">{u.subscriptions[0].plan?.name}</div>
                                  <div className="text-gray-400">{u.subscriptions[0].status}</div>
                                </div>
                              ) : (
                                <span className="text-gray-400">No subscription</span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button
                                onClick={() => {
                                  setSelectedUser(u);
                                  setShowUserModal(true);
                                }}
                                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                              >
                                <MoreVertical className="w-4 h-4 text-gray-400" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {filteredUsers.length === 0 && (
                  <div className="text-center py-12">
                    <Users className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-400 mb-2">No users found</h3>
                    <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
                  </div>
                )}
              </div>
            )}

            {/* User Detail Modal */}
            {showUserModal && selectedUser && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-gray-800 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-white">User Details</h2>
                    <button
                      onClick={() => setShowUserModal(false)}
                      className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <XCircle className="w-5 h-5 text-gray-400" />
                    </button>
                  </div>

                  {/* User Info */}
                  <div className="space-y-6">
                    {/* Profile */}
                    <div className="flex items-center gap-4 p-4 bg-gray-700/50 rounded-lg">
                      <div className="w-16 h-16 bg-gradient-to-r from-green-600 to-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-xl">
                          {(selectedUser.firstName?.[0] || selectedUser.email[0]).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-white">
                          {selectedUser.firstName && selectedUser.lastName 
                            ? `${selectedUser.firstName} ${selectedUser.lastName}` 
                            : selectedUser.email}
                        </h3>
                        <p className="text-gray-400">{selectedUser.email}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-400">
                              Joined {new Date(selectedUser.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Role & Status */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-gray-700/50 rounded-lg">
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Role
                        </label>
                        <select
                          value={selectedUser.role}
                          onChange={(e) => updateUserRole(selectedUser.id, e.target.value)}
                          disabled={actionLoading}
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="user">User</option>
                          <option value="employer">Employer</option>
                          <option value="admin">Admin</option>
                          <option value="super_admin">Super Admin</option>
                        </select>
                      </div>

                      <div className="p-4 bg-gray-700/50 rounded-lg">
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Status
                        </label>
                        <select
                          value={selectedUser.accountStatus}
                          onChange={(e) => updateUserStatus(selectedUser.id, e.target.value)}
                          disabled={actionLoading}
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="active">Active</option>
                          <option value="pending">Pending</option>
                          <option value="suspended">Suspended</option>
                        </select>
                      </div>
                    </div>

                    {/* Subscription Info */}
                    {selectedUser.subscriptions && selectedUser.subscriptions.length > 0 && (
                      <div className="p-4 bg-gray-700/50 rounded-lg">
                        <h4 className="font-medium text-white mb-3">Subscription Details</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-400">Plan:</span>
                            <div className="text-white font-medium">{selectedUser.subscriptions[0].plan?.name || 'Unknown'}</div>
                          </div>
                          <div>
                            <span className="text-gray-400">Status:</span>
                            <div className="text-white font-medium capitalize">{selectedUser.subscriptions[0].status}</div>
                          </div>
                          <div>
                            <span className="text-gray-400">Started:</span>
                            <div className="text-white">{new Date(selectedUser.subscriptions[0].currentPeriodStart).toLocaleDateString()}</div>
                          </div>
                          <div>
                            <span className="text-gray-400">Ends:</span>
                            <div className="text-white">{new Date(selectedUser.subscriptions[0].currentPeriodEnd).toLocaleDateString()}</div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Quick Actions */}
                    <div className="flex gap-3">
                      {selectedUser.accountStatus === 'active' ? (
                        <button
                          onClick={() => updateUserStatus(selectedUser.id, 'suspended')}
                          disabled={actionLoading}
                          className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-lg transition-colors"
                        >
                          <UserX className="w-4 h-4" />
                          Suspend User
                        </button>
                      ) : (
                        <button
                          onClick={() => updateUserStatus(selectedUser.id, 'active')}
                          disabled={actionLoading}
                          className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-lg transition-colors"
                        >
                          <UserCheck className="w-4 h-4" />
                          Activate User
                        </button>
                      )}
                      
                      <button
                        onClick={() => router.push(`/profile/${selectedUser.id}`)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        View Profile
                      </button>
                    </div>
                  </div>
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
