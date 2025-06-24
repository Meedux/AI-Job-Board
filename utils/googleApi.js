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

  content.forEach((element, index) => {
    if (element.paragraph) {
      const paragraph = element.paragraph;
      const bullet = paragraph.bullet;
      
      if (bullet) {
        // This is a list item
        const listItem = convertParagraphToHTML(paragraph);
        listItems.push(listItem);
        
        // Check if next element is also a list item or if this is the last element
        const nextElement = content[index + 1];
        const isLastElement = index === content.length - 1;
        const nextIsListItem = nextElement && nextElement.paragraph && nextElement.paragraph.bullet;
        
        if (!nextIsListItem || isLastElement) {
          // End of list, wrap all items
          html += '<ul class="list-disc list-inside mb-4 ml-4 space-y-1">';
          html += listItems.join('');
          html += '</ul>';
          listItems = [];
        }
      } else {
        // Regular paragraph
        html += convertParagraphToHTML(paragraph);
      }
    } else if (element.table) {
      html += convertTableToHTML(element.table);
    } else if (element.sectionBreak) {
      html += '<br class="section-break">';
    }
  });

  return html;
};

// Convert paragraph to HTML with styling
const convertParagraphToHTML = (paragraph) => {
  if (!paragraph.elements || paragraph.elements.length === 0) {
    return '<p class="mb-4">&nbsp;</p>';
  }

  let paragraphHTML = '';
  
  // Get paragraph-level styling
  const paragraphStyle = paragraph.paragraphStyle || {};
  const alignment = paragraphStyle.alignment || 'START';
  const spaceAbove = paragraphStyle.spaceAbove?.magnitude || 0;
  const spaceBelow = paragraphStyle.spaceBelow?.magnitude || 0;
  const lineSpacing = paragraphStyle.lineSpacing || 1.15;
  
  // Convert paragraph style to CSS classes
  let paragraphClass = 'mb-4 leading-relaxed';
  
  if (alignment === 'CENTER') paragraphClass += ' text-center';
  else if (alignment === 'END') paragraphClass += ' text-right';
  else if (alignment === 'JUSTIFIED') paragraphClass += ' text-justify';
  
  if (spaceAbove > 6) paragraphClass += ' mt-6';
  else if (spaceAbove > 0) paragraphClass += ' mt-2';
  
  if (spaceBelow > 6) paragraphClass += ' mb-6';
  
  // Check if this is a heading based on named style
  const namedStyleType = paragraphStyle.namedStyleType;
  let tagName = 'p';
  let headingClass = '';
  
  switch (namedStyleType) {
    case 'HEADING_1':
      tagName = 'h1';
      headingClass = ' text-3xl font-bold text-gray-200 mt-8 mb-4';
      break;
    case 'HEADING_2':
      tagName = 'h2';
      headingClass = ' text-2xl font-bold text-gray-200 mt-6 mb-3';
      break;
    case 'HEADING_3':
      tagName = 'h3';
      headingClass = ' text-xl font-bold text-gray-200 mt-5 mb-3';
      break;
    case 'HEADING_4':
      tagName = 'h4';
      headingClass = ' text-lg font-bold text-gray-200 mt-4 mb-2';
      break;
    case 'HEADING_5':
      tagName = 'h5';
      headingClass = ' text-base font-bold text-gray-200 mt-4 mb-2';
      break;
    case 'HEADING_6':
      tagName = 'h6';
      headingClass = ' text-sm font-bold text-gray-200 mt-3 mb-2';
      break;
  }

  // Check for bullet lists
  const bullet = paragraph.bullet;
  if (bullet) {
    const listId = bullet.listId;
    const nestingLevel = bullet.nestingLevel || 0;
    
    // For now, treat all bullets as unordered lists
    // In a more complete implementation, you'd track list types
    const listItemContent = processTextElements(paragraph.elements);
    const indentClass = nestingLevel > 0 ? ` ml-${nestingLevel * 4}` : '';
    return `<li class="text-gray-200 leading-relaxed${indentClass}">${listItemContent}</li>`;
  }

  // Process each text run in the paragraph
  paragraphHTML = processTextElements(paragraph.elements);

  // Wrap in appropriate tag with styling
  const finalClass = (paragraphClass + headingClass).trim();
  const classAttr = finalClass ? ` class="${finalClass}"` : '';
  
  return `<${tagName}${classAttr}>${paragraphHTML}</${tagName}>`;
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
      let spanClass = '';
      let textHTML = content;

      // Font weight
      if (textStyle.bold) {
        spanClass += ' font-bold';
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

      // Font size
      if (textStyle.fontSize && textStyle.fontSize.magnitude) {
        const fontSize = textStyle.fontSize.magnitude;
        if (fontSize >= 18) spanClass += ' text-lg';
        else if (fontSize >= 16) spanClass += ' text-base';
        else if (fontSize >= 14) spanClass += ' text-sm';
        else if (fontSize <= 10) spanClass += ' text-xs';
      }

      // Text color
      if (textStyle.foregroundColor && textStyle.foregroundColor.color) {
        const color = textStyle.foregroundColor.color;
        if (color.rgbColor) {
          const { red = 0, green = 0, blue = 0 } = color.rgbColor;
          const r = Math.round(red * 255);
          const g = Math.round(green * 255);
          const b = Math.round(blue * 255);
          spanStyle += `color: rgb(${r}, ${g}, ${b});`;
        }
      }

      // Background color
      if (textStyle.backgroundColor && textStyle.backgroundColor.color) {
        const color = textStyle.backgroundColor.color;
        if (color.rgbColor) {
          const { red = 0, green = 0, blue = 0 } = color.rgbColor;
          const r = Math.round(red * 255);
          const g = Math.round(green * 255);
          const b = Math.round(blue * 255);
          spanStyle += `background-color: rgb(${r}, ${g}, ${b}); padding: 2px 4px; border-radius: 2px;`;
        }
      }

      // Links
      if (textStyle.link) {
        const url = textStyle.link.url || textStyle.link.headingId || '#';
        textHTML = `<a href="${url}" class="text-blue-600 hover:text-blue-800 underline" target="_blank" rel="noopener noreferrer">${content}</a>`;
      } else if (spanClass || spanStyle) {
        const styleAttr = spanStyle ? ` style="${spanStyle}"` : '';
        textHTML = `<span class="${spanClass.trim()}"${styleAttr}>${content}</span>`;
      }

      html += textHTML;
    } else if (element.inlineObjectElement) {
      // Handle inline images or other objects
      html += `<span class="inline-object text-gray-500">[Image/Object]</span>`;
    }
  });
  
  return html;
};

// Convert table to HTML (basic implementation)
const convertTableToHTML = (table) => {
  let tableHTML = '<div class="overflow-x-auto my-6"><table class="min-w-full border-collapse border border-gray-300">';
  
  table.tableRows?.forEach((row, rowIndex) => {
    tableHTML += '<tr>';
    row.tableCells?.forEach((cell, cellIndex) => {
      const isHeader = rowIndex === 0;
      const tag = isHeader ? 'th' : 'td';
      const cellClass = isHeader 
        ? 'border border-gray-300 px-4 py-2 bg-gray-50 font-semibold text-left'
        : 'border border-gray-300 px-4 py-2';
      
      tableHTML += `<${tag} class="${cellClass}">`;
      
      // Convert cell content
      if (cell.content) {
        tableHTML += convertGoogleDocsToHTML(cell.content);
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
      href: `/job/${row[1] || `job-${i}`}`, // Generate href from slug
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
