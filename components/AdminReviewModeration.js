"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { CheckCircle, XCircle, Flag, Eye, EyeOff, Star, MessageSquare } from 'lucide-react';

export default function AdminReviewModeration() {
  const { user } = useAuth();
  const router = useRouter();
  const [reviews, setReviews] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (user?.role !== 'admin') {
      router.push('/');
      return;
    }
    
    fetchReviews();
    fetchReports();
  }, [user, router]);

  const fetchReviews = async () => {
    try {
      const response = await fetch('/api/admin/reviews');
      if (response.ok) {
        const data = await response.json();
        setReviews(data);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReports = async () => {
    try {
      const response = await fetch('/api/admin/reports');
      if (response.ok) {
        const data = await response.json();
        setReports(data);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
    }
  };

  const handleReviewAction = async (reviewId, action, notes = '') => {
    setIsProcessing(true);
    try {
      const response = await fetch(`/api/admin/reviews/${reviewId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action, notes }),
      });

      if (response.ok) {
        fetchReviews();
        fetchReports();
      }
    } catch (error) {
      console.error('Error processing review:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReportAction = async (reportId, action) => {
    setIsProcessing(true);
    try {
      const response = await fetch(`/api/admin/reports/${reportId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action }),
      });

      if (response.ok) {
        fetchReports();
      }
    } catch (error) {
      console.error('Error processing report:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const renderStars = (rating) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
          />
        ))}
      </div>
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'flagged':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredReviews = reviews.filter(review => {
    switch (activeTab) {
      case 'pending':
        return review.status === 'pending';
      case 'flagged':
        return review.status === 'flagged';
      case 'approved':
        return review.status === 'approved';
      case 'rejected':
        return review.status === 'rejected';
      default:
        return true;
    }
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 bg-white">
      <div className="bg-white rounded-lg shadow-lg">
        <div className="border-b border-gray-200">
          <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-900">Review Moderation</h1>
            <p className="text-gray-600 mt-2">Manage company reviews and reports</p>
          </div>
          
          <div className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('pending')}
              className={`py-4 px-2 border-b-2 font-medium text-sm ${
                activeTab === 'pending'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <MessageSquare className="inline w-4 h-4 mr-2" />
              Pending ({reviews.filter(r => r.status === 'pending').length})
            </button>
            <button
              onClick={() => setActiveTab('flagged')}
              className={`py-4 px-2 border-b-2 font-medium text-sm ${
                activeTab === 'flagged'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Flag className="inline w-4 h-4 mr-2" />
              Flagged ({reviews.filter(r => r.status === 'flagged').length})
            </button>
            <button
              onClick={() => setActiveTab('approved')}
              className={`py-4 px-2 border-b-2 font-medium text-sm ${
                activeTab === 'approved'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <CheckCircle className="inline w-4 h-4 mr-2" />
              Approved ({reviews.filter(r => r.status === 'approved').length})
            </button>
            <button
              onClick={() => setActiveTab('rejected')}
              className={`py-4 px-2 border-b-2 font-medium text-sm ${
                activeTab === 'rejected'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <XCircle className="inline w-4 h-4 mr-2" />
              Rejected ({reviews.filter(r => r.status === 'rejected').length})
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={`py-4 px-2 border-b-2 font-medium text-sm ${
                activeTab === 'reports'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Flag className="inline w-4 h-4 mr-2" />
              Reports ({reports.filter(r => r.status === 'pending').length})
            </button>
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'reports' ? (
            <div className="space-y-4">
              {reports.filter(r => r.status === 'pending').map((report) => (
                <div key={report.id} className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-red-900">Report #{report.id}</h3>
                      <p className="text-sm text-red-700">
                        Reason: {report.reason} | Reported by: {report.user.fullName}
                      </p>
                      <p className="text-sm text-red-600 mt-1">
                        {new Date(report.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleReportAction(report.id, 'resolved')}
                        disabled={isProcessing}
                        className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 disabled:opacity-50"
                      >
                        Resolve
                      </button>
                      <button
                        onClick={() => handleReportAction(report.id, 'dismissed')}
                        disabled={isProcessing}
                        className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700 disabled:opacity-50"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                  
                  {report.details && (
                    <div className="mb-4">
                      <h4 className="font-medium text-red-900 mb-1">Details:</h4>
                      <p className="text-sm text-red-700">{report.details}</p>
                    </div>
                  )}

                  {/* Show the reported review */}
                  <div className="bg-white border border-gray-200 rounded p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-medium">{report.review.company.name}</h4>
                        <p className="text-sm text-gray-600">
                          {report.review.isAnonymous ? 'Anonymous' : report.review.user.fullName}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {renderStars(report.review.overallRating)}
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(report.review.status)}`}>
                          {report.review.status}
                        </span>
                      </div>
                    </div>
                    
                    {report.review.title && (
                      <h5 className="font-medium mb-2">{report.review.title}</h5>
                    )}
                    
                    {report.review.comment && (
                      <p className="text-sm text-gray-700 mb-2">{report.review.comment}</p>
                    )}
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleReviewAction(report.review.id, 'approved')}
                        disabled={isProcessing}
                        className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 disabled:opacity-50"
                      >
                        Approve Review
                      </button>
                      <button
                        onClick={() => handleReviewAction(report.review.id, 'rejected')}
                        disabled={isProcessing}
                        className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 disabled:opacity-50"
                      >
                        Reject Review
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredReviews.map((review) => (
                <div key={review.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-900">{review.company.name}</h3>
                      <p className="text-sm text-gray-600">
                        {review.isAnonymous ? 'Anonymous' : review.user.fullName}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {renderStars(review.overallRating)}
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(review.status)}`}>
                        {review.status}
                      </span>
                    </div>
                  </div>

                  {review.title && (
                    <h4 className="font-medium text-gray-900 mb-2">{review.title}</h4>
                  )}

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-sm text-gray-600">Compensation</div>
                      <div className="flex justify-center">
                        {renderStars(review.compensationRating)}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-gray-600">Culture</div>
                      <div className="flex justify-center">
                        {renderStars(review.cultureRating)}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-gray-600">Management</div>
                      <div className="flex justify-center">
                        {renderStars(review.managementRating)}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-gray-600">Work-Life Balance</div>
                      <div className="flex justify-center">
                        {renderStars(review.workLifeBalanceRating)}
                      </div>
                    </div>
                  </div>

                  {review.comment && (
                    <p className="text-gray-700 mb-3">{review.comment}</p>
                  )}

                  {review.pros && (
                    <div className="mb-2">
                      <span className="font-medium text-green-700">Pros:</span>
                      <p className="text-gray-700">{review.pros}</p>
                    </div>
                  )}

                  {review.cons && (
                    <div className="mb-3">
                      <span className="font-medium text-red-700">Cons:</span>
                      <p className="text-gray-700">{review.cons}</p>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      Position: {review.position} | Reports: {review.reportCount} | Helpful: {review.helpfulVotes}
                    </div>
                    
                    {(review.status === 'pending' || review.status === 'flagged') && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleReviewAction(review.id, 'approved')}
                          disabled={isProcessing}
                          className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 disabled:opacity-50"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleReviewAction(review.id, 'rejected')}
                          disabled={isProcessing}
                          className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 disabled:opacity-50"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {((activeTab !== 'reports' && filteredReviews.length === 0) || 
            (activeTab === 'reports' && reports.filter(r => r.status === 'pending').length === 0)) && (
            <div className="text-center py-12">
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No {activeTab} items to display.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
