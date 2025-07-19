"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Star, ThumbsUp, Flag, MessageSquare, Building, CheckCircle, AlertCircle } from 'lucide-react';

export default function CompanyReviewSystem({ companyId, companyName }) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [myReview, setMyReview] = useState(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportingReviewId, setReportingReviewId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [reviewForm, setReviewForm] = useState({
    overallRating: 0,
    compensationRating: 0,
    cultureRating: 0,
    managementRating: 0,
    workLifeBalanceRating: 0,
    title: '',
    comment: '',
    pros: '',
    cons: '',
    position: '',
    employmentType: 'full-time',
    employmentStatus: 'former',
    workDuration: '1-2_years',
    isAnonymous: false
  });

  const [reportForm, setReportForm] = useState({
    reason: '',
    details: ''
  });

  const [averageRatings, setAverageRatings] = useState({
    overall: 0,
    compensation: 0,
    culture: 0,
    management: 0,
    workLifeBalance: 0,
    totalReviews: 0
  });

  useEffect(() => {
    fetchReviews();
    fetchMyReview();
  }, [companyId]);

  const fetchReviews = async () => {
    try {
      const response = await fetch(`/api/companies/${companyId}/reviews`);
      if (response.ok) {
        const data = await response.json();
        setReviews(data.reviews);
        setAverageRatings(data.averageRatings);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMyReview = async () => {
    if (!user) return;
    
    try {
      const response = await fetch(`/api/companies/${companyId}/reviews/my-review`);
      if (response.ok) {
        const data = await response.json();
        if (data.review) {
          setMyReview(data.review);
        }
      }
    } catch (error) {
      console.error('Error fetching my review:', error);
    }
  };

  const handleRatingChange = (category, rating) => {
    setReviewForm(prev => ({
      ...prev,
      [category]: rating
    }));
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/companies/${companyId}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reviewForm),
      });

      if (response.ok) {
        const data = await response.json();
        setMyReview(data.review);
        setShowReviewForm(false);
        fetchReviews(); // Refresh reviews
        setReviewForm({
          overallRating: 0,
          compensationRating: 0,
          cultureRating: 0,
          managementRating: 0,
          workLifeBalanceRating: 0,
          title: '',
          comment: '',
          pros: '',
          cons: '',
          position: '',
          employmentType: 'full-time',
          employmentStatus: 'former',
          workDuration: '1-2_years',
          isAnonymous: false
        });
      }
    } catch (error) {
      console.error('Error submitting review:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVoteHelpful = async (reviewId) => {
    try {
      const response = await fetch(`/api/companies/${companyId}/reviews/${reviewId}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ voteType: 'helpful' }),
      });

      if (response.ok) {
        fetchReviews(); // Refresh to update vote counts
      }
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  const handleReportReview = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/companies/${companyId}/reviews/${reportingReviewId}/report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reportForm),
      });

      if (response.ok) {
        setShowReportModal(false);
        setReportingReviewId(null);
        setReportForm({ reason: '', details: '' });
        alert('Report submitted successfully. We will review it shortly.');
      }
    } catch (error) {
      console.error('Error reporting review:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = (rating, onRatingChange = null, size = 'w-5 h-5') => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onRatingChange && onRatingChange(star)}
            className={`${size} ${
              star <= rating ? 'text-yellow-400' : 'text-gray-500'
            } ${onRatingChange ? 'hover:text-yellow-400 cursor-pointer' : ''}`}
          >
            <Star className={`${size} fill-current`} />
          </button>
        ))}
      </div>
    );
  };

  const formatWorkDuration = (duration) => {
    const durations = {
      'less_than_1_year': 'Less than 1 year',
      '1-2_years': '1-2 years',
      '3-5_years': '3-5 years',
      'more_than_5_years': 'More than 5 years'
    };
    return durations[duration] || duration;
  };

  const getRatingColor = (rating) => {
    if (rating >= 4) return 'text-green-600';
    if (rating >= 3) return 'text-yellow-600';
    if (rating >= 2) return 'text-orange-600';
    return 'text-red-600';
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-gray-900 rounded-lg shadow-lg border border-gray-700">
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white flex items-center">
              <Building className="w-6 h-6 mr-2 text-blue-400" />
              {companyName} Reviews
            </h2>
            {user && !myReview && (
              <button
                onClick={() => setShowReviewForm(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Write Review
              </button>
            )}
          </div>

          {/* Average Ratings Overview */}
          <div className="bg-gray-800 rounded-lg p-4 mb-6 border border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-1">
                  {averageRatings.overall.toFixed(1)}
                </div>
                <div className="flex justify-center mb-1">
                  {renderStars(Math.round(averageRatings.overall))}
                </div>
                <div className="text-sm text-gray-300">Overall Rating</div>
                <div className="text-xs text-gray-400">
                  {averageRatings.totalReviews} reviews
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-300">Compensation</span>
                  <div className="flex items-center space-x-2">
                    <div className="flex">
                      {renderStars(Math.round(averageRatings.compensation), null, 'w-4 h-4')}
                    </div>
                    <span className={`text-sm font-medium ${getRatingColor(averageRatings.compensation)}`}>
                      {averageRatings.compensation.toFixed(1)}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-300">Culture</span>
                  <div className="flex items-center space-x-2">
                    <div className="flex">
                      {renderStars(Math.round(averageRatings.culture), null, 'w-4 h-4')}
                    </div>
                    <span className={`text-sm font-medium ${getRatingColor(averageRatings.culture)}`}>
                      {averageRatings.culture.toFixed(1)}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-300">Management</span>
                  <div className="flex items-center space-x-2">
                    <div className="flex">
                      {renderStars(Math.round(averageRatings.management), null, 'w-4 h-4')}
                    </div>
                    <span className={`text-sm font-medium ${getRatingColor(averageRatings.management)}`}>
                      {averageRatings.management.toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-300">Work-Life Balance</span>
                  <div className="flex items-center space-x-2">
                    <div className="flex">
                      {renderStars(Math.round(averageRatings.workLifeBalance), null, 'w-4 h-4')}
                    </div>
                    <span className={`text-sm font-medium ${getRatingColor(averageRatings.workLifeBalance)}`}>
                      {averageRatings.workLifeBalance.toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* My Review */}
          {myReview && (
            <div className="bg-gray-800 border border-gray-600 rounded-lg p-4 mb-6">
              <div className="flex items-center mb-2">
                <CheckCircle className="w-5 h-5 text-blue-400 mr-2" />
                <span className="font-semibold text-blue-300">Your Review</span>
                <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                  myReview.status === 'approved' ? 'bg-green-800 text-green-200' :
                  myReview.status === 'pending' ? 'bg-yellow-800 text-yellow-200' :
                  'bg-red-800 text-red-200'
                }`}>
                  {myReview.status}
                </span>
              </div>
              <div className="flex items-center space-x-4 mb-2">
                <div className="flex">
                  {renderStars(myReview.overallRating)}
                </div>
                <span className="text-sm text-gray-300">
                  {myReview.position} • {formatWorkDuration(myReview.workDuration)}
                </span>
              </div>
              {myReview.title && (
                <h4 className="font-semibold text-white mb-2">{myReview.title}</h4>
              )}
              {myReview.comment && (
                <p className="text-gray-300 mb-3">{myReview.comment}</p>
              )}
              {myReview.pros && (
                <div className="mb-2">
                  <span className="font-medium text-green-400">Pros:</span>
                  <p className="text-gray-300">{myReview.pros}</p>
                </div>
              )}
              {myReview.cons && (
                <div>
                  <span className="font-medium text-red-400">Cons:</span>
                  <p className="text-gray-300">{myReview.cons}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Reviews List */}
        <div className="divide-y divide-gray-700">
          {reviews.map((review) => (
            <div key={review.id} className="p-6 bg-gray-900">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center border border-gray-600">
                    {review.isAnonymous ? (
                      <span className="text-sm font-medium text-gray-300">A</span>
                    ) : (
                      <span className="text-sm font-medium text-gray-300">
                        {review.user?.fullName?.charAt(0) || 'U'}
                      </span>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-white">
                        {review.isAnonymous ? 'Anonymous' : review.user?.fullName || 'User'}
                      </span>
                      {review.isVerified && (
                        <CheckCircle className="w-4 h-4 text-blue-400" />
                      )}
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-300">
                      <div className="flex">
                        {renderStars(review.overallRating, null, 'w-4 h-4')}
                      </div>
                      <span>•</span>
                      <span>{review.position}</span>
                      <span>•</span>
                      <span>{formatWorkDuration(review.workDuration)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleVoteHelpful(review.id)}
                    className="flex items-center space-x-1 text-sm text-gray-400 hover:text-blue-400 transition-colors"
                  >
                    <ThumbsUp className="w-4 h-4" />
                    <span>{review.helpfulVotes}</span>
                  </button>
                  <button
                    onClick={() => {
                      setReportingReviewId(review.id);
                      setShowReportModal(true);
                    }}
                    className="text-sm text-gray-400 hover:text-red-400 transition-colors"
                  >
                    <Flag className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {review.title && (
                <h4 className="font-semibold text-white mb-2">{review.title}</h4>
              )}

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-sm text-gray-300">Compensation</div>
                  <div className="flex justify-center">
                    {renderStars(review.compensationRating, null, 'w-4 h-4')}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-300">Culture</div>
                  <div className="flex justify-center">
                    {renderStars(review.cultureRating, null, 'w-4 h-4')}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-300">Management</div>
                  <div className="flex justify-center">
                    {renderStars(review.managementRating, null, 'w-4 h-4')}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-300">Work-Life Balance</div>
                  <div className="flex justify-center">
                    {renderStars(review.workLifeBalanceRating, null, 'w-4 h-4')}
                  </div>
                </div>
              </div>

              {review.comment && (
                <p className="text-gray-300 mb-3">{review.comment}</p>
              )}

              {review.pros && (
                <div className="mb-2">
                  <span className="font-medium text-green-400">Pros:</span>
                  <p className="text-gray-300">{review.pros}</p>
                </div>
              )}

              {review.cons && (
                <div className="mb-3">
                  <span className="font-medium text-red-400">Cons:</span>
                  <p className="text-gray-300">{review.cons}</p>
                </div>
              )}

              <div className="text-xs text-gray-500">
                {new Date(review.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>

        {reviews.length === 0 && (
          <div className="text-center py-12 bg-gray-900">
            <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400">No reviews yet. Be the first to review this company!</p>
          </div>
        )}
      </div>

      {/* Review Form Modal */}
      {showReviewForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4 text-white">Write a Review for {companyName}</h3>
              
              <form onSubmit={handleSubmitReview} className="space-y-6">
                {/* Overall Rating */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Overall Rating *
                  </label>
                  <div className="flex items-center space-x-4">
                    {renderStars(reviewForm.overallRating, (rating) => handleRatingChange('overallRating', rating))}
                    <span className="text-sm text-gray-400">
                      {reviewForm.overallRating > 0 ? `${reviewForm.overallRating} stars` : 'Select rating'}
                    </span>
                  </div>
                </div>

                {/* Category Ratings */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Compensation *
                    </label>
                    {renderStars(reviewForm.compensationRating, (rating) => handleRatingChange('compensationRating', rating))}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Culture *
                    </label>
                    {renderStars(reviewForm.cultureRating, (rating) => handleRatingChange('cultureRating', rating))}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Management *
                    </label>
                    {renderStars(reviewForm.managementRating, (rating) => handleRatingChange('managementRating', rating))}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Work-Life Balance *
                    </label>
                    {renderStars(reviewForm.workLifeBalanceRating, (rating) => handleRatingChange('workLifeBalanceRating', rating))}
                  </div>
                </div>

                {/* Review Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Review Title
                  </label>
                  <input
                    type="text"
                    value={reviewForm.title}
                    onChange={(e) => setReviewForm(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full p-2 border border-gray-600 rounded-md bg-gray-800 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Sum up your experience..."
                  />
                </div>

                {/* Review Comment */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Review Comment
                  </label>
                  <textarea
                    value={reviewForm.comment}
                    onChange={(e) => setReviewForm(prev => ({ ...prev, comment: e.target.value }))}
                    className="w-full p-2 border border-gray-600 rounded-md bg-gray-800 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows="4"
                    placeholder="Share your experience working at this company..."
                  />
                </div>

                {/* Pros and Cons */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Pros
                    </label>
                    <textarea
                      value={reviewForm.pros}
                      onChange={(e) => setReviewForm(prev => ({ ...prev, pros: e.target.value }))}
                      className="w-full p-2 border border-gray-600 rounded-md bg-gray-800 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows="3"
                      placeholder="What did you like about working here?"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Cons
                    </label>
                    <textarea
                      value={reviewForm.cons}
                      onChange={(e) => setReviewForm(prev => ({ ...prev, cons: e.target.value }))}
                      className="w-full p-2 border border-gray-600 rounded-md bg-gray-800 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows="3"
                      placeholder="What could be improved?"
                    />
                  </div>
                </div>

                {/* Employment Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Position
                    </label>
                    <input
                      type="text"
                      value={reviewForm.position}
                      onChange={(e) => setReviewForm(prev => ({ ...prev, position: e.target.value }))}
                      className="w-full p-2 border border-gray-600 rounded-md bg-gray-800 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Your job title..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Employment Type
                    </label>
                    <select
                      value={reviewForm.employmentType}
                      onChange={(e) => setReviewForm(prev => ({ ...prev, employmentType: e.target.value }))}
                      className="w-full p-2 border border-gray-600 rounded-md bg-gray-800 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="full-time">Full-time</option>
                      <option value="part-time">Part-time</option>
                      <option value="contract">Contract</option>
                      <option value="internship">Internship</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Employment Status
                    </label>
                    <select
                      value={reviewForm.employmentStatus}
                      onChange={(e) => setReviewForm(prev => ({ ...prev, employmentStatus: e.target.value }))}
                      className="w-full p-2 border border-gray-600 rounded-md bg-gray-800 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="current">Current Employee</option>
                      <option value="former">Former Employee</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Work Duration
                    </label>
                    <select
                      value={reviewForm.workDuration}
                      onChange={(e) => setReviewForm(prev => ({ ...prev, workDuration: e.target.value }))}
                      className="w-full p-2 border border-gray-600 rounded-md bg-gray-800 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="less_than_1_year">Less than 1 year</option>
                      <option value="1-2_years">1-2 years</option>
                      <option value="3-5_years">3-5 years</option>
                      <option value="more_than_5_years">More than 5 years</option>
                    </select>
                  </div>
                </div>

                {/* Anonymous Option */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={reviewForm.isAnonymous}
                    onChange={(e) => setReviewForm(prev => ({ ...prev, isAnonymous: e.target.checked }))}
                    className="mr-2 bg-gray-800 border-gray-600 text-blue-600 focus:ring-blue-500"
                  />
                  <label className="text-sm text-gray-300">
                    Post anonymously
                  </label>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowReviewForm(false)}
                    className="px-4 py-2 border border-gray-600 rounded-md bg-gray-700 text-gray-300 hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || reviewForm.overallRating === 0}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Review'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-lg max-w-md w-full border border-gray-700">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4 text-white">Report Review</h3>
              
              <form onSubmit={handleReportReview} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Reason for reporting *
                  </label>
                  <select
                    value={reportForm.reason}
                    onChange={(e) => setReportForm(prev => ({ ...prev, reason: e.target.value }))}
                    className="w-full p-2 border border-gray-600 rounded-md bg-gray-800 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Select a reason</option>
                    <option value="spam">Spam</option>
                    <option value="inappropriate">Inappropriate content</option>
                    <option value="fake">Fake review</option>
                    <option value="offensive">Offensive language</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Additional details
                  </label>
                  <textarea
                    value={reportForm.details}
                    onChange={(e) => setReportForm(prev => ({ ...prev, details: e.target.value }))}
                    className="w-full p-2 border border-gray-600 rounded-md bg-gray-800 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows="3"
                    placeholder="Please provide more details about the issue..."
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowReportModal(false)}
                    className="px-4 py-2 border border-gray-600 rounded-md bg-gray-700 text-gray-300 hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !reportForm.reason}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                  >
                    {isSubmitting ? 'Reporting...' : 'Submit Report'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
