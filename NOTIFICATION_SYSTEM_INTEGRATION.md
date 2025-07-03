# Notification System Integration Documentation

## Key Features

### 1. **Intelligent Notification Routing**
- **System-wide notifications**: Only sent to admins
- **User-related notifications**: Sent to both users and admins (where appropriate)
- **Email notifications**: Automatically sent based on notification category
- **Data logging**: All notifications are logged to Google Sheets

### 2. **Notification Categories**

| Category | Description | Admin Only | Email to Admins | Email to User | Data Logging |
|----------|-------------|------------|----------------|---------------|--------------|
| `SYSTEM` | System maintenance, updates, errors | ✅ | ✅ | ❌ | System Events |
| `ADMIN` | Admin activities and alerts | ✅ | ❌ | ❌ | System Events |
| `SECURITY` | Security alerts and warnings | ✅ | ✅ | ❌ | System Events |
| `USER` | User registration, profile updates | Conditional* | Conditional* | ❌ | User Actions |
| `JOB` | Job postings, applications | Both† | ❌ | ❌ | System Events |
| `EMAIL` | Email delivery status | ✅ | ❌ | ❌ | System Events |
| `PAYMENT` | Payment transactions | ✅ | ✅ | ❌ | System Events |

*User notifications are sent to both users and admins for important events like registration  
†Job notifications are visible to both admins and users

### 3. **Notification Types**

#### System Notifications (Admin-only)
- `SYSTEM_MAINTENANCE` - Scheduled maintenance alerts
- `SYSTEM_ERROR` - System error notifications
- `SYSTEM_UPDATE` - System update notifications

#### User-related Notifications
- `USER_REGISTRATION` - New user registrations
- `USER_LOGIN` - User login events (for admins when admin logs in)
- `USER_PROFILE_UPDATE` - Profile changes

#### Job-related Notifications
- `JOB_POSTED` - New job postings
- `JOB_APPLICATION` - Job applications
- `JOB_EXPIRED` - Expired job listings

#### Email Notifications
- `EMAIL_SENT` - Successful email delivery
- `EMAIL_FAILED` - Failed email delivery

#### Admin Notifications
- `ADMIN_LOGIN` - Admin user logins
- `ADMIN_ACTION` - Admin activities
- `DATA_EXPORT` - Data export operations

#### Security Notifications
- `SECURITY_ALERT` - Security incidents
- `PAYMENT_RECEIVED` - Payment confirmations
- `SUBSCRIPTION_UPDATED` - Subscription changes

## Implementation Details

### 1. **Notification Service (`utils/notificationService.js`)**

The central notification service provides:

```javascript
// Create a notification
await createNotification({
  type: NOTIFICATION_TYPES.USER_REGISTRATION,
  title: 'New User Registration',
  message: 'A new user has registered',
  category: CATEGORIES.USER,
  priority: PRIORITY.MEDIUM,
  userId: 'user-123',
  userEmail: 'user@example.com',
  metadata: { registrationSource: 'website' },
  ipAddress: '192.168.1.1'
});

// Convenience functions
await notifyUserRegistration(email, userId, ipAddress);
await notifyJobPosted(jobTitle, company, userId, email, ipAddress);
await notifySystemError(message, context, ipAddress);
await notifyAdminLogin(email, ipAddress);
await notifySecurityAlert(message, userId, email, ipAddress);
```

### 2. **API Integration**

#### Admin Notifications API (`/api/admin/notifications`)
- **GET**: Fetch admin-only notifications
- **POST**: Create admin notifications
- **PATCH**: Mark notifications as read/delete

#### User Notifications API (`/api/notifications/user`)
- **GET**: Fetch user notifications
- **POST**: Create user notifications

#### Test System API (`/api/admin/notifications/test-system`)
- **POST**: Create test notifications for demonstration

### 3. **Automatic Integration Points**

The system automatically creates notifications for:

1. **User Registration** (`/api/auth/register`)
   - Creates admin notification for new registrations
   - Logs to User Actions sheet
   - Sends email to admin

2. **User Login** (`/api/auth/login`)
   - Creates admin notification for admin logins
   - Creates user notification for regular logins
   - Logs to User Actions sheet

3. **Job Posting** (`/api/jobs`)
   - Creates job posting notification
   - Visible to both admins and users
   - Logs to System Events sheet

4. **Email Events** (`utils/emailService.js`)
   - Creates notifications for successful/failed emails
   - Logs email events
   - Admin-only visibility

### 4. **Data Logging Integration**

All notifications automatically trigger appropriate data logging:

- **System Events**: System-wide notifications, errors, email events
- **User Actions**: User-specific notifications and activities
- **Admin Activities**: Admin-initiated notifications and actions
- **Error Logs**: Failed notification attempts and system errors

## Admin Dashboard Features

### Notification Testing Interface

The admin dashboard includes comprehensive testing tools:

1. **Notification System Tests**
   - User Registration notification
   - Job Posted notification
   - System Error notification
   - Security Alert notification
   - Custom Admin notification
   - Custom System notification

2. **Email Service Tests**
   - Connection verification
   - Test email delivery
   - Admin notification emails

### Notification Management

- View all admin notifications with real-time updates
- Mark notifications as read/unread
- Delete individual or all notifications
- Filter by notification type and priority

## Configuration

### Environment Variables

```env
# Email Service (required for email notifications)
EMAIL_NOTIFICATIONS_ENABLED=true
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_APP_PASSWORD=your-app-password
EMAIL_FROM=noreply@getgethired.com

# SMTP Alternative
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-password

# Google Sheets (required for data logging)
GOOGLE_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_SPREADSHEET_ID=your-spreadsheet-id
GOOGLE_LOGGING_SPREADSHEET_ID=your-logging-spreadsheet-id
```

### Admin Configuration

Update admin emails and domains in multiple files:

1. `contexts/AuthContext.js`
2. `utils/notificationService.js`
3. `app/api/admin/notifications/route.js`
4. `utils/emailService.js`

```javascript
const adminEmails = [
  'admin@getgethired.com',
  'support@getgethired.com'
];

const adminDomains = [
  'getgethired.com'
];
```

## Usage Examples

### Creating Custom Notifications

```javascript
import { createNotification, NOTIFICATION_TYPES, CATEGORIES, PRIORITY } from '../utils/notificationService';

// System maintenance notification
await createNotification({
  type: NOTIFICATION_TYPES.SYSTEM_MAINTENANCE,
  title: 'Scheduled Maintenance',
  message: 'System will be down for maintenance from 2-4 AM',
  category: CATEGORIES.SYSTEM,
  priority: PRIORITY.HIGH,
  metadata: { 
    startTime: '2024-01-15T02:00:00Z',
    endTime: '2024-01-15T04:00:00Z'
  }
});

// User notification
await createNotification({
  type: NOTIFICATION_TYPES.USER_PROFILE_UPDATE,
  title: 'Profile Updated',
  message: 'Your profile has been successfully updated',
  category: CATEGORIES.USER,
  priority: PRIORITY.LOW,
  userId: 'user-123',
  userEmail: 'user@example.com'
});
```

### Using in API Routes

```javascript
import { notifyJobPosted, notifySystemError } from '../utils/notificationService';

export async function POST(request) {
  try {
    // ... job posting logic ...
    
    // Notify about successful job posting
    await notifyJobPosted(jobTitle, companyName, userId, userEmail, ipAddress);
    
    return Response.json({ success: true });
  } catch (error) {
    // Notify about system error
    await notifySystemError(error.message, 'job_posting', ipAddress);
    
    return Response.json({ error: 'Failed to post job' }, { status: 500 });
  }
}
```

## Testing and Monitoring

### Admin Dashboard Testing

1. Navigate to `/admin` (admin access required)
2. Go to the "Settings" tab
3. Use "Notification System Testing" section
4. Test different notification types
5. Check "Notifications" tab to see results

### Data Logging Verification

1. Check Google Sheets for logged activities
2. Verify notification entries in appropriate sheets
3. Monitor error logs for failed notifications

### Email Testing

1. Use email testing interface in admin dashboard
2. Verify SMTP connection
3. Send test emails
4. Check email preview URLs in console

## Troubleshooting

### Common Issues

1. **Notifications not appearing**
   - Check user admin status
   - Verify notification category routing
   - Check browser console for errors

2. **Emails not sending**
   - Verify EMAIL_NOTIFICATIONS_ENABLED=true
   - Check SMTP/Gmail configuration
   - Verify app passwords for Gmail

3. **Data logging failures**
   - Check Google Sheets API credentials
   - Verify spreadsheet permissions
   - Check network connectivity

### Debug Mode

Enable debug logging by checking browser console and server logs for detailed notification processing information.

## Future Enhancements

1. **Database Integration**: Replace in-memory storage with database
2. **Push Notifications**: Add browser push notifications
3. **SMS Notifications**: Integrate SMS service for critical alerts
4. **Notification Templates**: Email and notification templates
5. **User Preferences**: Allow users to configure notification preferences
6. **Webhook Integration**: Send notifications to external services

## Security Considerations

1. **Admin Access**: Notifications contain sensitive information - admin access is verified for all admin endpoints
2. **Data Logging**: All notification activities are logged for audit purposes
3. **Email Security**: Emails are sent through secure SMTP connections
4. **Rate Limiting**: Consider implementing rate limiting for notification creation
5. **Input Validation**: All notification inputs are validated and sanitized
