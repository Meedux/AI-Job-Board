// Job Posting Form Constants and Configuration

// Employer Types Configuration
export const EMPLOYER_TYPES = {
  // Local Employer Types
  LOCAL: {
    DIRECT_EMPLOYER: 'local_direct',
    DO_174_CONTRACTING: 'local_do174',
    PRIVATE_RECRUITMENT_AGENCY: 'local_pra',
    PRIVATE_SECURITY_AGENCY: 'local_psa',
    COOPERATIVES_AGENCY: 'local_cda',
    LOCAL_EOR: 'local_eor',
    GOVERNMENT_CORPORATIONS: 'local_gocc',
    NGO: 'local_ngo'
  },
  // Overseas Employer Types
  OVERSEAS: {
    MANNING_AGENCY: 'overseas_manning',
    RECRUITMENT_AGENCY: 'overseas_recruitment',
    OVERSEAS_EOR: 'overseas_eor'
  }
};

// Education Attainment Options
export const EDUCATION_LEVELS = [
  {
    value: 'no_formal_education',
    label: 'No Formal Education Required (Relevant Experience Considered)',
    description: 'Experience valued over formal education'
  },
  {
    value: 'experience_in_lieu',
    label: 'Relevant Work Experience Considered In lieu of Education',
    description: 'Work experience can substitute education requirements'
  },
  {
    value: 'highschool_graduate',
    label: 'At least High School Graduate or Equivalent',
    description: 'Minimum high school completion required'
  },
  {
    value: 'college_level',
    label: 'College Level or Undergraduate Students Welcome',
    description: 'Some college education preferred'
  },
  {
    value: 'vocational_certification',
    label: 'Vocational or Trade Certification Required',
    description: 'Specific trade or vocational training needed'
  },
  {
    value: 'bachelors_degree',
    label: 'Bachelor\'s Degree or Equivalent',
    description: 'Four-year degree required'
  },
  {
    value: 'unfinished_masters',
    label: 'Unfinished Relevant Master\'s Degree Considered',
    description: 'Advanced degree in progress acceptable'
  },
  {
    value: 'masters_preferred',
    label: 'Master\'s Degree Preferred',
    description: 'Graduate degree strongly preferred'
  },
  {
    value: 'doctorate_preferred',
    label: 'Doctorate\'s Degree Preferred',
    description: 'Advanced research degree preferred'
  },
  {
    value: 'bachelors_with_advanced',
    label: 'Bachelor\'s Degree with Unfinished Master\'s or Doctorate Considered',
    description: 'Undergraduate with advanced study progress'
  }
];

// Salary Ranges in PHP
export const SALARY_RANGES_PHP = [
  { value: 'minimum_wage', label: 'Minimum Wage', min: null, max: null },
  { value: '15000-20000', label: '₱15,000 - ₱20,000', min: 15000, max: 20000 },
  { value: '20000-30000', label: '₱20,000 - ₱30,000', min: 20000, max: 30000 },
  { value: '30000-50000', label: '₱30,000 - ₱50,000', min: 30000, max: 50000 },
  { value: '50000-80000', label: '₱50,000 - ₱80,000', min: 50000, max: 80000 },
  { value: '80000-100000', label: '₱80,000 - ₱100,000', min: 80000, max: 100000 },
  { value: '100000-150000', label: '₱100,000 - ₱150,000', min: 100000, max: 150000 },
  { value: '150000-200000', label: '₱150,000 - ₱200,000', min: 150000, max: 200000 },
  { value: '200000-300000', label: '₱200,000 - ₱300,000', min: 200000, max: 300000 },
  { value: '300000-500000', label: '₱300,000 - ₱500,000', min: 300000, max: 500000 },
  { value: '500000-1000000', label: '₱500,000 - ₱1,000,000', min: 500000, max: 1000000 },
  { value: 'custom', label: 'Custom Amount', min: null, max: null }
];

// Salary Periods
export const SALARY_PERIODS = [
  { value: 'hourly', label: 'Per Hour', multiplier: 1 },
  { value: 'daily', label: 'Per Day', multiplier: 8 },
  { value: 'monthly', label: 'Per Month', multiplier: 160 },
  { value: 'annually', label: 'Annually', multiplier: 1920 }
];

// Currency Options
export const CURRENCIES = [
  { value: 'PHP', label: 'Philippine Peso (₱)', symbol: '₱' },
  { value: 'USD', label: 'US Dollar ($)', symbol: '$' },
  { value: 'EUR', label: 'Euro (€)', symbol: '€' },
  { value: 'GBP', label: 'British Pound (£)', symbol: '£' },
  { value: 'SGD', label: 'Singapore Dollar (S$)', symbol: 'S$' },
  { value: 'AUD', label: 'Australian Dollar (A$)', symbol: 'A$' },
  { value: 'CAD', label: 'Canadian Dollar (C$)', symbol: 'C$' },
  { value: 'JPY', label: 'Japanese Yen (¥)', symbol: '¥' }
];

// Default Prescreen Questions
export const DEFAULT_PRESCREEN_QUESTIONS = [
  {
    id: 'years_experience',
    type: 'select',
    question: 'How many years of relevant experience do you have?',
    options: ['Less than 1 year', '1-2 years', '3-5 years', '6-10 years', 'More than 10 years'],
    required: true
  },
  {
    id: 'salary_expectation',
    type: 'text',
    question: 'What is your salary expectation for this role?',
    placeholder: 'e.g., ₱50,000 per month',
    required: false
  },
  {
    id: 'availability',
    type: 'select',
    question: 'When are you available to start?',
    options: ['Immediately', 'Within 1 week', 'Within 2 weeks', 'Within 1 month', 'More than 1 month'],
    required: true
  },
  {
    id: 'location_preference',
    type: 'select',
    question: 'Are you open to working on-site?',
    options: ['Yes, I prefer on-site work', 'Yes, but prefer hybrid', 'Remote work only', 'Flexible with any arrangement'],
    required: true
  },
  {
    id: 'work_authorization',
    type: 'select',
    question: 'Do you have authorization to work in the Philippines?',
    options: ['Yes, I am a Filipino citizen', 'Yes, I have a work permit', 'No, I would need sponsorship'],
    required: true
  }
];

// Overseas Job Mandatory Statements
export const OVERSEAS_STATEMENTS = [
  {
    id: 'manpower_pooling',
    text: 'FOR MANPOWER POOLING ONLY. No fees on any form and/or purpose will be collected from applicants. Beware of Illegal Recruiters and Human Trafficking.'
  },
  {
    id: 'no_fees',
    text: 'No fees on any form and/or purpose will be collected from applicants. Beware of Illegal Recruiters and Human Trafficking.'
  }
];

// Industry Categories and Subcategories
export const INDUSTRY_CATEGORIES = {
  'accounting': {
    label: 'Accounting',
    subcategories: ['Public Accounting', 'Corporate Accounting', 'Tax Accounting', 'Audit', 'Bookkeeping']
  },
  'advertising': {
    label: 'Advertising',
    subcategories: ['Creative Services', 'Account Management', 'Media Planning', 'Digital Advertising']
  },
  'technology': {
    label: 'Information Technology and Services',
    subcategories: ['Software Development', 'Web Development', 'Mobile Development', 'DevOps', 'Cybersecurity', 'Data Science', 'Cloud Computing', 'AI/ML']
  },
  'healthcare': {
    label: 'Health, Wellness, and Fitness',
    subcategories: ['Hospitals', 'Medical Practice', 'Medical Equipment', 'Veterinary', 'Nursing', 'Healthcare Administration']
  },
  'education': {
    label: 'Education',
    subcategories: ['K-12 Education', 'Higher Education', 'Online Learning', 'Training and Development']
  },
  'finance': {
    label: 'Financial Services',
    subcategories: ['Banking', 'Insurance', 'Investment Banking', 'Investment Management', 'Financial Planning']
  },
  'manufacturing': {
    label: 'Manufacturing',
    subcategories: ['Automotive Manufacturing', 'Chemical Manufacturing', 'Food Manufacturing', 'Textile Manufacturing', 'Electronics Manufacturing']
  },
  'retail': {
    label: 'Retail',
    subcategories: ['Supermarkets', 'Malls', 'E-commerce', 'Fashion Retail', 'Electronics Retail']
  },
  'hospitality': {
    label: 'Hospitality',
    subcategories: ['Hotels', 'Restaurants', 'Tourism', 'Event Management', 'Travel Services']
  },
  'construction': {
    label: 'Construction',
    subcategories: ['Residential Construction', 'Commercial Construction', 'Infrastructure', 'Architecture', 'Engineering']
  },
  'logistics': {
    label: 'Logistics and Supply Chain',
    subcategories: ['Warehousing', 'Transportation', 'Freight', 'Distribution', 'Inventory Management']
  },
  'marketing': {
    label: 'Marketing',
    subcategories: ['Digital Marketing', 'Social Media Marketing', 'Content Marketing', 'Brand Management', 'Market Research']
  },
  'sales': {
    label: 'Sales',
    subcategories: ['B2B Sales', 'B2C Sales', 'Retail Sales', 'Inside Sales', 'Field Sales']
  },
  'hr': {
    label: 'Human Resources and Recruitment',
    subcategories: ['Recruitment Agencies', 'HR Management', 'Staffing', 'Executive Search', 'HR Consulting']
  },
  'government': {
    label: 'Government Administration',
    subcategories: ['National Government', 'Local Government', 'Government Agencies', 'Public Service']
  },
  'other': {
    label: 'Other',
    subcategories: ['Specify in description']
  }
};

// Form Tooltips
export const FORM_TOOLTIPS = {
  jobTitle: 'Kindly refrain from including unnecessary terms such as "Urgent," "Job Location," "Shift," etc. Only the job position title should be entered in this field.',
  qualifications: 'Kindly refrain from specifying any age limit in compliance with Anti-Age Discrimination laws and ensure compliance with child labor laws regarding minimum employment age.',
  salary: 'As an employer, you are responsible for complying with fair and minimum wage laws or offering a competitive salary to attract potential candidates.',
  numberOfOpenings: 'Specify how many positions are available for this job posting. This will be visible to applicants.',
  endPostingOn: 'Set the deadline for applications. After this date, the job posting will automatically close.',
  showContact: 'Choose whether to display your contact information publicly. Premium accounts can protect email addresses.',
  showCompensation: 'Choose whether to display salary information in the job posting.',
  licenseNumber: 'For DOLE, DMW (formerly POEA), or CDA agencies, the valid license number and expiration date must be displayed.',
  prescreenQuestions: 'Add up to 3 prescreen questions for manual mode or up to 5 for AI mode to filter candidates effectively.'
};

// Job Type Options
export const JOB_TYPES = [
  { value: 'full-time', label: 'Full Time' },
  { value: 'part-time', label: 'Part Time' },
  { value: 'contract', label: 'Contract' },
  { value: 'freelance', label: 'Freelance' },
  { value: 'internship', label: 'Internship' },
  { value: 'temporary', label: 'Temporary' },
  { value: 'seasonal', label: 'Seasonal' }
];

// Work Mode Options
export const WORK_MODES = [
  { value: 'on-site', label: 'On-site' },
  { value: 'remote', label: 'Remote' },
  { value: 'hybrid', label: 'Hybrid' }
];

// Experience Levels
export const EXPERIENCE_LEVELS = [
  { value: 'entry-level', label: 'Entry Level (0-2 years)' },
  { value: 'mid-level', label: 'Mid Level (3-5 years)' },
  { value: 'senior-level', label: 'Senior Level (6-10 years)' },
  { value: 'executive', label: 'Executive (10+ years)' },
  { value: 'internship', label: 'Internship/Student' }
];

// Employment Type for Compliance
export const EMPLOYMENT_TYPES = [
  { value: 'permanent', label: 'Permanent' },
  { value: 'contractual', label: 'Contractual' },
  { value: 'probationary', label: 'Probationary' },
  { value: 'project-based', label: 'Project-based' },
  { value: 'seasonal', label: 'Seasonal' }
];

export default {
  EMPLOYER_TYPES,
  EDUCATION_LEVELS,
  SALARY_RANGES_PHP,
  SALARY_PERIODS,
  CURRENCIES,
  DEFAULT_PRESCREEN_QUESTIONS,
  OVERSEAS_STATEMENTS,
  INDUSTRY_CATEGORIES,
  FORM_TOOLTIPS,
  JOB_TYPES,
  WORK_MODES,
  EXPERIENCE_LEVELS,
  EMPLOYMENT_TYPES
};
