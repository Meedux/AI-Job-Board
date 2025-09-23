// File Upload Utility for Resume and Document Storage
import { promises as fs } from 'fs';
import path from 'path';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');
const RESUME_DIR = path.join(UPLOAD_DIR, 'resumes');
const PORTFOLIO_DIR = path.join(UPLOAD_DIR, 'portfolios');

// Ensure upload directories exist
async function ensureDirectoryExists(dirPath) {
  try {
    await fs.access(dirPath);
  } catch {
    await fs.mkdir(dirPath, { recursive: true });
  }
}

// Sanitize filename to prevent security issues
function sanitizeFilename(filename) {
  return filename.replace(/[^a-zA-Z0-9.-]/g, '_');
}

// Generate unique filename
function generateUniqueFilename(originalName) {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const extension = path.extname(originalName);
  const baseName = path.basename(originalName, extension);
  return `${timestamp}_${randomString}_${sanitizeFilename(baseName)}${extension}`;
}

// Upload file to local storage
export async function uploadFile(file, type = 'resume') {
  try {
    // Validate file
    if (!file || !(file instanceof File)) {
      throw new Error('Invalid file provided');
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new Error('File size exceeds 10MB limit');
    }

    // Validate file type
    const allowedTypes = {
      resume: ['.pdf', '.doc', '.docx'],
      portfolio: ['.pdf', '.doc', '.docx', '.zip', '.rar']
    };

    const fileExtension = path.extname(file.name).toLowerCase();
    if (!allowedTypes[type]?.includes(fileExtension)) {
      throw new Error(`Invalid file type. Allowed types: ${allowedTypes[type]?.join(', ')}`);
    }

    // Ensure directories exist
    await ensureDirectoryExists(UPLOAD_DIR);
    await ensureDirectoryExists(type === 'resume' ? RESUME_DIR : PORTFOLIO_DIR);

    // Generate unique filename
    const uniqueFilename = generateUniqueFilename(file.name);
    const targetDir = type === 'resume' ? RESUME_DIR : PORTFOLIO_DIR;
    const filePath = path.join(targetDir, uniqueFilename);

    // Convert file to buffer and save
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await fs.writeFile(filePath, buffer);

    // Return file info
    const publicUrl = `/uploads/${type === 'resume' ? 'resumes' : 'portfolios'}/${uniqueFilename}`;
    
    return {
      success: true,
      filename: uniqueFilename,
      originalName: file.name,
      url: publicUrl,
      size: file.size,
      type: file.type,
      path: filePath
    };

  } catch (error) {
    console.error('File upload error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Delete file from storage
export async function deleteFile(filename, type = 'resume') {
  try {
    const targetDir = type === 'resume' ? RESUME_DIR : PORTFOLIO_DIR;
    const filePath = path.join(targetDir, filename);
    
    await fs.unlink(filePath);
    return { success: true };
  } catch (error) {
    console.error('File deletion error:', error);
    return { success: false, error: error.message };
  }
}

// Get file info
export async function getFileInfo(filename, type = 'resume') {
  try {
    const targetDir = type === 'resume' ? RESUME_DIR : PORTFOLIO_DIR;
    const filePath = path.join(targetDir, filename);
    
    const stats = await fs.stat(filePath);
    const publicUrl = `/uploads/${type === 'resume' ? 'resumes' : 'portfolios'}/${filename}`;
    
    return {
      success: true,
      filename,
      url: publicUrl,
      size: stats.size,
      createdAt: stats.birthtime,
      modifiedAt: stats.mtime
    };
  } catch (error) {
    return { success: false, error: 'File not found' };
  }
}

export default {
  uploadFile,
  deleteFile,
  getFileInfo
};