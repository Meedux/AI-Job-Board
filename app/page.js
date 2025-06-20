'use client';

import { useState } from 'react';
import Header from '../components/Header';
import Hero from '../components/Hero';
import SearchFilters from '../components/SearchFilters';
import JobListing from '../components/JobListing';
import EmailSubscription from '../components/EmailSubscription';
import Footer from '../components/Footer';
import { colors, typography, components, layout, spacing, gradients } from '../utils/designSystem';

export default function Home() {
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async (searchParams) => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      // In a real app, this would filter jobs based on searchParams
      console.log('Search params:', searchParams);
      setIsLoading(false);
    }, 1000);
  };

  const handleFilter = (filterParams) => {
    // Handle filter logic
    console.log('Filter params:', filterParams);
  };

  return (
    <div className={`min-h-screen ${colors.neutral.background} font-sans`}>
      <Header />
      
      <main>
        <Hero />
        
        <div className={layout.container}>
          <SearchFilters onSearch={handleSearch} onFilter={handleFilter} />
          
          <div className={`mt-10 ${layout.grid.sidebar}`}>
            {/* Job Listings */}
            <div className="col-span-12 lg:col-span-8">
              {isLoading ? (
                <div className="flex justify-center items-center py-20">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <JobListing jobs={filteredJobs} />
              )}
            </div>
            
            {/* Sidebar */}
            <div className="col-span-12 lg:col-span-4">
              <div className="sticky top-6 space-y-6">
                <EmailSubscription />
                
                {/* Job Search Tips */}
                <div className={`${gradients.primaryLight} rounded-lg ${components.card.padding}`}>
                  <h3 className={`${typography.h5} ${colors.neutral.textPrimary} mb-3`}>
                    💡 Job Search Tips
                  </h3>
                  <ul className={`space-y-2 ${typography.bodySmall} ${colors.neutral.textTertiary}`}>
                    <li className="flex items-start space-x-2">
                      <span className={colors.primary.text}>•</span>
                      <span>Use specific keywords in your search</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className={colors.primary.text}>•</span>
                      <span>Set up job alerts for faster notifications</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className={colors.primary.text}>•</span>
                      <span>Update your profile regularly</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className={colors.primary.text}>•</span>
                      <span>Apply within 24 hours for best results</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}