'use client';

import { useState } from 'react';
import { Eye, EyeOff, Mail, Phone, MapPin, Coins, Lock } from 'lucide-react';

export default function ResumeContactReveal({ 
  targetUser, 
  applicationId = null, 
  userCredits = 0, 
  onReveal = null,
  className = ""
}) {
  const [isRevealed, setIsRevealed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isHidden, setIsHidden] = useState(false);

  const handleRevealContact = async () => {
    if (isLoading || isRevealed) return;
    
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/resume/reveal-contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          targetUserId: targetUser.id,
          applicationId,
          revealType: 'contact'
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to reveal contact information');
      }

      setRevealedData(data.contactInfo);
      setIsRevealed(true);
      
      // Call the onReveal callback if provided
      if (onReveal) {
        onReveal(data);
      }

    } catch (err) {
      console.error('Error revealing contact:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const ContactField = ({ icon: Icon, label, value, isRevealed: fieldRevealed }) => (
    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border">
      <Icon className="w-5 h-5 text-gray-600" />
      <div className="flex-1">
        <div className="text-sm font-medium text-gray-700">{label}</div>
        <div className="text-gray-900">
          {fieldRevealed ? value : '••••••••••'}
        </div>
      </div>
      {!fieldRevealed && (
        <Lock className="w-4 h-4 text-gray-400" />
      )}
    </div>
  );

  return (
    <div className={`bg-white border rounded-lg p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Coins className="w-4 h-4" />
          <span>{userCredits} credits available</span>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}

      <div className="space-y-3 mb-6">
        <ContactField
          icon={Mail}
          label="Email Address"
          value={revealedData?.email || targetUser.email}
          isRevealed={isRevealed && !isHidden}
        />
        <ContactField
          icon={Phone}
          label="Phone Number"
          value={revealedData?.phone || targetUser.phone || 'Not provided'}
          isRevealed={isRevealed && !isHidden}
        />
        <ContactField
          icon={MapPin}
          label="Location"
          value={revealedData?.location || targetUser.location || 'Not provided'}
          isRevealed={isRevealed && !isHidden}
        />
      </div>

      {!isRevealed && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Eye className="w-4 h-4 text-blue-600" />
              </div>
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-medium text-blue-900 mb-1">
                Reveal Contact Information
              </h4>
              <p className="text-sm text-blue-700 mb-3">
                Access {targetUser.fullName || targetUser.name}'s contact details including email, phone, and location.
              </p>
              <div className="flex items-center gap-2 text-xs text-blue-600">
                <Coins className="w-3 h-3" />
                <span>Cost: 1 credit</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-3">
        {!isRevealed ? (
          <button
            onClick={handleRevealContact}
            disabled={isLoading || userCredits < 1}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              userCredits < 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : isLoading
                ? 'bg-blue-100 text-blue-400 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            <Eye className="w-4 h-4" />
            {isLoading ? 'Revealing...' : 'Reveal Contact (1 credit)'}
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg">
              <Eye className="w-4 h-4" />
              <span>Contact information revealed</span>
            </div>
            <button
              onClick={() => setIsHidden(!isHidden)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              {isHidden ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              {isHidden ? 'Show Contact' : 'Hide Contact'}
            </button>
          </div>
        )}

        {userCredits < 1 && !isRevealed && (
          <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
            Purchase Credits
          </button>
        )}
      </div>

      {isRevealed && revealedData && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="text-sm text-green-700">
            ✓ Contact information revealed successfully. {revealedData.remainingCredits} credits remaining.
          </div>
        </div>
      )}
    </div>
  );
}