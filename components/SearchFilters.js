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
    'All locations',
    'San Francisco',
    'London',
    'New York',
    'Paris',
    'Amsterdam',
    'Mountain View',
    'Tokyo',
    'Toronto',
    'Manila'
  ];

  const categories = [
    'All categories',
    'Design',
    'Engineer',
    'Human Resources',
    'Marketing'
  ];

  const levels = [
    'All levels',
    'Fresher',
    'Junior',
    'Middle',
    'Senior',
    'Entry'
  ];

  const sortOptions = [
    'Default order',
    '⬆️ Salary',
    '⬇️ Salary',
    '⬆️ Job Title',
    '⬇️ Job Title',
    '⬆️ Location',
    '⬇️ Location',
    '⬆️ Remote',
    '⬇️ Remote'
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    onSearch && onSearch({
      searchTerm,
      location,
      category,
      level,
      sortBy
    });
  };

  return (
    <div className={`${components.card.base} ${components.card.padding} ${layout.maxWidth} mt-10`}>
      <form onSubmit={handleSearch}>
        <div className="grid grid-cols-12 gap-4">
          {/* Search Input */}
          <div className="col-span-12 lg:col-span-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search jobs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`${components.input.base} pl-10`}
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                <svg className={`w-5 h-5 ${colors.neutral.textMuted}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Filter Options */}
          <div className="col-span-12 lg:col-span-9 grid grid-cols-1 lg:grid-cols-4 gap-4">
            {/* Location Filter */}
            <div>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className={components.input.base}
              >
                {locations.map((loc) => (
                  <option key={loc} value={loc === 'All locations' ? '' : loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>

            {/* Category Filter */}
            <div>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={components.input.base}
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat === 'All categories' ? '' : cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Level Filter */}
            <div>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className={components.input.base}
              >
                {levels.map((lvl) => (
                  <option key={lvl} value={lvl === 'All levels' ? '' : lvl}>
                    {lvl}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Options */}
            <div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className={components.input.base}
              >
                {sortOptions.map((option) => (
                  <option key={option} value={option === 'Default order' ? '' : option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Search Button for Mobile */}
        <div className="mt-4 lg:hidden">
          <button
            type="submit"
            className={`w-full ${components.button.base} ${components.button.primary} ${components.button.sizes.medium}`}
          >
            Search Jobs
          </button>
        </div>
      </form>
    </div>
  );
};

export default SearchFilters;
