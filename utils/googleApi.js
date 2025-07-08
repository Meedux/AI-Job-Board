// Google APIs integration utilities
import { google } from 'googleapis';

// Initialize Google Sheets API
export const getGoogleSheetsInstance = () => {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: [
      'https://www.googleapis.com/auth/spreadsheets',
      'https://www.googleapis.com/auth/documents.readonly',
    ],
  });

  return google.sheets({ version: 'v4', auth });
};

// Initialize Google Docs API
export const getGoogleDocsInstance = () => {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },    scopes: [
      'https://www.googleapis.com/auth/spreadsheets',
      'https://www.googleapis.com/auth/documents.readonly',
    ],
  });

  return google.docs({ version: 'v1', auth });
};

// Fetch data from Google Sheets
export const fetchSheetData = async (spreadsheetId, range) => {
  try {
    const sheets = getGoogleSheetsInstance();
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    return response.data.values || [];
  } catch (error) {
    console.error('Error fetching sheet data:', error);
    throw new Error('Failed to fetch sheet data');
  }
};

// Fetch content from Google Docs with preserved formatting
export const fetchDocContent = async (documentId) => {
  try {
    const docs = getGoogleDocsInstance();
    const response = await docs.documents.get({
      documentId,
    });

    // Extract and convert content to HTML with styling
    const content = response.data.body.content || [];
    return convertGoogleDocsToHTML(content);
  } catch (error) {
    console.error('Error fetching doc content:', error);
    throw new Error('Failed to fetch document content');
  }
};

// Convert Google Docs content to properly styled HTML
const convertGoogleDocsToHTML = (content) => {
  let html = '';
  let currentList = null;
  let listItems = [];
  let listStack = []; // Track nested lists
  let footnotes = [];

  content.forEach((element, index) => {
    if (element.paragraph) {
      const paragraph = element.paragraph;
      const bullet = paragraph.bullet;
      
      if (bullet) {
        // Handle nested lists
        const nestingLevel = bullet.nestingLevel || 0;
        const listId = bullet.listId;
        
        // Determine list type (ordered vs unordered)
        const isOrdered = bullet.textStyle?.fontFamily === 'Arial' || bullet.glyph?.includes('.');
        const listType = isOrdered ? 'ol' : 'ul';
        const listClass = isOrdered ? 'list-decimal' : 'list-disc';
        
        const listItem = convertParagraphToHTML(paragraph, true);
        
        // Handle list nesting
        while (listStack.length > nestingLevel + 1) {
          const closingList = listStack.pop();
          html += `</${closingList.type}>`;
        }
        
        if (listStack.length === nestingLevel) {
          // Start new list at this level
          const marginClass = nestingLevel > 0 ? ` ml-${nestingLevel * 6}` : ' ml-4';
          html += `<${listType} class="${listClass} list-inside mb-4 space-y-2${marginClass}">`;
          listStack.push({ type: listType, level: nestingLevel });
        }
        
        html += listItem;
        
        // Check if next element ends this list
        const nextElement = content[index + 1];
        const isLastElement = index === content.length - 1;
        const nextIsListItem = nextElement && nextElement.paragraph && nextElement.paragraph.bullet;
        const nextNestingLevel = nextIsListItem ? (nextElement.paragraph.bullet.nestingLevel || 0) : -1;
        
        if (!nextIsListItem || isLastElement || nextNestingLevel < nestingLevel) {
          // Close current level and any deeper levels
          while (listStack.length > nextNestingLevel + 1) {
            const closingList = listStack.pop();
            html += `</${closingList.type}>`;
          }
        }
      } else {
        // Close any open lists
        while (listStack.length > 0) {
          const closingList = listStack.pop();
          html += `</${closingList.type}>`;
        }
        
        // Regular paragraph
        html += convertParagraphToHTML(paragraph);
      }
    } else if (element.table) {
      html += convertTableToHTML(element.table);
    } else if (element.sectionBreak) {
      const breakType = element.sectionBreak.sectionStyle?.sectionType || 'CONTINUOUS';
      if (breakType === 'NEXT_PAGE') {
        html += '<div class="page-break my-8 border-t-2 border-gray-300"></div>';
      } else {
        html += '<div class="section-break my-6"></div>';
      }
    } else if (element.pageBreak) {
      html += '<div class="page-break my-8 border-t-2 border-gray-300"></div>';
    } else if (element.horizontalRule) {
      html += '<hr class="my-6 border-gray-300">';
    } else if (element.tableOfContents) {
      html += '<div class="toc mb-6 p-4 bg-gray-800 rounded-lg border"><h4 class="font-bold mb-2">Table of Contents</h4><div class="text-sm text-gray-600">[Table of Contents]</div></div>';
    }
  });

  // Close any remaining open lists
  while (listStack.length > 0) {
    const closingList = listStack.pop();
    html += `</${closingList.type}>`;
  }

  return html;
};

// Convert paragraph to HTML with styling
const convertParagraphToHTML = (paragraph, isListItem = false) => {
  if (!paragraph.elements || paragraph.elements.length === 0) {
    return isListItem ? '<li class="mb-2">&nbsp;</li>' : '<p class="mb-4">&nbsp;</p>';
  }

  let paragraphHTML = '';
  
  // Get paragraph-level styling
  const paragraphStyle = paragraph.paragraphStyle || {};
  const alignment = paragraphStyle.alignment || 'START';
  const spaceAbove = paragraphStyle.spaceAbove?.magnitude || 0;
  const spaceBelow = paragraphStyle.spaceBelow?.magnitude || 0;
  const lineSpacing = paragraphStyle.lineSpacing || 1.15;
  const indentFirstLine = paragraphStyle.indentFirstLine?.magnitude || 0;
  const indentStart = paragraphStyle.indentStart?.magnitude || 0;
  const indentEnd = paragraphStyle.indentEnd?.magnitude || 0;
  const keepWithNext = paragraphStyle.keepWithNext;
  const keepTogether = paragraphStyle.keepTogether;
  const direction = paragraphStyle.direction || 'LEFT_TO_RIGHT';
  
  // Convert paragraph style to CSS classes
  let paragraphClass = 'mb-4 leading-relaxed text-gray-300';
  let paragraphStyle_inline = '';
  
  // Text alignment
  if (alignment === 'CENTER') paragraphClass += ' text-center';
  else if (alignment === 'END') paragraphClass += ' text-right';
  else if (alignment === 'JUSTIFIED') paragraphClass += ' text-justify';
  else paragraphClass += ' text-left';
  
  // Direction (RTL support)
  if (direction === 'RIGHT_TO_LEFT') {
    paragraphClass += ' rtl';
    paragraphStyle_inline += ' direction: rtl;';
  }
  
  // Spacing
  if (spaceAbove > 12) paragraphClass += ' mt-8';
  else if (spaceAbove > 6) paragraphClass += ' mt-6';
  else if (spaceAbove > 3) paragraphClass += ' mt-4';
  else if (spaceAbove > 0) paragraphClass += ' mt-2';
  
  if (spaceBelow > 12) paragraphClass += ' mb-8';
  else if (spaceBelow > 6) paragraphClass += ' mb-6';
  else if (spaceBelow > 3) paragraphClass += ' mb-4';
  
  // Line spacing
  if (lineSpacing >= 2.0) paragraphClass += ' leading-loose';
  else if (lineSpacing >= 1.5) paragraphClass += ' leading-relaxed';
  else if (lineSpacing >= 1.15) paragraphClass += ' leading-normal';
  else paragraphClass += ' leading-tight';
  
  // Indentation
  if (indentFirstLine > 0) {
    paragraphStyle_inline += ` text-indent: ${indentFirstLine}pt;`;
  }
  if (indentStart > 0) {
    paragraphClass += ` ml-${Math.min(Math.floor(indentStart / 18), 12)}`;
  }
  if (indentEnd > 0) {
    paragraphClass += ` mr-${Math.min(Math.floor(indentEnd / 18), 12)}`;
  }
  
  // Check if this is a heading based on named style
  const namedStyleType = paragraphStyle.namedStyleType;
  let tagName = isListItem ? 'li' : 'p';
  let headingClass = '';
  
  if (!isListItem) {
    switch (namedStyleType) {
      case 'HEADING_1':
        tagName = 'h1';
        headingClass = ' text-4xl font-bold text-gray-100 mt-8 mb-6 leading-tight';
        break;
      case 'HEADING_2':
        tagName = 'h2';
        headingClass = ' text-3xl font-bold text-gray-100 mt-7 mb-5 leading-tight';
        break;
      case 'HEADING_3':
        tagName = 'h3';
        headingClass = ' text-2xl font-bold text-gray-100 mt-6 mb-4 leading-tight';
        break;
      case 'HEADING_4':
        tagName = 'h4';
        headingClass = ' text-xl font-bold text-gray-100 mt-5 mb-3 leading-tight';
        break;
      case 'HEADING_5':
        tagName = 'h5';
        headingClass = ' text-lg font-bold text-gray-100 mt-4 mb-3 leading-tight';
        break;
      case 'HEADING_6':
        tagName = 'h6';
        headingClass = ' text-base font-bold text-gray-100 mt-4 mb-2 leading-tight';
        break;
      case 'SUBTITLE':
        headingClass = ' text-xl font-medium text-gray-200 mt-2 mb-4 italic';
        break;
      case 'TITLE':
        tagName = 'h1';
        headingClass = ' text-5xl font-bold text-gray-100 mt-8 mb-6 text-center leading-tight';
        break;
    }
  }

  // Check for bullet lists
  const bullet = paragraph.bullet;
  if (bullet && !isListItem) {
    const listId = bullet.listId;
    const nestingLevel = bullet.nestingLevel || 0;
    
    // For now, treat all bullets as unordered lists
    const listItemContent = processTextElements(paragraph.elements);
    const indentClass = nestingLevel > 0 ? ` ml-${nestingLevel * 6}` : '';
    return `<li class="text-gray-300 leading-relaxed mb-2${indentClass}">${listItemContent}</li>`;
  }

  // Process each text run in the paragraph
  paragraphHTML = processTextElements(paragraph.elements);

  // Handle special paragraph types
  if (namedStyleType === 'NORMAL_TEXT' && paragraphHTML.trim() === '') {
    // Empty paragraph for spacing
    paragraphHTML = '&nbsp;';
  }

  // Wrap in appropriate tag with styling
  const finalClass = (paragraphClass + headingClass).trim();
  const classAttr = finalClass ? ` class="${finalClass}"` : '';
  const styleAttr = paragraphStyle_inline ? ` style="${paragraphStyle_inline}"` : '';
  
  return `<${tagName}${classAttr}${styleAttr}>${paragraphHTML}</${tagName}>`;
};

// Process text elements within a paragraph
const processTextElements = (elements) => {
  let html = '';
  
  elements.forEach((element) => {
    if (element.textRun) {
      const textRun = element.textRun;
      const content = textRun.content;
      const textStyle = textRun.textStyle || {};

      // Build inline styles for this text run
      let spanStyle = '';
      let spanClass = 'text-gray-300';
      let textHTML = content;

      // Handle special characters and whitespace preservation
      textHTML = textHTML
        .replace(/\n/g, '<br>')
        .replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;')
        .replace(/  /g, '&nbsp;&nbsp;'); // Preserve multiple spaces

      // Font family
      if (textStyle.fontFamily) {
        const fontFamily = textStyle.fontFamily.toLowerCase();
        if (fontFamily.includes('courier') || fontFamily.includes('mono')) {
          spanClass += ' font-mono';
        } else if (fontFamily.includes('serif') || fontFamily.includes('times')) {
          spanClass += ' font-serif';
        } else {
          spanClass += ' font-sans';
        }
      }

      // Font weight
      if (textStyle.bold) {
        spanClass += ' font-bold';
      }
      if (textStyle.weightedFontFamily && textStyle.weightedFontFamily.weight >= 600) {
        spanClass += ' font-semibold';
      }

      // Font style
      if (textStyle.italic) {
        spanClass += ' italic';
      }

      // Text decoration
      if (textStyle.underline) {
        spanClass += ' underline';
      }
      if (textStyle.strikethrough) {
        spanClass += ' line-through';
      }

      // Font size with more granular control
      if (textStyle.fontSize && textStyle.fontSize.magnitude) {
        const fontSize = textStyle.fontSize.magnitude;
        if (fontSize >= 28) spanClass += ' text-4xl';
        else if (fontSize >= 24) spanClass += ' text-3xl';
        else if (fontSize >= 20) spanClass += ' text-2xl';
        else if (fontSize >= 18) spanClass += ' text-xl';
        else if (fontSize >= 16) spanClass += ' text-lg';
        else if (fontSize >= 14) spanClass += ' text-base';
        else if (fontSize >= 12) spanClass += ' text-sm';
        else if (fontSize >= 10) spanClass += ' text-xs';
        else spanClass += ' text-xs';
      }

      // Text color with dark mode support
      if (textStyle.foregroundColor && textStyle.foregroundColor.color) {
        const color = textStyle.foregroundColor.color;
        if (color.rgbColor) {
          const { red = 0, green = 0, blue = 0 } = color.rgbColor;
          const r = Math.round(red * 255);
          const g = Math.round(green * 255);
          const b = Math.round(blue * 255);
          
          // Check if it's a dark color that needs to be lightened for dark mode
          const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
          if (luminance < 0.5) {
            // Dark color - lighten it for dark mode
            const lightenFactor = 0.7;
            const lightR = Math.min(255, Math.round(r + (255 - r) * lightenFactor));
            const lightG = Math.min(255, Math.round(g + (255 - g) * lightenFactor));
            const lightB = Math.min(255, Math.round(b + (255 - b) * lightenFactor));
            spanStyle += `color: rgb(${lightR}, ${lightG}, ${lightB});`;
          } else {
            spanStyle += `color: rgb(${r}, ${g}, ${b});`;
          }
        }
      }

      // Background color with transparency support
      if (textStyle.backgroundColor && textStyle.backgroundColor.color) {
        const color = textStyle.backgroundColor.color;
        if (color.rgbColor) {
          const { red = 0, green = 0, blue = 0 } = color.rgbColor;
          const r = Math.round(red * 255);
          const g = Math.round(green * 255);
          const b = Math.round(blue * 255);
          spanStyle += `background-color: rgba(${r}, ${g}, ${b}, 0.8); padding: 2px 4px; border-radius: 3px; margin: 0 1px;`;
        }
      }

      // Baseline offset (superscript/subscript)
      if (textStyle.baselineOffset) {
        const offset = textStyle.baselineOffset;
        if (offset === 'SUPERSCRIPT') {
          spanClass += ' align-super text-xs';
        } else if (offset === 'SUBSCRIPT') {
          spanClass += ' align-sub text-xs';
        }
      }

      // Small caps
      if (textStyle.smallCaps) {
        spanStyle += 'font-variant: small-caps;';
      }

      // Letter spacing
      if (textStyle.letterSpacing && textStyle.letterSpacing.magnitude) {
        const spacing = textStyle.letterSpacing.magnitude;
        if (spacing > 2) spanClass += ' tracking-widest';
        else if (spacing > 1) spanClass += ' tracking-wider';
        else if (spacing > 0.5) spanClass += ' tracking-wide';
        else if (spacing < -1) spanClass += ' tracking-tighter';
        else if (spacing < -0.5) spanClass += ' tracking-tight';
      }

      // Text transform
      if (textStyle.textTransform) {
        const transform = textStyle.textTransform;
        if (transform === 'UPPERCASE') spanClass += ' uppercase';
        else if (transform === 'LOWERCASE') spanClass += ' lowercase';
        else if (transform === 'CAPITALIZE') spanClass += ' capitalize';
      }

      // Links with enhanced styling
      if (textStyle.link) {
        const url = textStyle.link.url || textStyle.link.headingId || '#';
        const isExternal = url.startsWith('http') && !url.includes(window?.location?.hostname);
        const target = isExternal ? ' target="_blank" rel="noopener noreferrer"' : '';
        const linkClass = 'text-blue-400 hover:text-blue-300 underline decoration-2 underline-offset-2 transition-colors duration-200';
        textHTML = `<a href="${url}" class="${linkClass}"${target}>${content}</a>`;
      }
      // Code formatting
      else if (textStyle.fontFamily && textStyle.fontFamily.toLowerCase().includes('mono')) {
        spanClass += ' bg-gray-800 px-2 py-1 rounded text-sm border border-gray-600';
        textHTML = `<code class="${spanClass.trim()}"${spanStyle ? ` style="${spanStyle}"` : ''}>${content}</code>`;
      }
      // Regular text with styling
      else if (spanClass !== 'text-gray-300' || spanStyle) {
        const styleAttr = spanStyle ? ` style="${spanStyle}"` : '';
        textHTML = `<span class="${spanClass.trim()}"${styleAttr}>${textHTML}</span>`;
      }

      html += textHTML;
    } 
    else if (element.inlineObjectElement) {
      // Handle inline images, equations, drawings, etc.
      const inlineObject = element.inlineObjectElement;
      const objectId = inlineObject.inlineObjectId;
      
      // You could fetch the actual object details here if needed
      // For now, provide a placeholder
      html += `<span class="inline-object bg-gray-700 text-gray-300 px-3 py-1 rounded border border-gray-600 text-sm mx-1">[📎 Embedded Object]</span>`;
    }
    else if (element.autoText) {
      // Handle auto text like page numbers, dates, etc.
      const autoText = element.autoText;
      const textStyle = autoText.textStyle || {};
      
      let autoContent = '';
      switch (autoText.type) {
        case 'PAGE_NUMBER':
          autoContent = '[Page Number]';
          break;
        case 'PAGE_COUNT':
          autoContent = '[Page Count]';
          break;
        default:
          autoContent = '[Auto Text]';
      }
      
      html += `<span class="auto-text text-gray-400 text-sm italic">${autoContent}</span>`;
    }
    else if (element.columnBreak) {
      html += '<div class="column-break my-4 border-l-2 border-gray-400 pl-4"></div>';
    }
    else if (element.footnoteReference) {
      // Handle footnotes
      const footnoteId = element.footnoteReference.footnoteId;
      html += `<sup class="footnote-ref text-blue-400 hover:text-blue-300 cursor-pointer text-xs">[${footnoteId}]</sup>`;
    }
    else if (element.equation) {
      // Handle mathematical equations
      html += `<span class="equation bg-gray-800 px-2 py-1 rounded border border-gray-600 text-sm font-mono text-gray-300">[📐 Math Equation]</span>`;
    }
  });
  
  return html;
};

// Convert table to HTML with comprehensive styling
const convertTableToHTML = (table) => {
  if (!table.tableRows || table.tableRows.length === 0) {
    return '<div class="empty-table text-gray-500 text-center py-4">[Empty Table]</div>';
  }

  let tableHTML = '<div class="table-container overflow-x-auto my-6 rounded-lg border border-gray-600">';
  tableHTML += '<table class="min-w-full bg-gray-800 divide-y divide-gray-600">';
  
  // Get table style
  const tableStyle = table.tableStyle || {};
  const borderWidth = tableStyle.borderWidth || 1;
  const borderColor = 'border-gray-600';
  
  table.tableRows.forEach((row, rowIndex) => {
    const isHeaderRow = rowIndex === 0;
    const rowStyle = row.tableRowStyle || {};
    const minRowHeight = rowStyle.minRowHeight?.magnitude || 'auto';
    
    tableHTML += '<tr class="divide-x divide-gray-600">';
    
    row.tableCells?.forEach((cell, cellIndex) => {
      const cellStyle = cell.tableCellStyle || {};
      const backgroundColor = cellStyle.backgroundColor?.color?.rgbColor;
      const borderStyle = cellStyle.borderStyle || {};
      const paddingTop = cellStyle.paddingTop?.magnitude || 8;
      const paddingBottom = cellStyle.paddingBottom?.magnitude || 8;
      const paddingLeft = cellStyle.paddingLeft?.magnitude || 12;
      const paddingRight = cellStyle.paddingRight?.magnitude || 12;
      const columnSpan = cell.columnSpan || 1;
      const rowSpan = cell.rowSpan || 1;
      
      const tag = isHeaderRow ? 'th' : 'td';
      let cellClass = `px-4 py-3 text-left`;
      let cellStyleAttr = '';
      
      if (isHeaderRow) {
        cellClass += ' bg-gray-700 font-semibold text-gray-100 text-sm uppercase tracking-wider';
      } else {
        cellClass += ' bg-gray-800 text-gray-300';
      }
      
      // Handle background color
      if (backgroundColor) {
        const { red = 0, green = 0, blue = 0 } = backgroundColor;
        const r = Math.round(red * 255);
        const g = Math.round(green * 255);
        const b = Math.round(blue * 255);
        cellStyleAttr += `background-color: rgba(${r}, ${g}, ${b}, 0.3);`;
      }
      
      // Handle padding
      if (paddingTop !== 8 || paddingBottom !== 8 || paddingLeft !== 12 || paddingRight !== 12) {
        cellStyleAttr += `padding: ${paddingTop}pt ${paddingRight}pt ${paddingBottom}pt ${paddingLeft}pt;`;
      }
      
      // Handle alignment
      if (cellStyle.contentAlignment) {
        const alignment = cellStyle.contentAlignment;
        if (alignment === 'CONTENT_ALIGNMENT_CENTER') {
          cellClass += ' text-center';
        } else if (alignment === 'CONTENT_ALIGNMENT_RIGHT') {
          cellClass += ' text-right';
        }
      }
      
      const colSpanAttr = columnSpan > 1 ? ` colspan="${columnSpan}"` : '';
      const rowSpanAttr = rowSpan > 1 ? ` rowspan="${rowSpan}"` : '';
      const styleAttr = cellStyleAttr ? ` style="${cellStyleAttr}"` : '';
      
      tableHTML += `<${tag} class="${cellClass}"${colSpanAttr}${rowSpanAttr}${styleAttr}>`;
      
      // Convert cell content
      if (cell.content && cell.content.length > 0) {
        tableHTML += convertGoogleDocsToHTML(cell.content);
      } else {
        tableHTML += '&nbsp;';
      }
      
      tableHTML += `</${tag}>`;
    });
    tableHTML += '</tr>';
  });
  
  tableHTML += '</table></div>';
  return tableHTML;
};

// Convert sheet rows to job objects with new structure
export const convertContentSheetToJobs = (rows) => {
  if (!rows || rows.length === 0) return [];

  // Expected headers: Job Title, Slug, Content, From Salary, To Salary, Job location, Remote, Level, Type of job, Posted Time, Expire Time, Link to apply, Company Name, Company Logo, Company Website, Categories
  const headers = rows[0];
  const jobs = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.length === 0) continue; // Skip empty rows

    const job = {
      // Use slug as the unique identifier
      id: row[1] || `job-${i}`, // Slug column
      slug: row[1] || `job-${i}`, // Slug column
      title: row[0] || '', // Job Title
      content_doc_url: row[2] || '', // Content (Google Docs URL)
      salary: {
        from: row[3] || '', // From Salary
        to: row[4] || '', // To Salary
        range: row[3] && row[4] ? `${row[3]} - ${row[4]}` : (row[3] || row[4] || '')
      },
      location: row[5] || '', // Job location
      remote: row[6] || '', // Remote
      level: row[7] || '', // Level
      type: row[8] || '', // Type of job
      posted_time: row[9] || '', // Posted Time
      expire_time: row[10] || '', // Expire Time
      apply_link: row[11] || '', // Link to apply
      company: {
        name: row[12] || '', // Company Name
        logo: row[13] || '', // Company Logo
        website: row[14] || '', // Company Website
      },
      categories: row[15] ? row[15].split(',').map(cat => cat.trim()) : [], // Categories
      
      // Additional computed fields
      company_name: row[12] || '', // For backward compatibility
      company_logo: row[13] || '', // For backward compatibility
      postedAt: row[9] || '', // For backward compatibility
    };

    jobs.push(job);
  }

  return jobs;
};

// Extract Google Doc ID from URL
export const extractDocIdFromUrl = (url) => {
  if (!url) return null;
  
  // Handle different Google Docs URL formats
  const patterns = [
    /\/document\/d\/([a-zA-Z0-9-_]+)/, // Standard format
    /\/d\/([a-zA-Z0-9-_]+)/, // Shortened format
    /^([a-zA-Z0-9-_]+)$/ // Just the ID
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  
  return null;
};

// Process jobs and fetch additional content from Google Docs
export const processJobsWithDocContent = async (jobs) => {
  const processedJobs = [];

  for (const job of jobs) {
    const processedJob = { ...job };

    // Check if job has a Google Doc URL for content
    if (job.content_doc_url) {
      const docId = extractDocIdFromUrl(job.content_doc_url);
      if (docId) {
        try {
          const docContent = await fetchDocContent(docId);
          processedJob.full_description = docContent;
          processedJob.description = docContent.substring(0, 300) + '...'; // Short description
        } catch (error) {
          console.error(`Failed to fetch doc content for job ${job.slug}:`, error);
          processedJob.full_description = 'Content not available';
          processedJob.description = 'Content not available';
        }
      } else {
        console.warn(`Invalid Google Docs URL for job ${job.slug}:`, job.content_doc_url);
        processedJob.full_description = 'Invalid content URL';
        processedJob.description = 'Invalid content URL';
      }
    } else {
      processedJob.full_description = 'No content provided';
      processedJob.description = 'No content provided';
    }

    processedJobs.push(processedJob);
  }

  return processedJobs;
};

// Utility to check if a job is expired
export const isJobExpired = (expireTime) => {
  if (!expireTime) return false;
  
  try {
    const expireDate = new Date(expireTime);
    const now = new Date();
    return expireDate < now;
  } catch (error) {
    return false; // If date parsing fails, assume not expired
  }
};

// Filter jobs based on criteria
export const filterJobs = (jobs, filters = {}) => {
  let filteredJobs = [...jobs];

  // Filter out expired jobs by default
  if (filters.includeExpired !== true) {
    filteredJobs = filteredJobs.filter(job => !isJobExpired(job.expire_time));
  }

  // Search filter
  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    filteredJobs = filteredJobs.filter(job => 
      job.title?.toLowerCase().includes(searchLower) ||
      job.company?.name?.toLowerCase().includes(searchLower) ||
      job.company_name?.toLowerCase().includes(searchLower) ||
      job.description?.toLowerCase().includes(searchLower) ||
      job.categories?.some(cat => cat.toLowerCase().includes(searchLower))
    );
  }

  // Location filter
  if (filters.location) {
    const locationLower = filters.location.toLowerCase();
    filteredJobs = filteredJobs.filter(job => 
      job.location?.toLowerCase().includes(locationLower) ||
      (filters.location.toLowerCase() === 'remote' && job.remote?.toLowerCase() === 'yes')
    );
  }

  // Job type filter
  if (filters.type) {
    filteredJobs = filteredJobs.filter(job => 
      job.type?.toLowerCase() === filters.type.toLowerCase()
    );
  }

  // Level filter
  if (filters.level) {
    filteredJobs = filteredJobs.filter(job => 
      job.level?.toLowerCase() === filters.level.toLowerCase()
    );
  }

  // Category filter
  if (filters.category) {
    filteredJobs = filteredJobs.filter(job => 
      job.categories?.some(cat => 
        cat.toLowerCase() === filters.category.toLowerCase()
      )
    );
  }
  // Remote filter
  if (filters.remote) {
    filteredJobs = filteredJobs.filter(job => 
      job.remote?.toLowerCase() === 'yes'
    );
  }

  return filteredJobs;
};

// Sort jobs based on the provided sort option
export const sortJobs = (jobs, sortBy) => {
  if (!sortBy) return jobs;

  const sortedJobs = [...jobs];

  switch (sortBy) {
    case 'to_salary':
      // Sort by salary ascending (lowest first)
      return sortedJobs.sort((a, b) => {
        const salaryA = parseSalary(a.salary) || 0;
        const salaryB = parseSalary(b.salary) || 0;
        return salaryA - salaryB;
      });
    
    case '-to_salary':
      // Sort by salary descending (highest first)
      return sortedJobs.sort((a, b) => {
        const salaryA = parseSalary(a.salary) || 0;
        const salaryB = parseSalary(b.salary) || 0;
        return salaryB - salaryA;
      });
    
    case 'job_title':
      // Sort by job title ascending (A-Z)
      return sortedJobs.sort((a, b) => 
        (a.title || '').localeCompare(b.title || '')
      );
    
    case '-job_title':
      // Sort by job title descending (Z-A)
      return sortedJobs.sort((a, b) => 
        (b.title || '').localeCompare(a.title || '')
      );
    
    case 'job_location':
      // Sort by location ascending (A-Z)
      return sortedJobs.sort((a, b) => 
        (a.location || '').localeCompare(b.location || '')
      );
    
    case '-job_location':
      // Sort by location descending (Z-A)
      return sortedJobs.sort((a, b) => 
        (b.location || '').localeCompare(a.location || '')
      );
    
    case 'remote':
      // Sort by remote status (remote jobs first)
      return sortedJobs.sort((a, b) => {
        const remoteA = a.remote?.toLowerCase() === 'yes' ? 1 : 0;
        const remoteB = b.remote?.toLowerCase() === 'yes' ? 1 : 0;
        return remoteB - remoteA;
      });
    
    case '-remote':
      // Sort by remote status (on-site jobs first)
      return sortedJobs.sort((a, b) => {
        const remoteA = a.remote?.toLowerCase() === 'yes' ? 1 : 0;
        const remoteB = b.remote?.toLowerCase() === 'yes' ? 1 : 0;
        return remoteA - remoteB;
      });
    
    default:
      return jobs;
  }
};

// Helper function to parse salary strings for sorting
const parseSalary = (salaryStr) => {
  if (!salaryStr) return 0;
  
  // Remove currency symbols and extract numbers
  const cleanSalary = salaryStr.toString().replace(/[^\d.-]/g, '');
  const salary = parseFloat(cleanSalary);
  
  // Handle common salary formats (K = thousand, M = million)
  if (salaryStr.toLowerCase().includes('k')) {
    return salary * 1000;
  } else if (salaryStr.toLowerCase().includes('m')) {
    return salary * 1000000;
  }
  
  return isNaN(salary) ? 0 : salary;
};

// User Sheet Functions
// Expected headers: UID, Full Name, Nickname, Email, Age, Date of Birth, Full Address

// Add a new user to the User sheet
export const addUserToSheet = async (spreadsheetId, userData) => {
  console.log('📊 Adding user to Google Sheets...');
  console.log('📋 Spreadsheet ID:', spreadsheetId);
  console.log('👤 User data:', { ...userData, hashedPassword: '[HIDDEN]' });
  
  try {
    const sheets = getGoogleSheetsInstance();
    
    // Values to append: [UID, Full Name, Nickname, Email, Age, Date of Birth, Full Address]
    const values = [
      userData.uid,
      userData.fullName,
      userData.nickname,
      userData.email,
      userData.age,
      userData.dateOfBirth,
      userData.fullAddress,
      userData.password
    ];

    console.log('📝 Values to append:', values);

    const response = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'User!A:H', // Assuming User sheet exists with columns A-G
      valueInputOption: 'RAW',
      requestBody: {
        values: [values],
      },
    });

    console.log('✅ Google Sheets response:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error adding user to sheet:', error);
    console.error('❌ Error details:', {
      message: error.message,
      stack: error.stack,
      code: error.code
    });
    throw new Error('Failed to add user to sheet');
  }
};

// Get user by email from User sheet
export const getUserByEmail = async (spreadsheetId, email) => {
  console.log('🔍 Getting user by email:', email);
  console.log('📋 Spreadsheet ID:', spreadsheetId);
  
  try {
    const rows = await fetchSheetData(spreadsheetId, 'User!A:H');
    console.log('📊 Fetched rows:', rows?.length || 0);
    
    if (!rows || rows.length === 0) {
      console.log('📄 No data found in User sheet');
      return null;
    }
    
    // Expected headers: UID, Full Name, Nickname, Email, Age, Date of Birth, Full Address
    const headers = rows[0];
    console.log('📑 Headers:', headers);
    const emailIndex = headers.indexOf('Email');
    console.log('📧 Email column index:', emailIndex);
    
    if (emailIndex === -1) {
      console.log('❌ Email column not found in headers');
      return null;
    }

    // Find user by email
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (row[emailIndex] && row[emailIndex].toLowerCase() === email.toLowerCase()) {
        const user = {
          uid: row[0] || '',
          fullName: row[1] || '',
          nickname: row[2] || '',
          email: row[3] || '',
          age: row[4] || '',
          dateOfBirth: row[5] || '',
          fullAddress: row[6] || '',
          password: row[7] || '' 
        };
        console.log('✅ User found:', user);
        return user;
      }
    }
    
    console.log('👤 User not found');
    return null;
  } catch (error) {
    console.error('❌ Error getting user by email:', error);
    console.error('❌ Error details:', {
      message: error.message,
      stack: error.stack,
      code: error.code
    });
    throw new Error('Failed to get user');
  }
};

// Get user by UID from User sheet
export const getUserByUID = async (spreadsheetId, uid) => {
  try {
    const rows = await fetchSheetData(spreadsheetId, 'User!A:G');
    
    if (!rows || rows.length === 0) return null;
    
    // Find user by UID (first column)
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (row[0] === uid) {
        return {
          uid: row[0] || '',
          fullName: row[1] || '',
          nickname: row[2] || '',
          email: row[3] || '',
          age: row[4] || '',
          dateOfBirth: row[5] || '',
          fullAddress: row[6] || '',
          password: row[7] || '' 
        };
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error getting user by UID:', error);
    throw new Error('Failed to get user');
  }
};

// Add job to Google Sheets (Content A:P)
export const addJobToSheet = async (jobData) => {
  try {
    const sheets = getGoogleSheetsInstance();
    const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;
    
    if (!spreadsheetId) {
      throw new Error('Google Sheet ID not configured');
    }

    // Append job data to the "Content" sheet
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Content!A:P', // Columns A through P
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: [jobData], // jobData should be an array with 16 elements (A-P)
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error adding job to sheet:', error);
    throw new Error('Failed to add job to sheet');
  }
};
