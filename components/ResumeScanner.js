'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  FileText, 
  Search, 
  Star, 
  Download, 
  Filter,
  Zap,
  Brain,
  User,
  CheckCircle,
  AlertCircle,
  Eye,
  BarChart3,
  Target,
  Award,
  TrendingUp,
  Calendar,
  Mail,
  Phone,
  MapPin,
  Clock,
  X,
  Settings,
  Sparkles,
  Plus
} from 'lucide-react';

export default function ResumeScanner() {
  const [mode, setMode] = useState('manual'); // 'manual' or 'ai'
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResults, setScanResults] = useState([]);
  const [criteria, setCriteria] = useState({
    skillsWeight: 30,
    experienceWeight: 25,
    educationWeight: 20,
    keywordWeight: 15,
    locationWeight: 10
  });
  const [showCriteria, setShowCriteria] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await fetch('/api/jobs');
      if (response.ok) {
        const data = await response.json();
        setJobs(data.jobs || []);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
    }
  };

  const handleFileUpload = async (files) => {
    const newFiles = Array.from(files);
    setIsScanning(true);

    try {
      const uploadPromises = newFiles.map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/resume/parse', {
          method: 'POST',
          body: formData
        });

        if (response.ok) {
          const result = await response.json();
          return {
            id: result.parsedResumeId,
            file: file,
            name: file.name,
            size: file.size,
            parsedData: result.structuredData,
            qualityScore: result.qualityScore,
            completenessScore: result.completenessScore,
            status: 'parsed',
            uploadedAt: new Date().toISOString()
          };
        } else {
          const error = await response.json();
          return {
            id: Date.now() + Math.random(),
            file: file,
            name: file.name,
            size: file.size,
            status: 'error',
            error: error.details || 'Failed to parse resume',
            uploadedAt: new Date().toISOString()
          };
        }
      });

      const results = await Promise.all(uploadPromises);
      setUploadedFiles(prev => [...prev, ...results]);
      
      // Auto-scan if job is selected
      if (selectedJob) {
        await performBulkScan(results.filter(r => r.status === 'parsed'));
      }
    } catch (error) {
      console.error('Error uploading files:', error);
    } finally {
      setIsScanning(false);
    }
  };

  const performBulkScan = async (filesToScan = null) => {
    const files = filesToScan || uploadedFiles.filter(f => f.status === 'parsed');
    if (!selectedJob || files.length === 0) return;

    setIsScanning(true);
    
    try {
      const scanPromises = files.map(async (file) => {
        const response = await fetch('/api/resume/scan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            resumeId: file.id,
            jobId: selectedJob.id,
            scanType: mode,
            customCriteria: criteria
          })
        });

        if (response.ok) {
          const result = await response.json();
          return {
            ...result.scanResult,
            fileName: file.name,
            uploadedAt: file.uploadedAt
          };
        } else {
          console.error('Scan failed for file:', file.name);
          return null;
        }
      });

      const results = await Promise.all(scanPromises);
      const validResults = results.filter(Boolean);
      
      // Sort by overall match score
      validResults.sort((a, b) => b.overallMatch - a.overallMatch);
      
      setScanResults(validResults);
    } catch (error) {
      console.error('Error scanning resumes:', error);
    } finally {
      setIsScanning(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    handleFileUpload(files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const exportResults = async () => {
    try {
      const csvContent = generateCSV(scanResults);
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `resume-scan-results-${selectedJob?.title || 'results'}-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting results:', error);
    }
  };

  const generateCSV = (results) => {
    const headers = [
      'Candidate Name',
      'Email',
      'File Name',
      'Overall Match %',
      'Skills Match %',
      'Experience Match %',
      'Education Match %',
      'Keyword Match %',
      'Experience Years',
      'Experience Level',
      'Matched Skills',
      'Missing Skills',
      'AI Recommendation',
      'AI Reasoning',
      'Upload Date'
    ];

    const rows = results.map(result => [
      result.resumeInfo?.candidateName || 'Unknown',
      result.resumeInfo?.email || '',
      result.fileName || '',
      result.overallMatch,
      result.skillsMatch,
      result.experienceMatch,
      result.educationMatch,
      result.keywordMatch,
      result.resumeInfo?.experienceYears || 0,
      result.resumeInfo?.experienceLevel || '',
      result.matchedSkills?.join('; ') || '',
      result.missingSkills?.join('; ') || '',
      result.aiRecommendation || '',
      result.aiReasoning || '',
      new Date(result.uploadedAt).toLocaleDateString()
    ]);

    return [headers, ...rows].map(row => 
      row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
    ).join('\n');
  };

  const getMatchColor = (score) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getRecommendationColor = (recommendation) => {
    switch (recommendation) {
      case 'recommend': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'maybe': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'reject': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Resume Scanner</h1>
                <p className="text-gray-400">AI-powered resume analysis and job matching</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowCriteria(!showCriteria)}
                className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2"
              >
                <Settings className="w-4 h-4" />
                <span>Criteria</span>
              </button>
              {scanResults.length > 0 && (
                <button
                  onClick={exportResults}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors flex items-center space-x-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Export Results</span>
                </button>
              )}
            </div>
          </div>

          {/* Mode Toggle */}
          <div className="flex items-center space-x-4">
            <span className="text-gray-400 text-sm">Scanning Mode:</span>
            <div className="flex bg-gray-800 rounded-lg p-1">
              <button
                onClick={() => setMode('manual')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  mode === 'manual'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <User className="w-4 h-4 inline mr-2" />
                Manual
              </button>
              <button
                onClick={() => setMode('ai')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  mode === 'ai'
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Brain className="w-4 h-4 inline mr-2" />
                AI Powered
              </button>
            </div>
          </div>
        </div>

        {/* Criteria Configuration */}
        {showCriteria && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-8 p-6 bg-gray-800 rounded-xl border border-gray-700"
          >
            <h3 className="text-lg font-semibold text-white mb-4">Scoring Criteria Weights</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {Object.entries(criteria).map(([key, value]) => (
                <div key={key} className="space-y-2">
                  <label className="text-sm text-gray-400 capitalize">
                    {key.replace('Weight', '')} ({value}%)
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    value={value}
                    onChange={(e) => setCriteria(prev => ({ ...prev, [key]: parseInt(e.target.value) }))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              ))}
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Panel - Job Selection & File Upload */}
          <div className="space-y-6">
            {/* Job Selection */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4">Select Job Position</h3>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {jobs.map((job) => (
                  <div
                    key={job.id}
                    onClick={() => setSelectedJob(job)}
                    className={`p-4 rounded-lg cursor-pointer transition-colors border ${
                      selectedJob?.id === job.id
                        ? 'bg-blue-600/20 border-blue-500/50 text-blue-300'
                        : 'bg-gray-700/50 border-gray-600 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    <div className="font-medium">{job.title}</div>
                    <div className="text-sm text-gray-400">{job.company?.name || 'Company'}</div>
                    <div className="text-xs text-gray-500 mt-1">{job.location}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* File Upload */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4">Upload Resumes</h3>
              
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  isDragging
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-gray-600 hover:border-gray-500'
                }`}
              >
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-300 mb-2">Drag and drop resumes here</p>
                <p className="text-gray-500 text-sm mb-4">Supports PDF, DOC, DOCX, TXT files</p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors"
                >
                  Choose Files
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={(e) => handleFileUpload(e.target.files)}
                  className="hidden"
                />
              </div>

              {/* Uploaded Files */}
              {uploadedFiles.length > 0 && (
                <div className="mt-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-white">Uploaded Files ({uploadedFiles.length})</h4>
                    {selectedJob && (
                      <button
                        onClick={() => performBulkScan()}
                        disabled={isScanning}
                        className="px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-500 transition-colors disabled:opacity-50"
                      >
                        {isScanning ? 'Scanning...' : 'Scan All'}
                      </button>
                    )}
                  </div>
                  <div className="max-h-64 overflow-y-auto space-y-2">
                    {uploadedFiles.map((file) => (
                      <div
                        key={file.id}
                        className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <FileText className="w-5 h-5 text-blue-400" />
                          <div>
                            <div className="text-sm text-white">{file.name}</div>
                            <div className="text-xs text-gray-400">{formatFileSize(file.size)}</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {file.status === 'parsed' && (
                            <CheckCircle className="w-5 h-5 text-green-400" />
                          )}
                          {file.status === 'error' && (
                            <AlertCircle className="w-5 h-5 text-red-400" />
                          )}
                          {file.qualityScore && (
                            <div className="text-xs bg-blue-600/20 text-blue-300 px-2 py-1 rounded">
                              {file.qualityScore}%
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Scan Results */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">
                  Scan Results {scanResults.length > 0 && `(${scanResults.length})`}
                </h3>
                {isScanning && (
                  <div className="flex items-center space-x-2 text-blue-400">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-400 border-t-transparent"></div>
                    <span className="text-sm">Scanning resumes...</span>
                  </div>
                )}
              </div>

              {!selectedJob ? (
                <div className="text-center py-12">
                  <Target className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400">Select a job position to start scanning resumes</p>
                </div>
              ) : scanResults.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400">
                    {uploadedFiles.length === 0 
                      ? "Upload resumes to see scan results"
                      : "Click 'Scan All' to analyze uploaded resumes"
                    }
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {scanResults.map((result, index) => (
                    <motion.div
                      key={result.id || index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-gray-700/50 rounded-xl p-6 border border-gray-600"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <div className="text-2xl font-bold text-white">#{index + 1}</div>
                            <div className={`text-2xl font-bold ${getMatchColor(result.overallMatch)}`}>
                              {result.overallMatch}%
                            </div>
                          </div>
                          <div>
                            <h4 className="text-lg font-semibold text-white">
                              {result.resumeInfo?.candidateName || 'Unknown Candidate'}
                            </h4>
                            <p className="text-gray-400 text-sm">{result.fileName}</p>
                          </div>
                        </div>
                        {result.aiRecommendation && (
                          <div className={`px-3 py-1 rounded-full text-sm border ${getRecommendationColor(result.aiRecommendation)}`}>
                            {result.aiRecommendation?.toUpperCase()}
                          </div>
                        )}
                      </div>

                      {/* Contact Info */}
                      {(result.resumeInfo?.email || result.resumeInfo?.phone) && (
                        <div className="flex items-center space-x-4 mb-4 text-sm text-gray-400">
                          {result.resumeInfo?.email && (
                            <div className="flex items-center space-x-1">
                              <Mail className="w-4 h-4" />
                              <span>{result.resumeInfo.email}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Score Breakdown */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="text-center">
                          <div className={`text-lg font-semibold ${getMatchColor(result.skillsMatch)}`}>
                            {result.skillsMatch}%
                          </div>
                          <div className="text-xs text-gray-400">Skills</div>
                        </div>
                        <div className="text-center">
                          <div className={`text-lg font-semibold ${getMatchColor(result.experienceMatch)}`}>
                            {result.experienceMatch}%
                          </div>
                          <div className="text-xs text-gray-400">Experience</div>
                        </div>
                        <div className="text-center">
                          <div className={`text-lg font-semibold ${getMatchColor(result.educationMatch)}`}>
                            {result.educationMatch}%
                          </div>
                          <div className="text-xs text-gray-400">Education</div>
                        </div>
                        <div className="text-center">
                          <div className={`text-lg font-semibold ${getMatchColor(result.keywordMatch)}`}>
                            {result.keywordMatch}%
                          </div>
                          <div className="text-xs text-gray-400">Keywords</div>
                        </div>
                      </div>

                      {/* Skills Analysis */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        {result.matchedSkills?.length > 0 && (
                          <div>
                            <div className="text-sm font-medium text-green-400 mb-2">
                              Matched Skills ({result.matchedSkills.length})
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {result.matchedSkills.slice(0, 5).map((skill, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs"
                                >
                                  {skill}
                                </span>
                              ))}
                              {result.matchedSkills.length > 5 && (
                                <span className="px-2 py-1 bg-gray-600 text-gray-300 rounded text-xs">
                                  +{result.matchedSkills.length - 5} more
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        {result.missingSkills?.length > 0 && (
                          <div>
                            <div className="text-sm font-medium text-red-400 mb-2">
                              Missing Skills ({result.missingSkills.length})
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {result.missingSkills.slice(0, 5).map((skill, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs"
                                >
                                  {skill}
                                </span>
                              ))}
                              {result.missingSkills.length > 5 && (
                                <span className="px-2 py-1 bg-gray-600 text-gray-300 rounded text-xs">
                                  +{result.missingSkills.length - 5} more
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* AI Reasoning */}
                      {result.aiReasoning && (
                        <div className="bg-gray-800/50 rounded-lg p-4">
                          <div className="text-sm font-medium text-purple-400 mb-2">AI Analysis</div>
                          <p className="text-sm text-gray-300">{result.aiReasoning}</p>
                          {result.aiKeyPoints?.length > 0 && (
                            <ul className="mt-2 space-y-1">
                              {result.aiKeyPoints.map((point, idx) => (
                                <li key={idx} className="text-xs text-gray-400 flex items-center space-x-2">
                                  <span className="w-1 h-1 bg-purple-400 rounded-full"></span>
                                  <span>{point}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
