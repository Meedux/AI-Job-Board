import { NextResponse } from 'next/server';
import { getUserFromRequest } from '../../../../utils/auth';
import { logAdminActivity, logAPIRequest, logError, getRequestInfo } from '../../../../utils/dataLogger';
import { v4 as uuidv4 } from 'uuid';

// In-memory storage for embed configurations (in production, use database)
let embedConfigs = [
  {
    id: 'demo-job-list',
    name: 'Demo Job Listings',
    type: 'jobs',
    config: {
      limit: 5,
      theme: 'light',
      showLogo: true,
      height: 400,
      category: '',
      location: ''
    },
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    createdBy: 'admin@getgethired.com',
    active: true
  },
  {
    id: 'demo-search',
    name: 'Demo Search Widget',
    type: 'search',
    config: {
      theme: 'light',
      showLogo: true,
      height: 120,
      width: '100%',
      redirectUrl: '/'
    },
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
    createdBy: 'admin@getgethired.com',
    active: true
  }
];

// Admin configuration
const adminEmails = [
  'admin@getgethired.com',
  'support@getgethired.com',
];

const adminDomains = [
  'getgethired.com'
];

const isAdmin = (email) => {
  if (!email) return false;
  const emailLower = email.toLowerCase();
  const domain = emailLower.split('@')[1];
  return adminEmails.includes(emailLower) || adminDomains.includes(domain);
};

// Generate embed code
const generateEmbedCode = (config, baseUrl) => {
  const { type, id } = config;
  const params = new URLSearchParams(config.config);
  const embedUrl = `${baseUrl}/embed/${type}?${params.toString()}`;
  
  const iframe = `<iframe 
  src="${embedUrl}" 
  width="${config.config.width || '100%'}" 
  height="${config.config.height || '400'}" 
  frameborder="0" 
  scrolling="auto"
  title="${config.name}"
  style="border: 1px solid #e5e7eb; border-radius: 8px;">
</iframe>`;

  return {
    iframe,
    url: embedUrl,
    html: iframe,
    javascript: `
// JavaScript embed code
(function() {
  var iframe = document.createElement('iframe');
  iframe.src = '${embedUrl}';
  iframe.width = '${config.config.width || '100%'}';
  iframe.height = '${config.config.height || '400'}';
  iframe.frameBorder = '0';
  iframe.scrolling = 'auto';
  iframe.title = '${config.name}';
  iframe.style = 'border: 1px solid #e5e7eb; border-radius: 8px;';
  
  // Insert into element with id 'getgethired-widget'
  var container = document.getElementById('getgethired-widget');
  if (container) {
    container.appendChild(iframe);
  }
})();`
  };
};

export async function GET(request) {
  const startTime = Date.now();
  const { userAgent, ipAddress } = getRequestInfo(request);
  let userId = null;
  
  try {
    // Log API request
    await logAPIRequest('GET', '/api/admin/embeds', null, ipAddress);
    
    // Verify user authentication
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    userId = user.id;

    // Check if user is admin
    if (!isAdmin(user.email)) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    // Log admin activity
    await logAdminActivity(
      user.email,
      'VIEW_EMBEDS',
      'admin_embeds',
      'Admin viewed embed configurations',
      null,
      ipAddress
    );

    // Get base URL for embed code generation
    const protocol = request.headers.get('x-forwarded-proto') || 'http';
    const host = request.headers.get('host');
    const baseUrl = `${protocol}://${host}`;

    // Generate embed codes for each config
    const embedsWithCodes = embedConfigs.map(config => ({
      ...config,
      embedCode: generateEmbedCode(config, baseUrl)
    }));

    // Log successful API response
    const responseTime = Date.now() - startTime;
    await logAPIRequest(
      'GET',
      '/api/admin/embeds',
      userId,
      ipAddress,
      200,
      responseTime
    );

    return NextResponse.json({
      embeds: embedsWithCodes
    }, { status: 200 });

  } catch (error) {
    console.error('Error fetching embeds:', error);
    
    // Log error
    await logError(
      'ADMIN_EMBEDS_ERROR',
      'admin/embeds',
      error.message,
      error.stack,
      userId,
      null,
      'error'
    );
    
    // Log failed API response
    const responseTime = Date.now() - startTime;
    await logAPIRequest(
      'GET',
      '/api/admin/embeds',
      userId,
      ipAddress,
      500,
      responseTime
    );
    
    return NextResponse.json(
      { error: 'Failed to fetch embeds' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  const startTime = Date.now();
  const { userAgent, ipAddress } = getRequestInfo(request);
  let userId = null;

  try {
    // Log API request
    await logAPIRequest('POST', '/api/admin/embeds', null, ipAddress);

    // Verify user authentication
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    userId = user.id;

    // Check if user is admin
    if (!isAdmin(user.email)) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, type, config } = body;

    // Validate required fields
    if (!name || !type || !config) {
      return NextResponse.json(
        { error: 'Name, type, and config are required' },
        { status: 400 }
      );
    }

    // Validate type
    if (!['jobs', 'search', 'post-job'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid embed type' },
        { status: 400 }
      );
    }

    // Create new embed configuration
    const newEmbed = {
      id: uuidv4(),
      name,
      type,
      config,
      createdAt: new Date(),
      createdBy: user.email,
      active: true
    };

    embedConfigs.push(newEmbed);

    // Log admin activity
    await logAdminActivity(
      user.email,
      'CREATE_EMBED',
      'admin_embeds',
      `Admin created embed: ${name}`,
      { embedId: newEmbed.id, type, name },
      ipAddress
    );

    // Generate embed code
    const protocol = request.headers.get('x-forwarded-proto') || 'http';
    const host = request.headers.get('host');
    const baseUrl = `${protocol}://${host}`;
    
    const embedWithCode = {
      ...newEmbed,
      embedCode: generateEmbedCode(newEmbed, baseUrl)
    };

    // Log successful API response
    const responseTime = Date.now() - startTime;
    await logAPIRequest(
      'POST',
      '/api/admin/embeds',
      userId,
      ipAddress,
      201,
      responseTime
    );

    return NextResponse.json({
      embed: embedWithCode
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating embed:', error);
    
    // Log error
    await logError(
      'ADMIN_CREATE_EMBED_ERROR',
      'admin/embeds',
      error.message,
      error.stack,
      userId,
      null,
      'error'
    );
    
    // Log failed API response
    const responseTime = Date.now() - startTime;
    await logAPIRequest(
      'POST',
      '/api/admin/embeds',
      userId,
      ipAddress,
      500,
      responseTime
    );
    
    return NextResponse.json(
      { error: 'Failed to create embed' },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  const startTime = Date.now();
  const { userAgent, ipAddress } = getRequestInfo(request);
  let userId = null;

  try {
    // Log API request
    await logAPIRequest('DELETE', '/api/admin/embeds', null, ipAddress);

    // Verify user authentication
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    userId = user.id;

    // Check if user is admin
    if (!isAdmin(user.email)) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const embedId = searchParams.get('id');

    if (!embedId) {
      return NextResponse.json(
        { error: 'Embed ID is required' },
        { status: 400 }
      );
    }

    // Find and remove embed
    const embedIndex = embedConfigs.findIndex(embed => embed.id === embedId);
    if (embedIndex === -1) {
      return NextResponse.json(
        { error: 'Embed not found' },
        { status: 404 }
      );
    }

    const deletedEmbed = embedConfigs[embedIndex];
    embedConfigs.splice(embedIndex, 1);

    // Log admin activity
    await logAdminActivity(
      user.email,
      'DELETE_EMBED',
      'admin_embeds',
      `Admin deleted embed: ${deletedEmbed.name}`,
      { embedId, name: deletedEmbed.name },
      ipAddress
    );

    // Log successful API response
    const responseTime = Date.now() - startTime;
    await logAPIRequest(
      'DELETE',
      '/api/admin/embeds',
      userId,
      ipAddress,
      200,
      responseTime
    );

    return NextResponse.json({
      success: true,
      message: 'Embed deleted successfully'
    }, { status: 200 });

  } catch (error) {
    console.error('Error deleting embed:', error);
    
    // Log error
    await logError(
      'ADMIN_DELETE_EMBED_ERROR',
      'admin/embeds',
      error.message,
      error.stack,
      userId,
      null,
      'error'
    );
    
    // Log failed API response
    const responseTime = Date.now() - startTime;
    await logAPIRequest(
      'DELETE',
      '/api/admin/embeds',
      userId,
      ipAddress,
      500,
      responseTime
    );
    
    return NextResponse.json(
      { error: 'Failed to delete embed' },
      { status: 500 }
    );
  }
}
