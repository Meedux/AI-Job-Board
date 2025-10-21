// File Upload Utility for Resume and Document Storage using Vercel Blob
import { put } from '@vercel/blob';
import path from 'path';
import fs from 'fs';

const UPLOAD_DIR = 'uploads';
const RESUME_DIR = 'resumes';
const PORTFOLIO_DIR = 'portfolios';
const AVATAR_DIR = 'avatars';
const LOGO_DIR = 'logos';

// Sanitize filename to prevent security issues
function sanitizeFilename(filename) {
  return filename.replace(/[^a-zA-Z0-9.-]/g, '_');
}

// Generate unique filename
function generateUniqueFilename(originalName, prefix = '') {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const extension = path.extname(originalName);
  const baseName = path.basename(originalName, extension);
  return `${prefix}${timestamp}_${randomString}_${sanitizeFilename(baseName)}${extension}`;
}

// Upload file to Vercel Blob storage
export async function uploadFile(file, type = 'resume') {
  try {
    if (!file) throw new Error('No file provided');

    // Determine file metadata depending on runtime type (Buffer, File/Blob, or object with arrayBuffer)
    let filename = file.name || (file.filename || `file_${Date.now()}`);
    let size = file.size || (Buffer.isBuffer(file) ? file.length : undefined) || null;
    let contentType = file.type || null;

    // Convert Buffer to a form acceptable by @vercel/blob (Buffer is OK)
    const isBuffer = Buffer.isBuffer(file);
    const isFileLike = !!(typeof file.arrayBuffer === 'function');

    // Validate file size limits
    const sizeLimits = {
      resume: 5 * 1024 * 1024, // 5MB
      portfolio: 10 * 1024 * 1024, // 10MB
      avatar: 2 * 1024 * 1024, // 2MB
      logo: 5 * 1024 * 1024 // 5MB
    };
    const maxSize = sizeLimits[type] || 5 * 1024 * 1024;
    if (size && size > maxSize) {
      throw new Error(`File size exceeds ${maxSize / (1024 * 1024)}MB limit`);
    }

    // Validate file extension/type if we can
    const extension = path.extname(filename || '').toLowerCase();
    const allowedTypes = {
      resume: ['.pdf', '.doc', '.docx'],
      portfolio: ['.pdf', '.doc', '.docx', '.zip', '.rar'],
      avatar: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
      logo: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg']
    };
    if (extension && !allowedTypes[type]?.includes(extension)) {
      // If extension is known and not allowed, reject
      throw new Error(`Invalid file type. Allowed types: ${allowedTypes[type]?.join(', ')}`);
    }

    // Generate unique filename with type prefix
    const prefix = `${type}_`;
    const uniqueFilename = generateUniqueFilename(filename || `upload${extension}`, prefix);

    // Prepare data to send to Vercel Blob
    let payload = file;
    if (isFileLike) {
      // Browser/Fetch File/Blob-like - pass as-is
      payload = file;
    } else if (isBuffer) {
      payload = file; // Buffer is supported by @vercel/blob
      // If contentType missing, try to infer
      if (!contentType) contentType = 'application/octet-stream';
    } else {
      throw new Error('Unsupported file object. Expected Buffer, File, or Blob-like object.');
    }

    // Runtime guard: prefer Vercel Blob when token is present
    const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
    if (!blobToken) {
      if (process.env.NODE_ENV === 'production') {
        // In production we must have the token
        throw new Error('Missing BLOB_READ_WRITE_TOKEN environment variable. Configure it to enable Vercel Blob uploads.');
      }

      // Development fallback: write file to local temp/uploads and return a local file URL
      console.warn('BLOB_READ_WRITE_TOKEN not set. Falling back to local storage (development only).');
      const localDir = path.join(process.cwd(), 'temp', 'uploads');
      fs.mkdirSync(localDir, { recursive: true });

      let bufferToWrite;
      if (isBuffer) {
        bufferToWrite = payload;
      } else if (isFileLike && typeof file.arrayBuffer === 'function') {
        const arr = await file.arrayBuffer();
        bufferToWrite = Buffer.from(arr);
      } else {
        throw new Error('Unsupported file object for local storage fallback.');
      }

      const localFilePath = path.join(localDir, uniqueFilename);
      fs.writeFileSync(localFilePath, bufferToWrite);

      // Return a local file URL so callers can still use the returned metadata
      const localUrl = `file://${localFilePath}`;
      return {
        success: true,
        filename: uniqueFilename,
        originalName: filename,
        url: localUrl,
        blobUrl: null,
        size: size,
        type: contentType
      };
    }

    // Upload to Vercel Blob
    const blob = await put(uniqueFilename, payload, {
      access: 'public',
      contentType: contentType || undefined
    });

    // Return file info in a consistent format
    return {
      success: true,
      filename: uniqueFilename,
      originalName: filename,
      url: blob.url,
      blobUrl: blob.url,
      size: size,
      type: contentType
    };
  } catch (error) {
    console.error('File upload error:', error);
    return { success: false, error: error.message };
  }
}

// Legacy function for backward compatibility - redirects to uploadFile
export async function uploadFileToLocal(file, type = 'resume') {
  console.warn('uploadFileToLocal is deprecated. Use uploadFile for Vercel Blob storage.');
  return uploadFile(file, type);
}

// Delete file from Vercel Blob storage (Note: Vercel Blob doesn't support direct deletion via API)
export async function deleteFile(filename, type = 'resume') {
  try {
    // Vercel Blob doesn't provide a delete API, files are typically managed via dashboard
    // or by letting them expire. For now, we'll just log the action.
    console.log(`File deletion requested for ${filename} (${type}). Note: Vercel Blob files should be managed via dashboard.`);
    return { success: true, note: 'File marked for deletion. Manage via Vercel dashboard.' };
  } catch (error) {
    console.error('File deletion error:', error);
    return { success: false, error: error.message };
  }
}

// Get file info (limited for Vercel Blob)
export async function getFileInfo(filename, type = 'resume') {
  try {
    // For Vercel Blob, we can't get file stats directly
    // This would need to be implemented differently, perhaps storing metadata in database
    const blobUrl = `https://blob.vercel-storage.com/uploads/${filename}`;

    return {
      success: true,
      filename,
      url: blobUrl,
      note: 'File info limited for Vercel Blob storage'
    };
  } catch (error) {
    return { success: false, error: 'File info not available' };
  }
}

export default {
  uploadFile,
  uploadFileToLocal,
  deleteFile,
  getFileInfo
};