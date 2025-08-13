'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Tag, Plus, X, Search, Sparkles, Brain, Target,
  ChevronDown, Filter, Bookmark, Star, AlertCircle,
  CheckCircle, Clock, User, Globe, Zap, Info
} from 'lucide-react';

// Status Tags from client requirements
const STATUS_TAGS = [
  { name: 'Backout', category: 'status', color: 'bg-red-600', description: 'Candidate withdrew from process' },
  { name: 'Cultural Fit', category: 'status', color: 'bg-green-600', description: 'Good cultural alignment' },
  { name: 'Declined Offer', category: 'status', color: 'bg-red-600', description: 'Candidate declined job offer' },
  { name: 'Dropped', category: 'status', color: 'bg-gray-600', description: 'Application discontinued' },
  { name: 'Fit to work but with medical condition', category: 'status', color: 'bg-yellow-600', description: 'Medical considerations' },
  { name: 'For Requirement Completion', category: 'status', color: 'bg-blue-600', description: 'Pending documentation' },
  { name: 'Gaps in Experience', category: 'status', color: 'bg-orange-600', description: 'Experience gaps identified' },
  { name: 'Highly Skilled', category: 'status', color: 'bg-purple-600', description: 'Exceptional technical skills' },
  { name: 'Immediate Joiner', category: 'status', color: 'bg-green-600', description: 'Available immediately' },
  { name: 'Offer Extended', category: 'status', color: 'bg-blue-600', description: 'Job offer sent' },
  { name: 'On Hold', category: 'status', color: 'bg-yellow-600', description: 'Application paused' },
  { name: 'Remote Only', category: 'status', color: 'bg-indigo-600', description: 'Remote work preference' },
  { name: 'Salary Decline', category: 'status', color: 'bg-red-600', description: 'Salary expectations not met' },
  { name: 'Strong Fit', category: 'status', color: 'bg-green-600', description: 'Excellent match for role' },
  { name: 'Transferable Skills', category: 'status', color: 'bg-blue-600', description: 'Skills applicable to role' },
  { name: 'Undecided', category: 'status', color: 'bg-gray-600', description: 'Candidate unsure about role' },
  { name: 'Under Medical', category: 'status', color: 'bg-yellow-600', description: 'Medical examination pending' },
  { name: 'Under Process', category: 'status', color: 'bg-blue-600', description: 'Currently being processed' },
  { name: 'Unfit', category: 'status', color: 'bg-red-600', description: 'Not suitable for role' },
  { name: 'Unresponsive', category: 'status', color: 'bg-gray-600', description: 'No response from candidate' }
];

// Notation Tags from client requirements
const NOTATION_TAGS = [
  { name: 'Available for Remote Role', category: 'notation', color: 'bg-green-600', description: 'Open to remote work opportunities' },
  { name: 'Better Offer Received', category: 'notation', color: 'bg-red-600', description: 'Accepted offer elsewhere' },
  { name: 'Company Priorities Changed', category: 'notation', color: 'bg-yellow-600', description: 'Role requirements updated' },
  { name: 'Compensation-Focused', category: 'notation', color: 'bg-blue-600', description: 'Primarily motivated by salary' },
  { name: 'Concerns with Work Style', category: 'notation', color: 'bg-orange-600', description: 'Work approach concerns' },
  { name: 'Consulting Experience', category: 'notation', color: 'bg-purple-600', description: 'Background in consulting' },
  { name: 'Critical Requirement Met', category: 'notation', color: 'bg-green-600', description: 'Key criteria satisfied' },
  { name: 'Cross-Functional Experience', category: 'notation', color: 'bg-blue-600', description: 'Multi-department background' },
  { name: 'Cultural Fit Concerns', category: 'notation', color: 'bg-orange-600', description: 'Culture alignment issues' },
  { name: 'Cultural Fit Preferences', category: 'notation', color: 'bg-green-600', description: 'Strong culture match' },
  { name: 'Cultural Misfit', category: 'notation', color: 'bg-red-600', description: 'Poor culture alignment' },
  { name: 'Customer Service Experience', category: 'notation', color: 'bg-blue-600', description: 'Client-facing background' },
  { name: 'Declined to Move Forward After Interview', category: 'notation', color: 'bg-red-600', description: 'Withdrew post-interview' },
  { name: 'Demanding Expectations', category: 'notation', color: 'bg-orange-600', description: 'High expectations set' },
  { name: 'Educational Experience', category: 'notation', color: 'bg-purple-600', description: 'Teaching or training background' },
  { name: 'Entry-Level Experience', category: 'notation', color: 'bg-blue-600', description: 'Junior level candidate' },
  { name: 'Excellent Potential', category: 'notation', color: 'bg-green-600', description: 'High growth potential' },
  { name: 'Fails to Complete Tasks on Time', category: 'notation', color: 'bg-red-600', description: 'Time management issues' },
  { name: 'Family/Personal Reasons', category: 'notation', color: 'bg-yellow-600', description: 'Personal constraints' },
  { name: 'Flexible Hours Preference', category: 'notation', color: 'bg-blue-600', description: 'Seeks flexible schedule' },
  { name: 'Freelance Experience', category: 'notation', color: 'bg-purple-600', description: 'Independent contractor background' },
  { name: 'Future Consideration', category: 'notation', color: 'bg-blue-600', description: 'Consider for future roles' },
  { name: 'High Priority', category: 'notation', color: 'bg-red-600', description: 'Urgent candidate to contact' },
  { name: 'Highly Motivated', category: 'notation', color: 'bg-green-600', description: 'Strong drive and enthusiasm' },
  { name: 'Highly Recommended', category: 'notation', color: 'bg-green-600', description: 'Strong endorsement received' },
  { name: 'Highly Selective', category: 'notation', color: 'bg-yellow-600', description: 'Very particular about roles' },
  { name: 'Home Office Setup', category: 'notation', color: 'bg-blue-600', description: 'Remote work ready' },
  { name: 'Hybrid Work Preference', category: 'notation', color: 'bg-indigo-600', description: 'Prefers mixed work model' },
  { name: 'Inadequate Communication Skills', category: 'notation', color: 'bg-red-600', description: 'Communication concerns' },
  { name: 'Inconsistent Performance', category: 'notation', color: 'bg-orange-600', description: 'Variable work quality' },
  { name: 'Internal Candidate Chosen', category: 'notation', color: 'bg-gray-600', description: 'Position filled internally' },
  { name: 'Internship or Trainee', category: 'notation', color: 'bg-blue-600', description: 'Entry-level development role' },
  { name: 'Job-Related Certifications', category: 'notation', color: 'bg-purple-600', description: 'Relevant certifications held' },
  { name: 'Lack of Experience', category: 'notation', color: 'bg-orange-600', description: 'Insufficient experience level' },
  { name: 'Lack of Required Skills', category: 'notation', color: 'bg-red-600', description: 'Missing key competencies' },
  { name: 'Leadership Experience', category: 'notation', color: 'bg-purple-600', description: 'Management background' },
  { name: 'Location/Relocation Issues', category: 'notation', color: 'bg-yellow-600', description: 'Geographic constraints' },
  { name: 'Needs Development', category: 'notation', color: 'bg-blue-600', description: 'Requires skill development' },
  { name: 'Overqualified', category: 'notation', color: 'bg-yellow-600', description: 'Exceeds role requirements' },
  { name: 'Ready for Offer', category: 'notation', color: 'bg-green-600', description: 'Prepared to extend offer' },
  { name: 'Related Industry Experience', category: 'notation', color: 'bg-blue-600', description: 'Similar sector background' },
  { name: 'Relevant Experience', category: 'notation', color: 'bg-green-600', description: 'Directly applicable background' },
  { name: 'Remote Work Experience', category: 'notation', color: 'bg-indigo-600', description: 'Proven remote work history' },
  { name: 'Remote Work Ready', category: 'notation', color: 'bg-green-600', description: 'Equipped for remote work' },
  { name: 'Remote-Only Preference', category: 'notation', color: 'bg-indigo-600', description: 'Will only work remotely' },
  { name: 'Salary Expectations Met', category: 'notation', color: 'bg-green-600', description: 'Compensation aligned' },
  { name: 'Skill Assessment Passed', category: 'notation', color: 'bg-green-600', description: 'Technical test completed' },
  { name: 'Specialized Expertise', category: 'notation', color: 'bg-purple-600', description: 'Niche technical skills' },
  { name: 'Top Performer', category: 'notation', color: 'bg-green-600', description: 'Exceptional candidate' },
  { name: 'Visa/Work Permit Issues', category: 'notation', color: 'bg-red-600', description: 'Work authorization concerns' },
  { name: 'WFH Flexibility', category: 'notation', color: 'bg-blue-600', description: 'Work from home options' }
];

const ALL_TAGS = [...STATUS_TAGS, ...NOTATION_TAGS];

export default function TagManagementSystem({ selectedTags = [], onTagsChange, placeholder = "Add tags..." }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredTags, setFilteredTags] = useState(ALL_TAGS);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [customTags, setCustomTags] = useState([]);
  const inputRef = useRef(null);

  useEffect(() => {
    let filtered = ALL_TAGS;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(tag => tag.category === selectedCategory);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(tag =>
        tag.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tag.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Add custom tags that match search
    const matchingCustomTags = customTags.filter(tag =>
      tag.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    setFilteredTags([...filtered, ...matchingCustomTags]);
  }, [searchTerm, selectedCategory, customTags]);

  const handleTagSelect = (tag) => {
    if (!selectedTags.find(t => t.name === tag.name)) {
      const newTags = [...selectedTags, tag];
      onTagsChange(newTags);
    }
    setSearchTerm('');
    setIsOpen(false);
  };

  const handleTagRemove = (tagToRemove) => {
    const newTags = selectedTags.filter(tag => tag.name !== tagToRemove.name);
    onTagsChange(newTags);
  };

  const handleCreateCustomTag = () => {
    if (searchTerm.trim() && !ALL_TAGS.find(tag => tag.name.toLowerCase() === searchTerm.toLowerCase())) {
      const newCustomTag = {
        name: searchTerm.trim(),
        category: 'custom',
        color: 'bg-gray-600',
        description: 'Custom tag created by user'
      };
      
      setCustomTags(prev => [...prev, newCustomTag]);
      handleTagSelect(newCustomTag);
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'status': return <Target className="w-4 h-4" />;
      case 'notation': return <Info className="w-4 h-4" />;
      case 'custom': return <User className="w-4 h-4" />;
      default: return <Tag className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'status': return 'text-blue-400';
      case 'notation': return 'text-purple-400';
      case 'custom': return 'text-gray-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="relative">
      {/* Selected Tags Display */}
      <div className="flex flex-wrap gap-2 mb-3">
        {selectedTags.map((tag, index) => (
          <motion.div
            key={`${tag.name}-${index}`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className={`${tag.color} text-white px-3 py-1 rounded-full text-sm flex items-center gap-2 border border-white/20`}
          >
            <span className="flex items-center gap-1">
              {getCategoryIcon(tag.category)}
              {tag.name}
            </span>
            <button
              onClick={() => handleTagRemove(tag)}
              className="hover:bg-white/20 rounded-full p-0.5 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </motion.div>
        ))}
      </div>

      {/* Tag Input */}
      <div className="relative">
        <div className="flex items-center gap-2 p-3 bg-gray-700/50 border border-gray-600/50 rounded-lg focus-within:ring-2 focus-within:ring-blue-500/50 transition-all duration-300">
          <Tag className="w-5 h-5 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            placeholder={placeholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => setIsOpen(true)}
            className="flex-1 bg-transparent text-white placeholder-gray-400 focus:outline-none"
          />
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Dropdown */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 right-0 mt-2 bg-gray-800 border border-gray-700 rounded-lg shadow-2xl z-50 max-h-96 overflow-hidden"
            >
              {/* Category Filter */}
              <div className="p-4 border-b border-gray-700">
                <div className="flex items-center gap-2 mb-3">
                  <Filter className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-300 text-sm font-medium">Filter by Category</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className={`px-3 py-1 rounded-full text-xs transition-all duration-300 ${
                      selectedCategory === 'all'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-400 hover:text-white'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setSelectedCategory('status')}
                    className={`px-3 py-1 rounded-full text-xs transition-all duration-300 flex items-center gap-1 ${
                      selectedCategory === 'status'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-400 hover:text-white'
                    }`}
                  >
                    <Target className="w-3 h-3" />
                    Status
                  </button>
                  <button
                    onClick={() => setSelectedCategory('notation')}
                    className={`px-3 py-1 rounded-full text-xs transition-all duration-300 flex items-center gap-1 ${
                      selectedCategory === 'notation'
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-700 text-gray-400 hover:text-white'
                    }`}
                  >
                    <Info className="w-3 h-3" />
                    Notation
                  </button>
                  <button
                    onClick={() => setSelectedCategory('custom')}
                    className={`px-3 py-1 rounded-full text-xs transition-all duration-300 flex items-center gap-1 ${
                      selectedCategory === 'custom'
                        ? 'bg-gray-600 text-white'
                        : 'bg-gray-700 text-gray-400 hover:text-white'
                    }`}
                  >
                    <User className="w-3 h-3" />
                    Custom
                  </button>
                </div>
              </div>

              {/* Tag List */}
              <div className="max-h-64 overflow-y-auto">
                {filteredTags.length === 0 && searchTerm ? (
                  <div className="p-4 text-center">
                    <div className="text-gray-400 mb-3">
                      <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      No tags found matching "{searchTerm}"
                    </div>
                    <button
                      onClick={handleCreateCustomTag}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-all duration-300 flex items-center gap-2 mx-auto"
                    >
                      <Plus className="w-4 h-4" />
                      Create Custom Tag
                    </button>
                  </div>
                ) : (
                  <div className="p-2 space-y-1">
                    {filteredTags.map((tag, index) => {
                      const isSelected = selectedTags.find(t => t.name === tag.name);
                      
                      return (
                        <motion.button
                          key={`${tag.name}-${index}`}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          onClick={() => handleTagSelect(tag)}
                          disabled={isSelected}
                          className={`w-full text-left p-3 rounded-lg transition-all duration-300 ${
                            isSelected
                              ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                              : 'hover:bg-gray-700 text-white'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                              <div className={`w-3 h-3 rounded-full ${tag.color} mt-1.5`} />
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{tag.name}</span>
                                  <span className={`${getCategoryColor(tag.category)}`}>
                                    {getCategoryIcon(tag.category)}
                                  </span>
                                </div>
                                <p className="text-gray-400 text-sm mt-1">{tag.description}</p>
                              </div>
                            </div>
                            {isSelected ? (
                              <CheckCircle className="w-5 h-5 text-green-400" />
                            ) : (
                              <Plus className="w-5 h-5 text-gray-400" />
                            )}
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-3 border-t border-gray-700 bg-gray-750">
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>
                    {filteredTags.length} tag{filteredTags.length !== 1 ? 's' : ''} available
                  </span>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-3 h-3" />
                    <span>Press Enter to create custom tags</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Tag Usage Tips */}
      {selectedTags.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-4 bg-blue-600/10 border border-blue-600/20 rounded-lg"
        >
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-400 mt-0.5" />
            <div>
              <h4 className="text-blue-400 font-medium mb-2">Tag Usage Tips</h4>
              <ul className="text-gray-300 text-sm space-y-1">
                <li>• <strong>Status Tags:</strong> Track candidate progress and decisions</li>
                <li>• <strong>Notation Tags:</strong> Add detailed notes about skills and preferences</li>
                <li>• <strong>Custom Tags:</strong> Create your own tags for specific needs</li>
                <li>• Tags help with filtering, analytics, and team communication</li>
              </ul>
            </div>
          </div>
        </motion.div>
      )}

      {/* AI Suggestions */}
      {selectedTags.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-4 bg-purple-600/10 border border-purple-600/20 rounded-lg"
        >
          <div className="flex items-start gap-3">
            <Brain className="w-5 h-5 text-purple-400 mt-0.5" />
            <div>
              <h4 className="text-purple-400 font-medium mb-2">AI Tag Suggestions</h4>
              <p className="text-gray-300 text-sm mb-3">
                Based on your selected tags, consider adding these related tags:
              </p>
              <div className="flex flex-wrap gap-2">
                {ALL_TAGS
                  .filter(tag => !selectedTags.find(t => t.name === tag.name))
                  .slice(0, 3)
                  .map((suggestedTag, index) => (
                    <button
                      key={index}
                      onClick={() => handleTagSelect(suggestedTag)}
                      className="px-3 py-1 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 rounded-full text-sm transition-all duration-300 flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3" />
                      {suggestedTag.name}
                    </button>
                  ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
