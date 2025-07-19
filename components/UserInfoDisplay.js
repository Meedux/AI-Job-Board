/**
 * User Info Display Component with Content Masking Support
 * Shows user information with optional content masking for premium users
 */
'use client';

import { useState, useEffect } from 'react';
import { maskUserData } from '@/utils/userContentMasking';

export default function UserInfoDisplay({ user, showMaskedVersion = false }) {
  const [maskedData, setMaskedData] = useState(null);

  useEffect(() => {
    if (user && showMaskedVersion) {
      const masked = maskUserData(user, true);
      setMaskedData(masked);
    }
  }, [user, showMaskedVersion]);

  const displayData = showMaskedVersion && maskedData ? maskedData : user;

  if (!displayData) {
    return <div className="text-gray-500">No user information available</div>;
  }

  return (
    <div className="bg-gray-900 rounded-lg shadow-md p-6 border border-gray-700">
      <div className="flex items-center space-x-4 mb-4">
        <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
          {displayData.fullName ? displayData.fullName.charAt(0).toUpperCase() : 'U'}
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">
            {displayData.fullName || 'Anonymous User'}
          </h3>
          {displayData.nickname && (
            <p className="text-sm text-gray-400">
              "{displayData.nickname}"
            </p>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-400">Email:</span>
          <span className="text-sm text-gray-200">{displayData.email}</span>
        </div>

        {displayData.fullAddress && (
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-400">Address:</span>
            <span className="text-sm text-gray-200 text-right max-w-xs">
              {displayData.fullAddress}
            </span>
          </div>
        )}

        {displayData.dateOfBirth && (
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-400">Date of Birth:</span>
            <span className="text-sm text-gray-200">
              {new Date(displayData.dateOfBirth).toLocaleDateString()}
            </span>
          </div>
        )}
      </div>

      {showMaskedVersion && (
        <div className="mt-4 pt-4 border-t border-gray-700">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span className="text-xs text-gray-400">
              Content masking is active - sensitive information is hidden
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * User Card Component with Content Masking Toggle
 * Allows toggling between masked and unmasked view
 */
export function UserCardWithMasking({ user, userContentMasking = false }) {
  const [showMasked, setShowMasked] = useState(userContentMasking);

  return (
    <div className="space-y-4">
      {/* Toggle Controls */}
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-medium text-white">User Information</h4>
        <button
          onClick={() => setShowMasked(!showMasked)}
          className={`px-3 py-1 text-xs rounded-full transition-colors ${
            showMasked
              ? 'bg-yellow-900 text-yellow-300 hover:bg-yellow-800 border border-yellow-700'
              : 'bg-green-900 text-green-300 hover:bg-green-800 border border-green-700'
          }`}
        >
          {showMasked ? 'Show Original' : 'Show Masked'}
        </button>
      </div>

      {/* User Info Display */}
      <UserInfoDisplay user={user} showMaskedVersion={showMasked} />
    </div>
  );
}

/**
 * Privacy Status Indicator
 * Shows current content masking status
 */
export function PrivacyStatusIndicator({ contentMasking, className = '' }) {
  if (!contentMasking) return null;

  return (
    <div className={`inline-flex items-center space-x-1 ${className}`}>
      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
      <span className="text-xs text-yellow-400 font-medium">
        Privacy Mode Active
      </span>
    </div>
  );
}
