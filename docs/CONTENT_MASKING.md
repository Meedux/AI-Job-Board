# Content Masking Feature Documentation

## Overview
The Content Masking feature is a premium privacy feature that allows users to hide sensitive personal information from their profiles while maintaining functionality. This feature is available to Basic, Premium, and Enterprise subscribers only.

## Features

### What Gets Masked
- **Email addresses**: Shows first 2 characters + domain (e.g., `jo***@example.com`)
- **Full names**: Shows first initial + last name (e.g., `J. Smith`)
- **Phone numbers**: Shows first 2 and last 2 digits (e.g., `+1-55*-***-*567`)
- **Addresses**: Shows only city and country (e.g., `*** New York, USA`)
- **Contact information**: Any field containing phone/contact gets masked

### Subscription Requirements
- ❌ **Free Tier**: Cannot use content masking
- ✅ **Basic Tier**: Content masking available
- ✅ **Premium Tier**: Content masking available  
- ✅ **Enterprise Tier**: Content masking available

## Implementation

### Database Schema
Added `contentMasking` field to User model:
```prisma
model User {
  // ... other fields
  contentMasking   Boolean  @default(false) @map("content_masking") // Premium feature
}
```

### API Endpoints

#### GET /api/user/content-masking
Returns current content masking settings and subscription status.

**Response:**
```json
{
  "contentMasking": true,
  "canUseMasking": true,
  "currentPlan": "premium"
}
```

#### POST /api/user/content-masking
Updates content masking setting (premium users only).

**Request:**
```json
{
  "contentMasking": true
}
```

**Response:**
```json
{
  "success": true,
  "contentMasking": true,
  "message": "Content masking enabled successfully"
}
```

### Utility Functions

#### Core Masking Functions
```javascript
import { 
  maskEmail, 
  maskPhone, 
  maskAddress, 
  maskFullName,
  maskUserData,
  canUseContentMasking 
} from '@/utils/userContentMasking';

// Mask individual fields
const maskedEmail = maskEmail('john@example.com'); // "jo***@example.com"
const maskedPhone = maskPhone('+1-555-123-4567'); // "+1-55*-***-*567"

// Mask complete user object
const maskedUser = maskUserData(userData, true);

// Check subscription access
const canMask = canUseContentMasking(subscription);
```

#### Premium Features Integration
Content masking is integrated with the premium features system:

```javascript
import { PREMIUM_FEATURES, hasPremiumFeature } from '@/utils/premiumFeatures';

const hasAccess = hasPremiumFeature(
  PREMIUM_FEATURES.CONTENT_MASKING, 
  user, 
  subscription
);
```

### UI Components

#### Profile Settings Toggle
The content masking toggle is added to the profile settings page with:
- Premium-only access indicator
- Real-time preview of masked data
- Subscription upgrade prompt for free users

#### User Information Display
The `UserInfoDisplay` component supports masked viewing:

```javascript
import UserInfoDisplay from '@/components/UserInfoDisplay';

<UserInfoDisplay 
  user={userData} 
  showMaskedVersion={contentMasking} 
/>
```

## Usage Examples

### Basic Implementation
```javascript
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { maskUserData, canUseContentMasking } from '@/utils/userContentMasking';

export default function UserProfile() {
  const { user } = useAuth();
  const [contentMasking, setContentMasking] = useState(false);
  const [subscription, setSubscription] = useState(null);

  const displayData = contentMasking 
    ? maskUserData(user, true) 
    : user;

  return (
    <div>
      <h3>{displayData.fullName}</h3>
      <p>{displayData.email}</p>
      <p>{displayData.fullAddress}</p>
    </div>
  );
}
```

### API Integration
```javascript
// Enable content masking
const enableMasking = async () => {
  const response = await fetch('/api/user/content-masking', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contentMasking: true })
  });
  
  const result = await response.json();
  if (result.success) {
    console.log('Content masking enabled');
  }
};
```

## Security Considerations

### Data Protection
- Masking is applied at the presentation layer only
- Original data remains unchanged in the database
- Masking is reversible and user-controlled

### Access Control
- Feature is gated behind subscription tiers
- Free users see upgrade prompts when attempting to enable
- Proper validation on both client and server side

### Privacy Benefits
- Protects user information in screenshots
- Reduces data exposure during profile sharing
- Maintains functionality while hiding sensitive details

## Testing

### Test Utilities
Use the provided test utilities to verify masking functionality:

```javascript
import { runContentMaskingTests } from '@/utils/contentMaskingTests';

// Run comprehensive tests
runContentMaskingTests();

// Test in browser console
window.contentMaskingTests.runAll();
```

### Example Test Cases
```javascript
// Test email masking
expect(maskEmail('john.doe@example.com')).toBe('jo***@example.com');

// Test subscription access
expect(canUseContentMasking({ plan: { planType: 'free' } })).toBe(false);
expect(canUseContentMasking({ plan: { planType: 'premium' } })).toBe(true);

// Test full user masking
const masked = maskUserData({
  fullName: 'John Smith',
  email: 'john@example.com'
}, true);
expect(masked.fullName).toBe('J. Smith');
```

## Migration

### Database Migration
The content masking field was added via Prisma migration:

```sql
-- Migration: add_content_masking_field
ALTER TABLE "users" ADD COLUMN "content_masking" BOOLEAN NOT NULL DEFAULT false;
```

### Backward Compatibility
- Existing users default to masking disabled
- No breaking changes to existing functionality
- Graceful fallbacks for missing subscription data

## Future Enhancements

### Planned Features
- Granular masking controls (per-field toggles)
- Temporary masking for specific contexts
- Masking in job applications and resumes
- Admin override capabilities

### Integration Points
- Resume builder with masked templates
- Job application forms with privacy options
- Public profile sharing with masking
- Employer communication with protected details

## Support

### Common Issues
1. **Toggle not working**: Check subscription status and premium access
2. **Masking not showing**: Verify feature is enabled in user settings
3. **Free user access**: Redirect to subscription upgrade page

### Troubleshooting
```javascript
// Debug masking status
console.log('User subscription:', subscription);
console.log('Can use masking:', canUseContentMasking(subscription));
console.log('Content masking enabled:', user.contentMasking);
```

For technical support, refer to the premium features documentation and subscription management guides.
