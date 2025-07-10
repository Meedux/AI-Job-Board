'use client';

import { useState } from 'react';

const SearchFilters = ({ onSearch, onFilter }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('');
  const [level, setLevel] = useState('');

  const locations = [
    { value: '', label: 'All locations' },
    { value: 'San Francisco', label: 'San Francisco' },
    { value: 'London', label: 'London' },
    { value: 'New York', label: 'New York' },
    { value: 'Paris', label: 'Paris' },
    { value: 'Amsterdam', label: 'Amsterdam' },
    { value: 'Mountain View', label: 'Mountain View' },
    { value: 'Tokyo', label: 'Tokyo' },
    { value: 'Toronto', label: 'Toronto' },
    { value: 'Manila', label: 'Manila' }
  ];

  const categories = [
    { value: '', label: 'All categories' },
    { value: 'Design', label: 'Design' },
    { value: 'Engineer', label: 'Engineer' },
    { value: 'Human Resources', label: 'Human Resources' },
    { value: 'Marketing', label: 'Marketing' }
  ];

  const levels = [
    { value: '', label: 'All levels' },
    { value: 'Fresher', label: 'Fresher' },
    { value: 'Junior', label: 'Junior' },
    { value: 'Middle', label: 'Middle' },
    { value: 'Senior', label: 'Senior' },
    { value: 'Entry', label: 'Entry' }
  ];

  const handleFilterChange = (filterType, value) => {
    let updatedSearchTerm = searchTerm;
    let updatedLocation = location;
    let updatedCategory = category;
    let updatedLevel = level;

    switch (filterType) {
      case 'search':
        updatedSearchTerm = value;
        setSearchTerm(value);
        break;
      case 'location':
        updatedLocation = value;
        setLocation(value);
        break;
      case 'category':
        updatedCategory = value;
        setCategory(value);
        break;
      case 'level':
        updatedLevel = value;
        setLevel(value);
        break;
    }

    const searchParams = {
      search: updatedSearchTerm.trim(),
      location: updatedLocation,
      category: updatedCategory,
      level: updatedLevel,
      type: '',
      remote: false
    };

    onSearch && onSearch(searchParams);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleFilterChange('search', searchTerm);
  };

  return (
    <div className="bg-gray-800/50 border border-gray-700/50 rounded p-4">
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Input */}
          <div className="flex-1">
            <div className="relative">
              <input
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 text-sm focus:outline-none focus:border-blue-500"
                placeholder="Search jobs, companies, skills..."
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"></path>
                </svg>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-2">
            <select 
              className="px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:border-blue-500"
              value={location}
              onChange={(e) => handleFilterChange('location', e.target.value)}
            >
              {locations.map((loc) => (
                <option key={loc.value} value={loc.value}>
                  {loc.label}
                </option>
              ))}
            </select>

            <select 
              className="px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:border-blue-500"
              value={category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
            >
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>

            <select 
              className="px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:border-blue-500"
              value={level}
              onChange={(e) => handleFilterChange('level', e.target.value)}
            >
              {levels.map((lvl) => (
                <option key={lvl.value} value={lvl.value}>
                  {lvl.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </form>
    </div>
  );
};

export default SearchFilters;