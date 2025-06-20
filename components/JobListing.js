import JobCard from './JobCard';

const JobListing = ({ jobs = [] }) => {
  // Mock job data if none provided
  const mockJobs = [
    {
      id: 1,
      title: 'Full-Stack Developer',
      company: 'Google',
      companyLogo: 'https://i.imgur.com/xILxSdu.png',
      location: 'San Francisco',
      type: 'Full-time',
      salary: { min: '$80,000', max: '$200,000' },
      postedAt: '10 months ago',
      href: '/job/full-stack-developer'
    },
    {
      id: 2,
      title: 'Senior Marketing Lead',
      company: 'Amazon',
      companyLogo: 'https://i.imgur.com/ljCgpyj.png',
      location: 'London',
      type: 'Internship',
      salary: { min: '$90,000', max: '$120,000' },
      postedAt: '10 months ago',
      href: '/job/senior-marketing-lead'
    },
    {
      id: 3,
      title: 'Product Manager',
      company: 'Netflix',
      companyLogo: 'https://i.imgur.com/RXEGeP0.png',
      location: 'New York',
      type: 'Full-time',
      salary: { min: '$90,000', max: '$130,000' },
      postedAt: '10 months ago',
      href: '/job/product-manager'
    },
    {
      id: 4,
      title: 'IT Support Specialist',
      company: 'Twitter',
      companyLogo: 'https://i.imgur.com/VYwMZcb.png',
      location: 'Paris',
      type: 'Part-time',
      salary: { min: '$90,000', max: '$120,000' },
      postedAt: '10 months ago',
      href: '/job/it-support-specialist'
    },
    {
      id: 5,
      title: 'Data Engineer',
      company: 'Spotify',
      companyLogo: 'https://i.imgur.com/RUr4vn6.png',
      location: 'San Francisco',
      type: 'Full-time',
      salary: { min: '$90,000', max: '$120,000' },
      postedAt: '10 months ago',
      href: '/job/data-engineer'
    },
    {
      id: 6,
      title: 'Full-Stack Developer',
      company: 'Uber',
      companyLogo: 'https://i.imgur.com/IkzCvb8.png',
      location: 'Amsterdam',
      type: 'Full-time',
      salary: { min: '$110,000', max: '$120,000' },
      postedAt: '9 months ago',
      href: '/job/full-stack-developer-uber'
    },
    {
      id: 7,
      title: 'Senior Data Engineer',
      company: 'Airbnb',
      companyLogo: 'https://i.imgur.com/9uVVdvR.png',
      location: 'Mountain View',
      type: 'Full-time',
      salary: { min: '$70,000', max: '$120,000' },
      postedAt: '9 months ago',
      href: '/job/senior-data-engineer'
    },
    {
      id: 8,
      title: 'Staff Software Engineer',
      company: 'Facebook',
      companyLogo: 'https://i.imgur.com/yzuUjxq.png',
      location: 'London',
      type: 'Full-time',
      salary: { min: '$90,000', max: '$1,220,000' },
      postedAt: '9 months ago',
      href: '/job/staff-software-engineer'
    }
  ];

  const displayJobs = jobs.length > 0 ? jobs : mockJobs;

  return (
    <div className="grid grid-cols-1 gap-4">
      {displayJobs.map((job) => (
        <JobCard key={job.id} job={job} />
      ))}
      
      {displayJobs.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No jobs found</h3>
          <p className="text-gray-600 dark:text-gray-400">Try adjusting your search criteria or check back later for new opportunities.</p>
        </div>
      )}
    </div>
  );
};

export default JobListing;
