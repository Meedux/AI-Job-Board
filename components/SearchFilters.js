'use client';

import { useState } from 'react';
import { colors, typography, components, layout, spacing } from '../utils/designSystem';

const SearchFilters = ({ onSearch, onFilter }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('');
  const [level, setLevel] = useState('');
  const [sortBy, setSortBy] = useState('');

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

  const sortOptions = [
    { value: '', label: 'Default order' },
    { value: '-to_salary', label: '⬆️ Salary' },
    { value: 'to_salary', label: '⬇️ Salary' },
    { value: 'job_title', label: '️️⬆️ Job Title' },
    { value: '-job_title', label: '⬇️ Job Title' },
    { value: 'job_location', label: '️️⬆️ Location' },
    { value: '-job_location', label: '⬇️ Location' },
    { value: 'remote', label: '️️⬆️ Remote' },
    { value: '-remote', label: '⬇️ Remote' }
  ];
  const handleFilterChange = (filterType, value) => {
    // Update local state first
    let updatedSearchTerm = searchTerm;
    let updatedLocation = location;
    let updatedCategory = category;
    let updatedLevel = level;
    let updatedSortBy = sortBy;

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
      case 'sortBy':
        updatedSortBy = value;
        setSortBy(value);
        break;
    }

    // Create search parameters for backend compatibility
    const searchParams = {
      search: updatedSearchTerm.trim(),
      location: updatedLocation,
      category: updatedCategory,
      level: updatedLevel,
      type: '', // Keep for backend compatibility
      remote: false, // Keep for backend compatibility
      sortBy: updatedSortBy
    };

    // Call backend with updated filters
    onSearch && onSearch(searchParams);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleFilterChange('search', searchTerm);
  };
  return (
    <div className={`${components.card.base} ${components.card.padding} ${layout.maxWidth} mt-10`}>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-12 gap-4">
          {/* Search Input */}
          <div className="col-span-12 lg:col-span-3">
            <div className="relative">
              <input
                className={`${components.input.base} pl-10`}
                placeholder="Search jobs..."
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${colors.neutral.textMuted}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"></path>
                </svg>
              </div>
            </div>
          </div>

          <div className="col-span-12 lg:col-span-9 grid grid-cols-1 lg:grid-cols-4 gap-4">
            {/* Location Filter */}
            <div>
              <select 
                className={components.input.base}
                value={location}
                onChange={(e) => handleFilterChange('location', e.target.value)}
              >
                {locations.map((loc) => (
                  <option key={loc.value} value={loc.value}>
                    {loc.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Category Filter */}
            <div>
              <select 
                className={components.input.base}
                value={category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Level Filter */}
            <div>
              <select 
                className={components.input.base}
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

            {/* Sort Filter */}
            <div>
              <select 
                className={components.input.base}
                value={sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default SearchFilters;
