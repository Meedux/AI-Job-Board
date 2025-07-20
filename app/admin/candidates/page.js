'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';

export default function CandidatesPage() {
  const { user, loading } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [candidates, setCandidates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterJobId, setFilterJobId] = useState('all');
  const [userJobs, setUserJobs] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (user && ['employer_admin', 'super_admin'].includes(user.role)) {
      loadCandidates();
      loadUserJobs();
    }
  }, [user, filterStatus, filterJobId]);

  const loadCandidates = async () => {
    try {
      let url = '/api/admin/candidates';
      const params = new URLSearchParams();
      if (filterStatus !== 'all') params.append('status', filterStatus);
      if (filterJobId !== 'all') params.append('jobId', filterJobId);
      if (params.toString()) url += `?${params.toString()}`;

      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setCandidates(data.candidates || []);
      }
    } catch (error) {
      console.error('Error loading candidates:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserJobs = async () => {
    try {
      const response = await fetch('/api/admin/jobs');
      if (response.ok) {
        const data = await response.json();
        setUserJobs(data.jobs || []);
      }
    } catch (error) {
      console.error('Error loading jobs:', error);
    }
  };

  const updateCandidateStatus = async (candidateId, newStatus) => {
    try {
      const response = await fetch(`/api/admin/candidates/${candidateId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        loadCandidates();
        alert('Candidate status updated successfully');
      } else {
        const error = await response.json();
        alert(`Error: ${error.message || 'Failed to update status'}`);
      }
    } catch (error) {
      console.error('Error updating candidate status:', error);
      alert('Error updating status. Please try again.');
    }
  };

  const sendMessage = async (candidateId, message) => {
    try {
      const response = await fetch(`/api/admin/candidates/${candidateId}/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      });

      if (response.ok) {
        alert('Message sent successfully');
      } else {
        const error = await response.json();
        alert(`Error: ${error.message || 'Failed to send message'}`);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Error sending message. Please try again.');
    }
  };

  const filteredCandidates = candidates.filter(candidate =>
    candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    candidate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    candidate.job_title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      applied: 'bg-blue-900 text-blue-300',
      reviewing: 'bg-yellow-900 text-yellow-300',
      interviewing: 'bg-purple-900 text-purple-300',
      offered: 'bg-green-900 text-green-300',
      hired: 'bg-green-900 text-green-300',
      rejected: 'bg-red-900 text-red-300'
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[status] || 'bg-gray-900 text-gray-300'}`}>
        {status.toUpperCase()}
      </span>
    );
  };

  const CandidateModal = ({ candidate, onClose }) => {
    const [message, setMessage] = useState('');

    const handleSendMessage = (e) => {
      e.preventDefault();
      if (message.trim()) {
        sendMessage(candidate.id, message);
        setMessage('');
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-gray-800 rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-700">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-white">{candidate.name}</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Candidate Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-gray-400 text-sm">Email</p>
                <p className="text-white">{candidate.email}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Phone</p>
                <p className="text-white">{candidate.phone || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Applied For</p>
                <p className="text-white">{candidate.job_title}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Status</p>
                <div className="mt-1">{getStatusBadge(candidate.status)}</div>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Applied Date</p>
                <p className="text-white">{formatDate(candidate.applied_at)}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Experience</p>
                <p className="text-white">{candidate.experience || 'Not specified'}</p>
              </div>
            </div>

            {/* Cover Letter */}
            {candidate.cover_letter && (
              <div>
                <p className="text-gray-400 text-sm mb-2">Cover Letter</p>
                <div className="bg-gray-700 p-4 rounded-lg">
                  <p className="text-gray-300">{candidate.cover_letter}</p>
                </div>
              </div>
            )}

            {/* Resume */}
            {candidate.resume_url && (
              <div>
                <p className="text-gray-400 text-sm mb-2">Resume</p>
                <a
                  href={candidate.resume_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  📄 View Resume
                </a>
              </div>
            )}

            {/* Status Update */}
            <div>
              <p className="text-gray-400 text-sm mb-2">Update Status</p>
              <div className="flex space-x-2">
                {['reviewing', 'interviewing', 'offered', 'hired', 'rejected'].map((status) => (
                  <button
                    key={status}
                    onClick={() => updateCandidateStatus(candidate.id, status)}
                    className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                      candidate.status === status
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {status.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Send Message */}
            <div>
              <p className="text-gray-400 text-sm mb-2">Send Message</p>
              <form onSubmit={handleSendMessage}>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message to the candidate..."
                  className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg p-3 h-24 resize-none"
                />
                <button
                  type="submit"
                  className="mt-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
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
            <p className="text-gray-300">You need employer admin privileges to view candidates.</p>
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
            <h1 className="text-3xl font-bold text-white mb-2">Candidates</h1>
            <p className="text-gray-300">Manage job applications and candidate pipeline</p>
          </div>

          {/* Filters */}
          <div className="mb-6 flex flex-wrap gap-4">
            <div className="flex-1 min-w-64">
              <input
                type="text"
                placeholder="Search candidates by name, email, or job title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-2"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-2"
            >
              <option value="all">All Status</option>
              <option value="applied">Applied</option>
              <option value="reviewing">Reviewing</option>
              <option value="interviewing">Interviewing</option>
              <option value="offered">Offered</option>
              <option value="hired">Hired</option>
              <option value="rejected">Rejected</option>
            </select>
            <select
              value={filterJobId}
              onChange={(e) => setFilterJobId(e.target.value)}
              className="bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-2"
            >
              <option value="all">All Jobs</option>
              {userJobs.map((job) => (
                <option key={job.id} value={job.id}>{job.title}</option>
              ))}
            </select>
          </div>

          {/* Candidates List */}
          <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-gray-400">Loading candidates...</p>
              </div>
            ) : filteredCandidates.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-gray-400">No candidates found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Candidate
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Job Applied
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Applied Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {filteredCandidates.map((candidate) => (
                      <tr key={candidate.id} className="hover:bg-gray-700/50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <p className="text-white font-medium">{candidate.name}</p>
                            <p className="text-gray-400 text-sm">{candidate.email}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                          {candidate.job_title}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(candidate.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                          {formatDate(candidate.applied_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                setSelectedCandidate(candidate);
                                setShowModal(true);
                              }}
                              className="text-blue-400 hover:text-blue-300 text-sm"
                            >
                              View Details
                            </button>
                            {candidate.resume_url && (
                              <a
                                href={candidate.resume_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-green-400 hover:text-green-300 text-sm"
                              >
                                Resume
                              </a>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Summary Stats */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 text-center">
              <div className="text-2xl font-bold text-blue-400">
                {filteredCandidates.length}
              </div>
              <p className="text-gray-400 text-sm">Total Candidates</p>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 text-center">
              <div className="text-2xl font-bold text-yellow-400">
                {filteredCandidates.filter(c => c.status === 'reviewing').length}
              </div>
              <p className="text-gray-400 text-sm">Under Review</p>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 text-center">
              <div className="text-2xl font-bold text-purple-400">
                {filteredCandidates.filter(c => c.status === 'interviewing').length}
              </div>
              <p className="text-gray-400 text-sm">Interviewing</p>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 text-center">
              <div className="text-2xl font-bold text-green-400">
                {filteredCandidates.filter(c => c.status === 'hired').length}
              </div>
              <p className="text-gray-400 text-sm">Hired</p>
            </div>
          </div>
        </div>
      </div>

      {/* Candidate Modal */}
      {showModal && selectedCandidate && (
        <CandidateModal
          candidate={selectedCandidate}
          onClose={() => {
            setShowModal(false);
            setSelectedCandidate(null);
          }}
        />
      )}
    </div>
  );
}
