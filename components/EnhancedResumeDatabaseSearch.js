'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, Download, Eye, Star, MapPin, Briefcase, GraduationCap, Coins, User, Mail, Phone, Zap, Brain } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import ResumeContactReveal from './ResumeContactReveal';

export default function EnhancedResumeDatabaseSearch() {
  const { user } = useAuth();
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    location: '',
    experienceLevel: '',
    skills: '',
    education: '',
    availability: '',
    salaryRange: '',
    jobType: ''
  });
  const [userCredits, setUserCredits] = useState(0);
  const [sortBy, setSortBy] = useState('relevance');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [searchMode, setSearchMode] = useState('basic'); // 'basic', 'advanced', 'ai'

  useEffect(() => {
    fetchUserCredits();
    // Auto-search if there are existing filters
    if (searchTerm || Object.values(filters).some(v => v)) {
      handleSearch(1);
    }
  }, []);

  const fetchUserCredits = async () => {
    try {
      const response = await fetch('/api/user/credits');
      if (response.ok) {
        const data = await response.json();
        setUserCredits(data.resumeCredits || data.credits || 0);
      }
    } catch (error) {
      console.error('Error fetching credits:', error);
    }
  };

  const handleSearch = async (page = 1) => {
    if (!searchTerm.trim() && !filters.skills && !filters.location) {
      return;
    }

    setLoading(true);
    setCurrentPage(page);

    try {
      const searchParams = new URLSearchParams({
        q: searchTerm,
        page: page.toString(),
        sortBy,
        searchMode,
        ...Object.fromEntries(Object.entries(filters).filter(([_, value]) => value))
      });

      const response = await fetch(`/api/resume/search?${searchParams}`);
      if (!response.ok) throw new Error('Search failed');

      const data = await response.json();
      setSearchResults(data.results || []);
      setTotalResults(data.total || 0);

    } catch (error) {
      console.error('Search error:', error);
      alert('Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      location: '',
      experienceLevel: '',
      skills: '',
      education: '',
      availability: '',
      salaryRange: '',
      jobType: ''
    });
    setSearchTerm('');
    setSearchResults([]);
  };

  const handleContactReveal = (revealData) => {
    // Update credits after successful reveal
    setUserCredits(revealData.remainingCredits);
  };

  const getSearchModeInfo = (mode) => {
    switch (mode) {
      case 'basic':
        return {
          name: 'Basic Search',
          description: 'Standard keyword and location search',
          creditCost: 0,
          icon: Search,
          color: 'blue'
        };
      case 'advanced':
        return {
          name: 'Advanced Search',
          description: 'Detailed filtering with skill matching',
          creditCost: 1,
          icon: Filter,
          color: 'purple'
        };
      case 'ai':
        return {
          name: 'AI-Powered Search',
          description: 'Smart matching with relevance scoring',
          creditCost: 2,
          icon: Brain,
          color: 'green'
        };
      default:
        return getSearchModeInfo('basic');
    }
  };

  const ResumeCard = ({ candidate }) => {
    const [showContactReveal, setShowContactReveal] = useState(false);
    const [isFavorite, setIsFavorite] = useState(false);

    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all duration-200">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center overflow-hidden">
              {candidate.profilePicture ? (
                <img 
                  src={candidate.profilePicture} 
                  alt={candidate.fullName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-6 h-6 text-blue-600" />
              )}
            </div>
            
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">
                {candidate.showSensitiveInfo ? candidate.fullName : 'Anonymous Candidate'}
              </h3>
              
              <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                {candidate.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{candidate.location}</span>
                  </div>
                )}
                
                {candidate.experienceYears && (
                  <div className="flex items-center gap-1">
                    <Briefcase className="w-4 h-4" />
                    <span>{candidate.experienceYears} years experience</span>
                  </div>
                )}
                
                {candidate.education && (
                  <div className="flex items-center gap-1">
                    <GraduationCap className="w-4 h-4" />
                    <span>{candidate.education}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {candidate.matchScore && (
              <div className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                {candidate.matchScore}% match
              </div>
            )}
            
            <button
              onClick={() => setIsFavorite(!isFavorite)}
              className={`p-2 rounded-lg transition-colors ${
                isFavorite ? 'text-red-500 bg-red-50' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Star className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
            </button>
            
            <button
              onClick={() => setShowContactReveal(!showContactReveal)}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <Eye className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Skills */}
        {candidate.skills && candidate.skills.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Skills</h4>
            <div className="flex flex-wrap gap-2">
              {candidate.skills.slice(0, 6).map((skill, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full"
                >
                  {skill}
                </span>
              ))}
              {candidate.skills.length > 6 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                  +{candidate.skills.length - 6} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Professional Summary */}
        {candidate.profileSummary && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-1">Professional Summary</h4>
            <p className="text-sm text-gray-600 line-clamp-2">
              {candidate.profileSummary}
            </p>
          </div>
        )}

        {/* Contact Information (Masked) */}
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Contact Information</h4>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">
                {showContactReveal && candidate.contactRevealed ? candidate.email : '••••••@••••.com'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">
                {showContactReveal && candidate.contactRevealed ? candidate.phone : '+63 ••• ••• ••••'}
              </span>
            </div>
          </div>
        </div>

        {/* Contact Reveal Section */}
        {showContactReveal && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <ResumeContactReveal
              targetUser={candidate}
              userCredits={userCredits}
              onReveal={handleContactReveal}
              className="border-0 p-0 bg-transparent"
            />
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center gap-3 text-sm text-gray-500">
            <span>Last active: {new Date(candidate.lastLoginAt || candidate.updatedAt).toLocaleDateString()}</span>
            {candidate.availability && (
              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                {candidate.availability}
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {candidate.resumeUrl && (
              <button className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                <Download className="w-3 h-3 inline mr-1" />
                Resume
              </button>
            )}
            
            <button
              onClick={() => setShowContactReveal(!showContactReveal)}
              className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
            >
              <Eye className="w-3 h-3 inline mr-1" />
              {showContactReveal ? 'Hide' : 'View'} Contact
            </button>
          </div>
        </div>
      </div>
    );
  };

  const currentModeInfo = getSearchModeInfo(searchMode);

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Resume Database</h1>
          <p className="text-gray-600">Search and discover qualified candidates with advanced filtering</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg">
            <Coins className="w-4 h-4" />
            <span className="font-medium">{userCredits} credits</span>
          </div>
          
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Buy Credits
          </button>
        </div>
      </div>

      {/* Search Mode Selection */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">Search Mode</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {['basic', 'advanced', 'ai'].map((mode) => {
            const modeInfo = getSearchModeInfo(mode);
            const IconComponent = modeInfo.icon;
            
            return (
              <button
                key={mode}
                onClick={() => setSearchMode(mode)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  searchMode === mode
                    ? `border-${modeInfo.color}-500 bg-${modeInfo.color}-50`
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <IconComponent className={`w-5 h-5 text-${modeInfo.color}-600`} />
                  <span className="font-medium">{modeInfo.name}</span>
                  {modeInfo.creditCost > 0 && (
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                      {modeInfo.creditCost} credit{modeInfo.creditCost > 1 ? 's' : ''}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 text-left">{modeInfo.description}</p>
              </button>
            );
          })}
        </div>

        {/* Main Search Bar */}
        <div className="flex gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder={`Search by skills, job title, company, or keywords... (${currentModeInfo.name})`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch(1)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <button
            onClick={() => handleSearch(1)}
            disabled={loading || (currentModeInfo.creditCost > 0 && userCredits < currentModeInfo.creditCost)}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              loading || (currentModeInfo.creditCost > 0 && userCredits < currentModeInfo.creditCost)
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {loading ? 'Searching...' : `Search ${currentModeInfo.creditCost > 0 ? `(${currentModeInfo.creditCost} credit${currentModeInfo.creditCost > 1 ? 's' : ''})` : ''}`}
          </button>
        </div>

        {/* Quick Filters */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-4">
          <input
            type="text"
            placeholder="Location"
            value={filters.location}
            onChange={(e) => handleFilterChange('location', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          
          <select
            value={filters.experienceLevel}
            onChange={(e) => handleFilterChange('experienceLevel', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Experience Level</option>
            <option value="entry">Entry Level (0-2 years)</option>
            <option value="mid">Mid Level (3-5 years)</option>
            <option value="senior">Senior Level (6-10 years)</option>
            <option value="executive">Executive (10+ years)</option>
          </select>
          
          <input
            type="text"
            placeholder="Skills"
            value={filters.skills}
            onChange={(e) => handleFilterChange('skills', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          
          <select
            value={filters.education}
            onChange={(e) => handleFilterChange('education', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Education</option>
            <option value="high_school">High School</option>
            <option value="associate">Associate Degree</option>
            <option value="bachelor">Bachelor's Degree</option>
            <option value="master">Master's Degree</option>
            <option value="phd">PhD</option>
          </select>
          
          <select
            value={filters.availability}
            onChange={(e) => handleFilterChange('availability', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Availability</option>
            <option value="immediate">Immediate</option>
            <option value="2_weeks">2 Weeks Notice</option>
            <option value="1_month">1 Month Notice</option>
            <option value="negotiable">Negotiable</option>
          </select>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="relevance">Sort by Relevance</option>
            <option value="recent">Most Recent</option>
            <option value="experience">Experience Level</option>
            <option value="location">Location</option>
            <option value="match_score">Match Score</option>
          </select>
        </div>

        <div className="flex items-center justify-between">
          <button
            onClick={clearFilters}
            className="text-sm text-gray-600 hover:text-gray-800 transition-colors"
          >
            Clear all filters
          </button>
          
          <div className="text-sm text-gray-500">
            {currentModeInfo.creditCost === 0 
              ? 'Free search • Contact reveals cost 1 credit each'
              : `${currentModeInfo.creditCost} credit${currentModeInfo.creditCost > 1 ? 's' : ''} per search • Contact reveals cost 1 credit each`
            }
          </div>
        </div>
      </div>

      {/* Results Header */}
      {searchResults.length > 0 && (
        <div className="flex items-center justify-between mb-6">
          <div className="text-sm text-gray-600">
            Showing {((currentPage - 1) * 10) + 1}-{Math.min(currentPage * 10, totalResults)} of {totalResults} candidates
          </div>
          
          <div className="text-sm text-gray-500">
            Using {currentModeInfo.name} mode
          </div>
        </div>
      )}

      {/* Search Results */}
      {loading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-2">Searching candidates...</p>
        </div>
      )}

      {!loading && searchResults.length > 0 && (
        <div className="space-y-6">
          {searchResults.map((candidate) => (
            <ResumeCard key={candidate.id} candidate={candidate} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalResults > 10 && (
        <div className="flex justify-center mt-8">
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleSearch(currentPage - 1)}
              disabled={currentPage === 1 || loading}
              className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>
            
            <span className="px-3 py-2 text-sm text-gray-600">
              Page {currentPage} of {Math.ceil(totalResults / 10)}
            </span>
            
            <button
              onClick={() => handleSearch(currentPage + 1)}
              disabled={currentPage >= Math.ceil(totalResults / 10) || loading}
              className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && searchResults.length === 0 && (searchTerm || Object.values(filters).some(v => v)) && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No candidates found</h3>
          <p className="text-gray-600 mb-4">
            Try adjusting your search criteria or using a different search mode.
          </p>
          <button
            onClick={clearFilters}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Clear Search
          </button>
        </div>
      )}

      {/* Initial State */}
      {!loading && searchResults.length === 0 && !searchTerm && !Object.values(filters).some(v => v) && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <currentModeInfo.icon className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Ready to search with {currentModeInfo.name}
          </h3>
          <p className="text-gray-600 mb-4">
            {currentModeInfo.description}
          </p>
          <div className="max-w-md mx-auto">
            <div className="text-sm text-gray-500 mb-2">
              Popular searches:
            </div>
            <div className="flex flex-wrap gap-2 justify-center">
              {['JavaScript Developer', 'Data Scientist', 'Project Manager', 'Designer', 'React Expert', 'Manila'].map((term) => (
                <button
                  key={term}
                  onClick={() => {
                    setSearchTerm(term);
                    handleSearch(1);
                  }}
                  className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full hover:bg-gray-200 transition-colors"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}