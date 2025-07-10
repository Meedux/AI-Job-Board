-- ============================================================================
-- Job Board PostgreSQL Database Schema
-- Complete migration from Google Sheets to PostgreSQL
-- ============================================================================

-- Enable UUID extension for generating unique IDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- COMPANIES TABLE
-- ============================================================================
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    logo_url TEXT,
    website_url TEXT,
    description TEXT,
    location VARCHAR(255),
    industry VARCHAR(100),
    size_range VARCHAR(50), -- e.g., "1-10", "11-50", "51-200", etc.
    founded_year INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes for search performance
    CONSTRAINT companies_name_unique UNIQUE(name)
);

-- Index for company name searches
CREATE INDEX idx_companies_name ON companies(name);
CREATE INDEX idx_companies_industry ON companies(industry);

-- ============================================================================
-- JOB CATEGORIES TABLE
-- ============================================================================
CREATE TABLE job_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(50), -- Font icon class or emoji
    color VARCHAR(7), -- Hex color code
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for category searches
CREATE INDEX idx_job_categories_slug ON job_categories(slug);
CREATE INDEX idx_job_categories_active ON job_categories(is_active);

-- ============================================================================
-- JOBS TABLE
-- ============================================================================
CREATE TABLE jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT, -- Full job description (can store HTML/Markdown)
    content_doc_url TEXT, -- Google Docs URL for backward compatibility
    
    -- Salary Information
    salary_from INTEGER, -- Minimum salary
    salary_to INTEGER,   -- Maximum salary
    salary_currency VARCHAR(3) DEFAULT 'PHP', -- Currency code (PHP, USD, etc.)
    salary_period VARCHAR(20) DEFAULT 'monthly', -- monthly, annually, hourly
    salary_negotiable BOOLEAN DEFAULT FALSE,
    
    -- Job Details
    location VARCHAR(255),
    remote_type VARCHAR(20) DEFAULT 'no', -- 'no', 'hybrid', 'full', 'yes'
    job_type VARCHAR(50), -- full-time, part-time, contract, freelance, internship
    experience_level VARCHAR(50), -- entry, junior, mid, senior, lead, executive
    
    -- Requirements
    required_skills TEXT[], -- Array of required skills
    preferred_skills TEXT[], -- Array of preferred skills
    education_requirements TEXT,
    experience_years_min INTEGER,
    experience_years_max INTEGER,
    
    -- Application Details
    apply_url TEXT,
    apply_email VARCHAR(255),
    application_deadline TIMESTAMP WITH TIME ZONE,
    external_id VARCHAR(255), -- For tracking external job board IDs
    
    -- Company Information
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    
    -- Status and Metadata
    status VARCHAR(20) DEFAULT 'active', -- active, paused, closed, expired
    is_featured BOOLEAN DEFAULT FALSE,
    is_urgent BOOLEAN DEFAULT FALSE,
    views_count INTEGER DEFAULT 0,
    applications_count INTEGER DEFAULT 0,
    
    -- Timestamps
    posted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Search and SEO
    meta_title VARCHAR(255),
    meta_description TEXT,
    keywords TEXT[],
    
    CONSTRAINT jobs_slug_unique UNIQUE(slug),
    CONSTRAINT jobs_valid_salary CHECK (salary_from IS NULL OR salary_to IS NULL OR salary_from <= salary_to),
    CONSTRAINT jobs_valid_experience CHECK (experience_years_min IS NULL OR experience_years_max IS NULL OR experience_years_min <= experience_years_max)
);

-- Indexes for job searches and filters
CREATE INDEX idx_jobs_slug ON jobs(slug);
CREATE INDEX idx_jobs_company_id ON jobs(company_id);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_location ON jobs(location);
CREATE INDEX idx_jobs_remote_type ON jobs(remote_type);
CREATE INDEX idx_jobs_job_type ON jobs(job_type);
CREATE INDEX idx_jobs_experience_level ON jobs(experience_level);
CREATE INDEX idx_jobs_posted_at ON jobs(posted_at DESC);
CREATE INDEX idx_jobs_expires_at ON jobs(expires_at);
CREATE INDEX idx_jobs_salary_range ON jobs(salary_from, salary_to);
CREATE INDEX idx_jobs_featured ON jobs(is_featured) WHERE is_featured = TRUE;
CREATE INDEX idx_jobs_search ON jobs USING GIN(to_tsvector('english', title || ' ' || COALESCE(description, '')));

-- ============================================================================
-- JOB CATEGORIES JUNCTION TABLE
-- ============================================================================
CREATE TABLE job_category_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES job_categories(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT job_category_unique UNIQUE(job_id, category_id)
);

-- Indexes for category filtering
CREATE INDEX idx_job_category_job_id ON job_category_assignments(job_id);
CREATE INDEX idx_job_category_category_id ON job_category_assignments(category_id);

-- ============================================================================
-- USERS TABLE (for applicants and employers)
-- ============================================================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255), -- For local auth
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    
    -- User Type and Status
    user_type VARCHAR(20) DEFAULT 'applicant', -- applicant, employer, admin
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Profile Information
    avatar_url TEXT,
    bio TEXT,
    location VARCHAR(255),
    website_url TEXT,
    linkedin_url TEXT,
    github_url TEXT,
    
    -- Company Association (for employers)
    company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
    
    -- Authentication
    email_verification_token VARCHAR(255),
    email_verified_at TIMESTAMP WITH TIME ZONE,
    password_reset_token VARCHAR(255),
    password_reset_expires_at TIMESTAMP WITH TIME ZONE,
    last_login_at TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for user operations
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_user_type ON users(user_type);
CREATE INDEX idx_users_company_id ON users(company_id);
CREATE INDEX idx_users_is_active ON users(is_active);

-- ============================================================================
-- JOB APPLICATIONS TABLE
-- ============================================================================
CREATE TABLE job_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL, -- Nullable for guest applications
    
    -- Application Data
    applicant_name VARCHAR(255) NOT NULL,
    applicant_email VARCHAR(255) NOT NULL,
    applicant_phone VARCHAR(20),
    cover_letter TEXT,
    resume_url TEXT,
    portfolio_url TEXT,
    
    -- Application Status
    status VARCHAR(20) DEFAULT 'pending', -- pending, reviewed, shortlisted, interviewed, rejected, hired
    notes TEXT, -- Internal notes from recruiters
    
    -- Timestamps
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT applications_job_user_unique UNIQUE(job_id, user_id) -- Prevent duplicate applications from same user
);

-- Indexes for application management
CREATE INDEX idx_applications_job_id ON job_applications(job_id);
CREATE INDEX idx_applications_user_id ON job_applications(user_id);
CREATE INDEX idx_applications_status ON job_applications(status);
CREATE INDEX idx_applications_applied_at ON job_applications(applied_at DESC);

-- ============================================================================
-- JOB BOOKMARKS/SAVED JOBS TABLE
-- ============================================================================
CREATE TABLE job_bookmarks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT bookmarks_job_user_unique UNIQUE(job_id, user_id)
);

-- Indexes for bookmark operations
CREATE INDEX idx_bookmarks_job_id ON job_bookmarks(job_id);
CREATE INDEX idx_bookmarks_user_id ON job_bookmarks(user_id);

-- ============================================================================
-- NOTIFICATIONS TABLE
-- ============================================================================
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Notification Content
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL, -- job_alert, application_update, system, etc.
    
    -- Related Data
    related_job_id UUID REFERENCES jobs(id) ON DELETE SET NULL,
    related_application_id UUID REFERENCES job_applications(id) ON DELETE SET NULL,
    action_url TEXT,
    
    -- Status
    is_read BOOLEAN DEFAULT FALSE,
    is_sent BOOLEAN DEFAULT FALSE, -- For email notifications
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for notification queries
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- ============================================================================
-- EMAIL SUBSCRIPTIONS TABLE
-- ============================================================================
CREATE TABLE email_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    
    -- Subscription Preferences
    job_alerts BOOLEAN DEFAULT TRUE,
    weekly_digest BOOLEAN DEFAULT TRUE,
    company_updates BOOLEAN DEFAULT FALSE,
    
    -- Filters for Job Alerts
    preferred_locations TEXT[],
    preferred_categories TEXT[],
    preferred_job_types TEXT[],
    preferred_experience_levels TEXT[],
    min_salary INTEGER,
    max_salary INTEGER,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    verification_token VARCHAR(255),
    verified_at TIMESTAMP WITH TIME ZONE,
    unsubscribe_token VARCHAR(255),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for email operations
CREATE INDEX idx_email_subscriptions_email ON email_subscriptions(email);
CREATE INDEX idx_email_subscriptions_active ON email_subscriptions(is_active);

-- ============================================================================
-- AUDIT LOG TABLE
-- ============================================================================
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(100),
    record_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for audit queries
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_table_name ON audit_logs(table_name);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- ============================================================================
-- VIEWS FOR COMMON QUERIES
-- ============================================================================

-- Jobs with company and category information
CREATE VIEW jobs_with_details AS
SELECT 
    j.*,
    c.name as company_name,
    c.logo_url as company_logo,
    c.website_url as company_website,
    c.location as company_location,
    ARRAY_AGG(DISTINCT cat.name) FILTER (WHERE cat.name IS NOT NULL) as categories,
    ARRAY_AGG(DISTINCT cat.slug) FILTER (WHERE cat.slug IS NOT NULL) as category_slugs
FROM jobs j
LEFT JOIN companies c ON j.company_id = c.id
LEFT JOIN job_category_assignments jca ON j.id = jca.job_id
LEFT JOIN job_categories cat ON jca.category_id = cat.id
GROUP BY j.id, c.name, c.logo_url, c.website_url, c.location;

-- Active jobs view (commonly used filters)
CREATE VIEW active_jobs AS
SELECT * FROM jobs_with_details 
WHERE status = 'active' 
AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP);

-- ============================================================================
-- FUNCTIONS AND TRIGGERS
-- ============================================================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers to relevant tables
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_job_categories_updated_at BEFORE UPDATE ON job_categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON jobs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_job_applications_updated_at BEFORE UPDATE ON job_applications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_subscriptions_updated_at BEFORE UPDATE ON email_subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically expire jobs
CREATE OR REPLACE FUNCTION expire_old_jobs()
RETURNS void AS $$
BEGIN
    UPDATE jobs 
    SET status = 'expired'
    WHERE status = 'active' 
    AND expires_at IS NOT NULL 
    AND expires_at < CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql;

-- Function to generate job slug from title
CREATE OR REPLACE FUNCTION generate_job_slug(job_title TEXT, company_name TEXT DEFAULT NULL)
RETURNS TEXT AS $$
DECLARE
    base_slug TEXT;
    final_slug TEXT;
    counter INTEGER := 0;
BEGIN
    -- Create base slug from title and company
    base_slug := LOWER(
        REGEXP_REPLACE(
            REGEXP_REPLACE(
                TRIM(job_title || COALESCE(' at ' || company_name, '')),
                '[^a-zA-Z0-9\s]', '', 'g'
            ),
            '\s+', '-', 'g'
        )
    );
    
    -- Ensure uniqueness
    final_slug := base_slug;
    WHILE EXISTS (SELECT 1 FROM jobs WHERE slug = final_slug) LOOP
        counter := counter + 1;
        final_slug := base_slug || '-' || counter;
    END LOOP;
    
    RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- INITIAL DATA
-- ============================================================================

-- Insert default job categories
INSERT INTO job_categories (name, slug, description, icon, color) VALUES
('Technology', 'technology', 'Software development, IT, and tech roles', '💻', '#3B82F6'),
('Marketing', 'marketing', 'Digital marketing, content, and advertising', '📈', '#EF4444'),
('Sales', 'sales', 'Sales, business development, and account management', '💼', '#10B981'),
('Design', 'design', 'UI/UX, graphic design, and creative roles', '🎨', '#8B5CF6'),
('Finance', 'finance', 'Accounting, finance, and investment roles', '💰', '#F59E0B'),
('Operations', 'operations', 'Operations, logistics, and supply chain', '⚙️', '#6B7280'),
('Human Resources', 'human-resources', 'HR, recruitment, and people operations', '👥', '#EC4899'),
('Customer Support', 'customer-support', 'Customer service and support roles', '🎧', '#06B6D4'),
('Healthcare', 'healthcare', 'Medical, nursing, and healthcare roles', '🏥', '#DC2626'),
('Education', 'education', 'Teaching, training, and education roles', '📚', '#059669'),
('Legal', 'legal', 'Legal, compliance, and regulatory roles', '⚖️', '#7C3AED'),
('Remote', 'remote', 'Fully remote and work-from-home opportunities', '🌍', '#F97316');

-- Insert sample companies (optional, for testing)
INSERT INTO companies (name, logo_url, website_url, description, location, industry) VALUES
('TechCorp Philippines', '/logos/techcorp.png', 'https://techcorp.ph', 'Leading technology company in the Philippines', 'Makati City, Metro Manila', 'Technology'),
('StartupHub Manila', '/logos/startuphub.png', 'https://startuphub.com', 'Innovation hub for startups and entrepreneurs', 'BGC, Metro Manila', 'Technology'),
('FinanceFirst', '/logos/financefirst.png', 'https://financefirst.ph', 'Premier financial services company', 'Ortigas, Metro Manila', 'Finance');

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Additional composite indexes for common query patterns
CREATE INDEX idx_jobs_active_location ON jobs(location) WHERE status = 'active';
CREATE INDEX idx_jobs_active_type ON jobs(job_type) WHERE status = 'active';
CREATE INDEX idx_jobs_active_remote ON jobs(remote_type) WHERE status = 'active';
CREATE INDEX idx_jobs_active_featured ON jobs(posted_at DESC, is_featured) WHERE status = 'active';

-- Full-text search index for job descriptions
CREATE INDEX idx_jobs_fulltext_search ON jobs USING GIN(to_tsvector('english', title || ' ' || COALESCE(description, '') || ' ' || location));

-- ============================================================================
-- PERMISSIONS AND SECURITY
-- ============================================================================

-- Create roles for different access levels
CREATE ROLE jobboard_read;
CREATE ROLE jobboard_write;
CREATE ROLE jobboard_admin;

-- Grant appropriate permissions
GRANT SELECT ON ALL TABLES IN SCHEMA public TO jobboard_read;
GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO jobboard_write;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO jobboard_admin;

-- Grant usage on sequences
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO jobboard_write;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO jobboard_admin;

-- Enable Row Level Security for sensitive tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_bookmarks ENABLE ROW LEVEL SECURITY;

-- Example RLS policies (customize based on your auth system)
CREATE POLICY users_own_data ON users FOR ALL USING (id = current_setting('app.current_user_id')::UUID);
CREATE POLICY applications_own_data ON job_applications FOR ALL USING (user_id = current_setting('app.current_user_id')::UUID);

-- ============================================================================
-- MAINTENANCE AND MONITORING
-- ============================================================================

-- Create a function to get database statistics
CREATE OR REPLACE FUNCTION get_jobboard_stats()
RETURNS TABLE(
    total_jobs BIGINT,
    active_jobs BIGINT,
    total_companies BIGINT,
    total_applications BIGINT,
    total_users BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*) FROM jobs) as total_jobs,
        (SELECT COUNT(*) FROM jobs WHERE status = 'active') as active_jobs,
        (SELECT COUNT(*) FROM companies) as total_companies,
        (SELECT COUNT(*) FROM job_applications) as total_applications,
        (SELECT COUNT(*) FROM users) as total_users;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- SCHEMA COMPLETE
-- ============================================================================

-- Set timezone to UTC for consistency
SET timezone = 'UTC';

-- Create indexes concurrently in production
-- Note: In production, you may want to create some indexes concurrently:
-- CREATE INDEX CONCURRENTLY idx_example ON table_name(column_name);

COMMENT ON DATABASE current_database() IS 'Job Board Application Database - Complete PostgreSQL migration from Google Sheets';
