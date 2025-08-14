'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { 
  Eye, 
  EyeOff, 
  Lock, 
  Unlock, 
  Star, 
  CreditCard, 
  User, 
  Mail, 
  Phone, 
  MapPin,
  Shield,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

export default function ContactRevealSystem({ 
  jobSeeker, 
  applicationId, 
  onReveal, 
  className = "" 
}) {
  const { user } = useAuth();
  const { subscription, credits, useCredit } = useSubscription();
  const [revealing, setRevealing] = useState(false);
  const [revealed, setRevealed] = useState(false);
  
  // Check if contact info is already revealed
  const [contactVisible, setContactVisible] = useState(
    jobSeeker?.contactVisible || false
  );

  const handleRevealContact = async () => {
    if (!user || user.role !== 'employer') {
      alert('Only employers can reveal contact information');
      return;
    }

    // Check if already revealed
    if (revealed || contactVisible) {
      return;
    }

    // Check credits
    if (credits < 1) {
      alert('Insufficient credits. Please purchase more credits to reveal contact information.');
      return;
    }

    setRevealing(true);

    try {
      // Call API to reveal contact and deduct credit
      const response = await fetch('/api/applications/reveal-contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({
          applicationId: applicationId,
          jobSeekerId: jobSeeker.id
        })
      });

      if (response.ok) {
        const data = await response.json();
        setRevealed(true);
        setContactVisible(true);
        
        // Update parent component
        if (onReveal) {
          onReveal(data.contactInfo);
        }

        // Update credits locally
        useCredit(1);
        
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to reveal contact information');
      }
    } catch (error) {
      console.error('Error revealing contact:', error);
      alert('Failed to reveal contact information');
    } finally {
      setRevealing(false);
    }
  };

  const renderMaskedInfo = (info, type) => {
    if (!info) return 'Not provided';
    
    switch (type) {
      case 'email':
        const emailParts = info.split('@');
        return emailParts.length === 2 ? 
          `${emailParts[0].charAt(0)}***@${emailParts[1]}` : 
          '***@***.com';
      case 'phone':
        return info.replace(/\d(?=\d{4})/g, '*');
      case 'address':
        return info.split(' ').map((word, index) => 
          index === 0 ? word : word.replace(/./g, '*')
        ).join(' ');
      default:
        return info.replace(/./g, '*');
    }
  };

  const renderContactInfo = (label, value, type, icon) => {
    const Icon = icon;
    const isRevealed = revealed || contactVisible;
    const showValue = isRevealed ? value : renderMaskedInfo(value, type);
    
    return (
      <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded ${isRevealed ? 'bg-green-600' : 'bg-gray-600'}`}>
            <Icon className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm text-gray-400">{label}</p>
            <p className="text-white font-medium">{showValue}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {isRevealed ? (
            <div className="flex items-center gap-1 text-green-400 text-sm">
              <CheckCircle className="w-4 h-4" />
              <span>Revealed</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-gray-400 text-sm">
              <Shield className="w-4 h-4" />
              <span>Protected</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={`bg-gray-800 rounded-lg border border-gray-700 ${className}`}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 rounded-lg p-3">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Contact Information</h3>
              <p className="text-gray-400 text-sm">
                {revealed || contactVisible ? 
                  'Contact details are now visible' : 
                  'Contact details are protected'
                }
              </p>
            </div>
          </div>
          
          {user?.role === 'employer' && (
            <div className="flex items-center gap-2">
              {credits !== undefined && (
                <div className="flex items-center gap-1 text-blue-400 text-sm bg-blue-900/20 px-3 py-1 rounded-full">
                  <CreditCard className="w-4 h-4" />
                  <span>{credits} credits</span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="space-y-4">
          {/* Email */}
          {renderContactInfo(
            'Email Address',
            jobSeeker?.email || 'Not provided',
            'email',
            Mail
          )}

          {/* Phone */}
          {renderContactInfo(
            'Phone Number',
            jobSeeker?.phone || 'Not provided',
            'phone',
            Phone
          )}

          {/* Address */}
          {renderContactInfo(
            'Address',
            jobSeeker?.address || 'Not provided',
            'address',
            MapPin
          )}
        </div>

        {/* Reveal Button */}
        {user?.role === 'employer' && !revealed && !contactVisible && (
          <div className="mt-6 pt-6 border-t border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">Reveal Contact Information</p>
                <p className="text-gray-400 text-sm">
                  Use 1 credit to view full contact details
                </p>
              </div>
              
              <button
                onClick={handleRevealContact}
                disabled={revealing || credits < 1}
                className={`px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-all ${
                  credits < 1
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700 transform hover:scale-105'
                } disabled:opacity-50`}
              >
                {revealing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Revealing...</span>
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4" />
                    <span>Reveal ({credits < 1 ? '0' : '1'} credit)</span>
                  </>
                )}
              </button>
            </div>
            
            {credits < 1 && (
              <div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
                <div className="flex items-center gap-2 text-yellow-300">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-sm">
                    Insufficient credits. 
                    <a href="/pricing" className="text-yellow-200 underline ml-1">
                      Purchase more credits
                    </a>
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Success Message */}
        {(revealed || contactVisible) && (
          <div className="mt-6 pt-6 border-t border-gray-700">
            <div className="p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
              <div className="flex items-center gap-2 text-green-300">
                <CheckCircle className="w-5 h-5" />
                <div>
                  <p className="font-medium">Contact Information Revealed</p>
                  <p className="text-sm text-green-400 mt-1">
                    You can now contact this candidate directly using the information above.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Privacy Notice */}
        <div className="mt-6 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-blue-400 mt-0.5" />
            <div>
              <p className="text-blue-300 font-medium text-sm">Privacy Protection</p>
              <p className="text-blue-400 text-sm mt-1">
                Contact information is protected by our privacy system. 
                Only verified employers can reveal contact details using credits.
                This ensures job seekers' privacy is respected while enabling legitimate recruitment.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
