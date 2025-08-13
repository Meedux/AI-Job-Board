'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Download, 
  Star, 
  MapPin, 
  Calendar, 
  Mail, 
  Phone, 
  Briefcase, 
  GraduationCap,
  Award,
  Languages,
  Eye,
  Heart,
  MessageSquare,
  MoreHorizontal,
  ChevronDown,
  X,
  Zap,
  Brain,
  Sparkles,
  Users,
  TrendingUp,
  Clock,
  FileText,
  CheckCircle,
  AlertTriangle,
  User
} from 'lucide-react';

const SEARCH_TYPES = {
  basic: {
    label: 'Basic Search',
    description: 'Free keyword and location search',
    icon: Search,
    color: 'blue',
    features: ['Keyword search', 'Location filter', 'Basic sorting']
  },
  power: {
    label: 'Power Search',
    description: 'Advanced filters and criteria',
    icon: Zap,
    color: 'yellow',
    features: ['All basic features', 'Skills filtering', 'Experience range', 'Education filter', 'Quality score filter']
  },
  ai: {
    label: 'AI Search',
    description: 'Intelligent matching with ML',
    icon: Brain,
    color: 'purple',
    features: ['All power features', 'AI-powered ranking', 'Semantic search', 'Smart recommendations']
  }
};

const EXPERIENCE_LEVELS = ['entry', 'junior', 'mid', 'senior', 'executive'];
const EDUCATION_LEVELS = ['High School', 'Bachelor', 'Master', 'PhD', 'Diploma', 'Certificate'];
const AVAILABILITY_OPTIONS = ['immediate', '2_weeks', '1_month', 'negotiable'];

export default function ResumeDatabaseSearch() {
  const [searchType, setSearchType] = useState('basic');
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    location: '',
    skills: [],
    experienceLevel: '',
    minExperience: '',
    maxExperience: '',
    education: '',
    minQualityScore: '',
    availability: '',
    tags: []
  });
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    totalCount: 0,
    totalPages: 0
  });
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedCandidates, setSelectedCandidates] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [skillSuggestions, setSkillSuggestions] = useState([]);

  useEffect(() => {
    if (searchTerm || Object.values(filters).some(f => f && (Array.isArray(f) ? f.length > 0 : true))) {
      performSearch();
    }
  }, [searchTerm, filters, sortBy, sortOrder, pagination.page]);

  const performSearch = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        search: searchTerm,
        searchType: searchType,
        sortBy: sortBy,
        sortOrder: sortOrder,
        page: pagination.page.toString(),
        limit: pagination.limit.toString()
      });

      // Add filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value && (Array.isArray(value) ? value.length > 0 : true)) {
          if (Array.isArray(value)) {
            params.append(key, value.join(','));
          } else {
            params.append(key, value);
          }
        }
      });

      const response = await fetch(`/api/resume/database?${params}`);
      if (response.ok) {
        const data = await response.json();
        setResults(data.data.resumes);
        setPagination(data.data.pagination);
      } else {
        console.error('Search failed');
        setResults([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const addSkillFilter = (skill) => {
    if (!filters.skills.includes(skill)) {
      handleFilterChange('skills', [...filters.skills, skill]);
    }
  };

  const removeSkillFilter = (skill) => {
    handleFilterChange('skills', filters.skills.filter(s => s !== skill));
  };

  const toggleCandidateSelection = (candidateId) => {
    setSelectedCandidates(prev => 
      prev.includes(candidateId)
        ? prev.filter(id => id !== candidateId)
        : [...prev, candidateId]
    );
  };

  const selectAllCandidates = () => {
    setSelectedCandidates(results.map(r => r.id));
  };

  const clearSelection = () => {
    setSelectedCandidates([]);
  };

  const exportSelected = async () => {
    if (selectedCandidates.length === 0) return;

    try {
      const response = await fetch('/api/resume/database', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'export',
          resumeIds: selectedCandidates
        })
      });

      if (response.ok) {
        const data = await response.json();
        const csvContent = generateCSV(data.exportData);
        downloadCSV(csvContent, `candidates-export-${new Date().toISOString().split('T')[0]}.csv`);
      }
    } catch (error) {
      console.error('Export error:', error);
    }
  };

  const generateCSV = (data) => {
    if (!data || data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const rows = data.map(row => 
      headers.map(header => `"${String(row[header] || '').replace(/"/g, '""')}"`).join(',')
    );
    
    return [headers.join(','), ...rows].join('\n');
  };

  const downloadCSV = (content, filename) => {
    const blob = new Blob([content], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getSearchTypeColor = (type) => {
    const colors = {
      basic: 'blue',
      power: 'yellow', 
      ai: 'purple'
    };
    return colors[type] || 'gray';
  };

  const getQualityScoreColor = (score) => {
    if (score >= 80) return 'text-green-400 bg-green-500/20';
    if (score >= 60) return 'text-yellow-400 bg-yellow-500/20';
    return 'text-red-400 bg-red-500/20';
  };

  const getExperienceColor = (level) => {
    const colors = {
      entry: 'text-gray-400 bg-gray-500/20',
      junior: 'text-blue-400 bg-blue-500/20',
      mid: 'text-green-400 bg-green-500/20',
      senior: 'text-purple-400 bg-purple-500/20',
      executive: 'text-red-400 bg-red-500/20'
    };
    return colors[level] || 'text-gray-400 bg-gray-500/20';
  };

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-green-600 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Resume Database Search</h1>
                <p className="text-gray-400">Find the perfect candidates with advanced search capabilities</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {selectedCandidates.length > 0 && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-400">{selectedCandidates.length} selected</span>
                  <button
                    onClick={exportSelected}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-500 transition-colors flex items-center space-x-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Export</span>
                  </button>
                  <button
                    onClick={clearSelection}
                    className="px-3 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Clear
                  </button>
                </div>
              )}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2"
              >
                <Filter className="w-4 h-4" />
                <span>Filters</span>
              </button>
            </div>
          </div>

          {/* Search Type Selection */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {Object.entries(SEARCH_TYPES).map(([key, type]) => {
              const Icon = type.icon;
              const isSelected = searchType === key;
              const colorClass = `${type.color}-500`;
              
              return (
                <div
                  key={key}
                  onClick={() => setSearchType(key)}
                  className={`p-4 rounded-xl cursor-pointer transition-all border-2 ${
                    isSelected
                      ? `bg-${type.color}-500/20 border-${type.color}-500/50`
                      : 'bg-gray-800 border-gray-700 hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center space-x-3 mb-3">
                    <Icon className={`w-6 h-6 ${isSelected ? `text-${type.color}-400` : 'text-gray-400'}`} />
                    <div>
                      <div className={`font-semibold ${isSelected ? `text-${type.color}-300` : 'text-white'}`}>
                        {type.label}
                      </div>
                      <div className="text-sm text-gray-400">{type.description}</div>
                    </div>
                  </div>
                  <ul className="space-y-1">
                    {type.features.map((feature, idx) => (
                      <li key={idx} className="text-xs text-gray-500 flex items-center space-x-2">
                        <CheckCircle className="w-3 h-3" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>

          {/* Main Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={`Search candidates with ${SEARCH_TYPES[searchType].label.toLowerCase()}...`}
              className="w-full pl-12 pr-4 py-4 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-8 p-6 bg-gray-800 rounded-xl border border-gray-700"
          >
            <h3 className="text-lg font-semibold text-white mb-4">Advanced Filters</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Location</label>
                <input
                  type="text"
                  value={filters.location}
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                  placeholder="City, State, Country"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                />
              </div>

              {/* Experience Level */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Experience Level</label>
                <select
                  value={filters.experienceLevel}
                  onChange={(e) => handleFilterChange('experienceLevel', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                >
                  <option value="">All Levels</option>
                  {EXPERIENCE_LEVELS.map(level => (
                    <option key={level} value={level}>{level.charAt(0).toUpperCase() + level.slice(1)}</option>
                  ))}
                </select>
              </div>

              {/* Education */}
              {searchType !== 'basic' && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Education</label>
                  <select
                    value={filters.education}
                    onChange={(e) => handleFilterChange('education', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  >
                    <option value="">All Education</option>
                    {EDUCATION_LEVELS.map(edu => (
                      <option key={edu} value={edu}>{edu}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {searchType !== 'basic' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                {/* Experience Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Min Experience (years)</label>
                  <input
                    type="number"
                    value={filters.minExperience}
                    onChange={(e) => handleFilterChange('minExperience', e.target.value)}
                    placeholder="0"
                    min="0"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Max Experience (years)</label>
                  <input
                    type="number"
                    value={filters.maxExperience}
                    onChange={(e) => handleFilterChange('maxExperience', e.target.value)}
                    placeholder="20"
                    min="0"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Min Quality Score</label>
                  <input
                    type="number"
                    value={filters.minQualityScore}
                    onChange={(e) => handleFilterChange('minQualityScore', e.target.value)}
                    placeholder="50"
                    min="0"
                    max="100"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* Skills Filter */}
            {searchType !== 'basic' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">Skills</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {filters.skills.map(skill => (
                    <span
                      key={skill}
                      className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm flex items-center space-x-2"
                    >
                      <span>{skill}</span>
                      <button
                        onClick={() => removeSkillFilter(skill)}
                        className="text-blue-400 hover:text-blue-300"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="Type skill and press Enter"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && e.target.value.trim()) {
                      addSkillFilter(e.target.value.trim());
                      e.target.value = '';
                    }
                  }}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                />
              </div>
            )}
          </motion.div>
        )}

        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <h3 className="text-lg font-semibold text-white">
              Search Results {pagination.totalCount > 0 && `(${pagination.totalCount})`}
            </h3>
            {results.length > 0 && (
              <button
                onClick={selectAllCandidates}
                className="text-sm text-blue-400 hover:text-blue-300"
              >
                Select All
              </button>
            )}
          </div>
          
          {/* Sort Options */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-400">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-1 bg-gray-800 border border-gray-700 rounded text-white text-sm focus:border-blue-500 focus:outline-none"
            >
              <option value="created_at">Upload Date</option>
              <option value="quality_score">Quality Score</option>
              <option value="experience">Experience</option>
              <option value="name">Name</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-2 py-1 bg-gray-800 border border-gray-700 rounded text-white text-sm hover:bg-gray-700"
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-blue-500 border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-400">Searching candidates...</p>
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-12">
            <User className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400">
              {searchTerm || Object.values(filters).some(f => f && (Array.isArray(f) ? f.length > 0 : true))
                ? "No candidates found matching your criteria"
                : "Enter search criteria to find candidates"
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {results.map((candidate) => (
              <motion.div
                key={candidate.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    {/* Selection Checkbox */}
                    <input
                      type="checkbox"
                      checked={selectedCandidates.includes(candidate.id)}
                      onChange={() => toggleCandidateSelection(candidate.id)}
                      className="mt-1 w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                    />

                    {/* Profile Picture */}
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                      {candidate.personalInfo?.name ? candidate.personalInfo.name.charAt(0).toUpperCase() : 'U'}
                    </div>

                    {/* Candidate Info */}
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="text-xl font-semibold text-white">
                          {candidate.personalInfo?.name || 'Unknown Candidate'}
                        </h4>
                        <div className={`px-2 py-1 rounded-full text-xs ${getExperienceColor(candidate.experience?.level)}`}>
                          {candidate.experience?.level || 'Unknown'} Level
                        </div>
                        <div className={`px-2 py-1 rounded-full text-xs ${getQualityScoreColor(candidate.qualityScore)}`}>
                          {candidate.qualityScore || 0}% Quality
                        </div>
                      </div>

                      {/* Contact Info */}
                      <div className="flex items-center space-x-4 mb-3 text-sm text-gray-400">
                        {candidate.personalInfo?.email && (
                          <div className="flex items-center space-x-1">
                            <Mail className="w-4 h-4" />
                            <span>{candidate.personalInfo.email}</span>
                          </div>
                        )}
                        {candidate.personalInfo?.location && (
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-4 h-4" />
                            <span>{candidate.personalInfo.location}</span>
                          </div>
                        )}
                        {candidate.experience?.years !== undefined && (
                          <div className="flex items-center space-x-1">
                            <Briefcase className="w-4 h-4" />
                            <span>{candidate.experience.years} years experience</span>
                          </div>
                        )}
                      </div>

                      {/* Summary */}
                      {candidate.summary && (
                        <p className="text-gray-300 text-sm mb-3 line-clamp-2">
                          {candidate.summary}
                        </p>
                      )}

                      {/* Skills */}
                      {candidate.skills?.length > 0 && (
                        <div className="mb-3">
                          <div className="flex flex-wrap gap-1">
                            {candidate.skills.slice(0, 8).map((skill, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs"
                              >
                                {skill}
                              </span>
                            ))}
                            {candidate.skills.length > 8 && (
                              <span className="px-2 py-1 bg-gray-600 text-gray-300 rounded text-xs">
                                +{candidate.skills.length - 8} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Additional Info */}
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3" />
                          <span>Uploaded {new Date(candidate.uploadDate).toLocaleDateString()}</span>
                        </div>
                        {candidate.topMatch && (
                          <div className="flex items-center space-x-1">
                            <TrendingUp className="w-3 h-3" />
                            <span>Best match: {candidate.topMatch.matchScore}%</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center space-x-2">
                    <button className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors">
                      <Eye className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                      <Heart className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-green-400 hover:bg-green-500/10 rounded-lg transition-colors">
                      <MessageSquare className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-gray-300 hover:bg-gray-700 rounded-lg transition-colors">
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-center space-x-2 mt-8">
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              disabled={!pagination.hasPrev}
              className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            <span className="px-4 py-2 text-gray-400">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              disabled={!pagination.hasNext}
              className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
