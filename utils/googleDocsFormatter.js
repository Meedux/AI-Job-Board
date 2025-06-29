/**
 * Google Docs HTML Content Formatter
 * Cleans and formats HTML content from Google Docs for better display
 */

import { colors, typography } from './designSystem';

export const formatGoogleDocsContent = (htmlContent) => {
  if (!htmlContent) return '';

  // Remove Google Docs specific styles and classes
  let cleanContent = htmlContent
    // Remove Google-specific styles and attributes
    .replace(/style="[^"]*"/gi, '')
    .replace(/class="[^"]*"/gi, '')
    .replace(/id="[^"]*"/gi, '')
    .replace(/<span[^>]*>/gi, '<span>')
    .replace(/<div[^>]*>/gi, '<div>')
    .replace(/<p[^>]*>/gi, '<p>')
    
    // Clean up empty elements
    .replace(/<p><\/p>/gi, '')
    .replace(/<div><\/div>/gi, '')
    .replace(/<span><\/span>/gi, '')
    .replace(/<br\s*\/?>\s*<br\s*\/?>/gi, '<br>')
    
    // Convert div elements to paragraphs for better spacing
    .replace(/<div>/gi, '<p>')
    .replace(/<\/div>/gi, '</p>')
    
    // Ensure proper line breaks
    .replace(/\n\s*\n/gi, '</p><p>')
    
    // Clean up multiple spaces
    .replace(/\s+/gi, ' ')
    
    // Remove empty paragraphs
    .replace(/<p>\s*<\/p>/gi, '')
    
    // Wrap orphaned text in paragraphs
    .replace(/^([^<][^<>]*[^>])$/gm, '<p>$1</p>');

  return cleanContent.trim();
};

export const applyGoogleDocsStyles = () => {
  return `
    .google-docs-content {
      /* Base text styling */
      color: ${colors.neutral.textSecondary.replace('text-', '')};
      line-height: 1.7;
      font-size: 1rem;
    }
    
    .google-docs-content p {
      margin-bottom: 1.25rem;
      color: rgb(209 213 219); /* text-gray-300 */
      line-height: 1.75;
    }
    
    .google-docs-content p:last-child {
      margin-bottom: 0;
    }
    
    .google-docs-content h1,
    .google-docs-content h2,
    .google-docs-content h3,
    .google-docs-content h4,
    .google-docs-content h5,
    .google-docs-content h6 {
      color: rgb(243 244 246); /* text-gray-100 */
      font-weight: 600;
      margin-top: 2rem;
      margin-bottom: 1rem;
      line-height: 1.4;
    }
    
    .google-docs-content h1 {
      font-size: 2rem;
      border-bottom: 2px solid rgb(55 65 81); /* border-gray-700 */
      padding-bottom: 0.75rem;
      margin-bottom: 1.5rem;
    }
    
    .google-docs-content h2 {
      font-size: 1.5rem;
      color: rgb(229 231 235); /* text-gray-200 */
    }
    
    .google-docs-content h3 {
      font-size: 1.25rem;
      color: rgb(229 231 235); /* text-gray-200 */
    }
    
    .google-docs-content h4 {
      font-size: 1.125rem;
      color: rgb(229 231 235); /* text-gray-200 */
    }
    
    .google-docs-content strong,
    .google-docs-content b {
      color: rgb(243 244 246); /* text-gray-100 */
      font-weight: 600;
    }
    
    .google-docs-content em,
    .google-docs-content i {
      color: rgb(229 231 235); /* text-gray-200 */
      font-style: italic;
    }
    
    .google-docs-content ul,
    .google-docs-content ol {
      margin-left: 1.5rem;
      margin-bottom: 1.25rem;
      color: rgb(209 213 219); /* text-gray-300 */
    }
    
    .google-docs-content ul {
      list-style-type: disc;
    }
    
    .google-docs-content ol {
      list-style-type: decimal;
    }
    
    .google-docs-content li {
      margin-bottom: 0.75rem;
      line-height: 1.75;
      padding-left: 0.25rem;
    }
    
    .google-docs-content li:last-child {
      margin-bottom: 0;
    }
    
    .google-docs-content a {
      color: rgb(96 165 250); /* text-blue-400 */
      text-decoration: underline;
      transition: color 0.2s ease;
    }
    
    .google-docs-content a:hover {
      color: rgb(147 197 253); /* text-blue-300 */
    }
    
    .google-docs-content blockquote {
      border-left: 4px solid rgb(37 99 235); /* border-blue-600 */
      padding-left: 1rem;
      margin: 1.5rem 0;
      font-style: italic;
      color: rgb(209 213 219); /* text-gray-300 */
      background: rgba(55, 65, 81, 0.3); /* bg-gray-700/30 */
      padding: 1rem;
      border-radius: 0.5rem;
    }
    
    .google-docs-content code {
      color: rgb(147 197 253); /* text-blue-300 */
      background: rgb(31 41 55); /* bg-gray-800 */
      padding: 0.125rem 0.375rem;
      border-radius: 0.25rem;
      font-family: 'Courier New', monospace;
      font-size: 0.875rem;
    }
    
    .google-docs-content pre {
      background: rgb(31 41 55); /* bg-gray-800 */
      border: 1px solid rgb(55 65 81); /* border-gray-700 */
      border-radius: 0.5rem;
      padding: 1rem;
      overflow-x: auto;
      margin: 1.5rem 0;
    }
    
    .google-docs-content pre code {
      background: transparent;
      padding: 0;
      color: rgb(209 213 219); /* text-gray-300 */
    }
    
    .google-docs-content hr {
      border: none;
      border-top: 1px solid rgb(55 65 81); /* border-gray-700 */
      margin: 2rem 0;
    }
    
    .google-docs-content table {
      width: 100%;
      border-collapse: collapse;
      margin: 1.5rem 0;
      border: 1px solid rgb(55 65 81); /* border-gray-700 */
      border-radius: 0.5rem;
      overflow: hidden;
    }
    
    .google-docs-content th,
    .google-docs-content td {
      border: 1px solid rgb(55 65 81); /* border-gray-700 */
      padding: 0.75rem;
      text-align: left;
    }
    
    .google-docs-content th {
      background: rgb(31 41 55); /* bg-gray-800 */
      color: rgb(229 231 235); /* text-gray-200 */
      font-weight: 600;
    }
    
    .google-docs-content td {
      color: rgb(209 213 219); /* text-gray-300 */
    }
    
    /* Responsive adjustments */
    @media (max-width: 640px) {
      .google-docs-content {
        font-size: 0.875rem;
      }
      
      .google-docs-content h1 {
        font-size: 1.5rem;
      }
      
      .google-docs-content h2 {
        font-size: 1.25rem;
      }
      
      .google-docs-content h3 {
        font-size: 1.125rem;
      }
      
      .google-docs-content ul,
      .google-docs-content ol {
        margin-left: 1rem;
      }
      
      .google-docs-content table {
        font-size: 0.75rem;
      }
      
      .google-docs-content th,
      .google-docs-content td {
        padding: 0.5rem;
      }
    }
  `;
};

export const createStyledJobDescription = (content) => {
  const formattedContent = formatGoogleDocsContent(content);
  
  return {
    content: formattedContent,
    styles: applyGoogleDocsStyles()
  };
};
