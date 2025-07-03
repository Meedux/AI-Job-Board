# Embeddable Widgets System Documentation

## Overview

1. **Job Listings Widget** - Display filtered job listings
2. **Search Widget** - Provide job search functionality  
3. **Job Posting Form** - Allow companies to post jobs directly

## Features

### Admin Panel Management
- Create and configure embeddable widgets
- Generate HTML and JavaScript embed codes
- Preview widgets before deployment
- Copy embed codes to clipboard
- Delete unused widgets
- Track creation dates and creators

### Widget Types

#### 1. Job Listings Widget (`/embed/jobs`)
Displays a list of job postings with customizable filters and styling.

**Configuration Options:**
- `limit` (1-20): Maximum number of jobs to display
- `height` (200-800px): Widget height
- `category`: Filter jobs by category (e.g., "Technology")
- `location`: Filter jobs by location (e.g., "San Francisco")
- `search`: Filter jobs by search term
- `theme`: "light" or "dark" theme
- `showLogo`: Show/hide GetGetHired branding

**Example URL:**
```
/embed/jobs?limit=5&theme=light&showLogo=true&height=400&category=Technology
```

#### 2. Search Widget (`/embed/search`)
Provides a search form that redirects to the main job site with search parameters.

**Configuration Options:**
- `width`: Widget width (e.g., "100%" or "400px")
- `height` (100-300px): Widget height  
- `theme`: "light" or "dark" theme
- `showLogo`: Show/hide GetGetHired branding
- `redirectUrl`: Where to redirect search results (default: "/")
- `placeholder`: Search input placeholder text
- `locationPlaceholder`: Location input placeholder text
- `buttonText`: Search button text

**Example URL:**
```
/embed/search?width=400px&height=120&theme=light&redirectUrl=/
```

#### 3. Job Posting Form (`/embed/post-job`)
Allows companies to post jobs directly from their website.

**Configuration Options:**
- `height` (400-800px): Widget height
- `theme`: "light" or "dark" theme
- `showLogo`: Show/hide GetGetHired branding
- `companyName`: Pre-fill company name
- `companyWebsite`: Pre-fill company website
- `successRedirect`: URL to redirect after successful posting

**Example URL:**
```
/embed/post-job?height=600&theme=light&companyName=TechCorp&companyWebsite=https://techcorp.com
```

## Implementation Guide

### 1. HTML Iframe Embed

The simplest way to embed a widget is using an HTML iframe:

```html
<iframe 
  src="https://yoursite.com/embed/jobs?limit=5&theme=light" 
  width="100%" 
  height="400" 
  frameborder="0" 
  scrolling="auto"
  title="Job Listings Widget"
  style="border: 1px solid #e5e7eb; border-radius: 8px;">
</iframe>
```

### 2. JavaScript Dynamic Embed

For more dynamic control, use the JavaScript embed code:

```javascript
// JavaScript embed code
(function() {
  var iframe = document.createElement('iframe');
  iframe.src = 'https://yoursite.com/embed/jobs?limit=5&theme=light';
  iframe.width = '100%';
  iframe.height = '400';
  iframe.frameBorder = '0';
  iframe.scrolling = 'auto';
  iframe.title = 'Job Listings Widget';
  iframe.style = 'border: 1px solid #e5e7eb; border-radius: 8px;';
  
  // Insert into element with id 'getgethired-widget'
  var container = document.getElementById('getgethired-widget');
  if (container) {
    container.appendChild(iframe);
  }
})();
```

Then add this HTML where you want the widget to appear:
```html
<div id="getgethired-widget"></div>
```

### 3. Advanced Integration

For more advanced integrations, you can:

1. **Dynamic Configuration**: Modify URL parameters based on user preferences
2. **Responsive Design**: Adjust widget dimensions based on screen size
3. **Event Handling**: Listen for iframe events (if cross-origin allows)
4. **Styling**: Apply custom CSS to the iframe container

## Security Considerations

### Content Security Policy (CSP)
The embed pages are designed to be iframe-friendly:
- No `X-Frame-Options` restrictions
- Appropriate CSP headers for external embedding
- HTTPS enforcement for secure embedding

### Data Protection
- Job posting forms validate and sanitize all inputs
- No sensitive data is stored in embed configurations
- All API interactions are logged for security monitoring

### Cross-Origin Considerations
- Embed pages work across different domains
- External links open in new tabs/windows
- Limited JavaScript interaction for security

## Customization Examples

### Tech Company Job Board
```html
<iframe 
  src="/embed/jobs?category=Technology&location=San Francisco&limit=10&theme=dark&height=500" 
  width="100%" 
  height="500"
  title="Tech Jobs in SF">
</iframe>
```

### Recruitment Agency Search
```html
<iframe 
  src="/embed/search?theme=light&redirectUrl=https://yoursite.com/jobs&buttonText=Find Jobs" 
  width="400px" 
  height="150"
  title="Job Search">
</iframe>
```

### Company Career Page
```html
<iframe 
  src="/embed/post-job?companyName=YourCompany&companyWebsite=https://yourcompany.com&theme=light&height=600" 
  width="100%" 
  height="600"
  title="Post a Job">
</iframe>
```

## API Integration

### Admin API Endpoints

#### Get All Embeds
```http
GET /api/admin/embeds
Authorization: Admin token required
```

#### Create New Embed
```http
POST /api/admin/embeds
Content-Type: application/json
Authorization: Admin token required

{
  "name": "Tech Jobs Widget",
  "type": "jobs", 
  "config": {
    "limit": 5,
    "category": "Technology",
    "theme": "light",
    "height": 400
  }
}
```

#### Delete Embed
```http
DELETE /api/admin/embeds?id=embed-uuid
Authorization: Admin token required
```

### Response Format

```json
{
  "embeds": [
    {
      "id": "uuid-here",
      "name": "Tech Jobs Widget",
      "type": "jobs",
      "config": {
        "limit": 5,
        "category": "Technology",
        "theme": "light",
        "height": 400
      },
      "createdAt": "2024-01-15T10:30:00Z",
      "createdBy": "admin@getgethired.com",
      "active": true,
      "embedCode": {
        "iframe": "<iframe src='...' ...></iframe>",
        "url": "https://yoursite.com/embed/jobs?...",
        "html": "<iframe ...>",
        "javascript": "(function() { ... })();"
      }
    }
  ]
}
```

## Monitoring and Analytics

### Data Logging
All embed-related activities are logged:
- Embed creation and deletion
- Widget access and usage
- Job postings through embed forms
- Error tracking and debugging

### Usage Tracking
Consider implementing analytics to track:
- Embed widget performance
- Job application conversion rates
- Most popular widget configurations
- External site usage patterns

## Best Practices

### For Widget Creators (Admins)
1. **Meaningful Names**: Use descriptive names for embeds
2. **Test Before Deploy**: Always preview widgets before sharing
3. **Theme Consistency**: Match widget theme to target site
4. **Size Optimization**: Choose appropriate dimensions for content
5. **Regular Cleanup**: Remove unused embeds periodically

### For External Sites (Implementers)
1. **Responsive Design**: Ensure widgets work on mobile devices
2. **Loading States**: Provide loading indicators while iframe loads
3. **Error Handling**: Handle cases where widget fails to load
4. **Performance**: Consider lazy loading for below-fold widgets
5. **Accessibility**: Ensure iframe has proper title and ARIA labels

## Troubleshooting

### Common Issues

1. **Widget Not Displaying**
   - Check if URL is correct and accessible
   - Verify parent site allows iframes
   - Check for CSP restrictions

2. **Styling Issues**
   - Verify theme parameter is correct
   - Check iframe dimensions
   - Consider parent site CSS conflicts

3. **Functionality Problems**
   - Confirm widget type is appropriate for use case
   - Check configuration parameters
   - Verify external links work correctly

4. **Performance Issues**
   - Optimize iframe dimensions
   - Consider caching strategies
   - Monitor network requests

### Debug Mode

For debugging, append `debug=true` to widget URLs to enable:
- Console logging
- Error display
- Performance metrics
- Configuration validation

## Future Enhancements

### Planned Features
1. **Widget Analytics**: Built-in usage analytics
2. **Advanced Styling**: Custom CSS injection options
3. **Real-time Updates**: WebSocket integration for live updates
4. **A/B Testing**: Built-in testing capabilities
5. **Widget Gallery**: Public gallery of widget examples

### Technical Improvements
1. **Database Storage**: Replace in-memory storage with database
2. **CDN Integration**: Serve widgets from CDN for better performance
3. **Widget Builder**: Visual drag-and-drop widget builder
4. **API Rate Limiting**: Implement rate limiting for embed endpoints
5. **Widget Versioning**: Support for widget version management

## Support and Maintenance

### Admin Access Required
- All embed management requires admin authentication
- Only admins can create, modify, or delete embeds
- Embed usage is tracked for security monitoring

### Regular Updates
- Widget code is updated with main application
- Security patches are automatically applied
- New features are added through admin panel

### Support Channels
- Admin panel includes built-in help and examples
- Documentation is maintained with code updates
- Contact support for custom widget requirements
