-- Add organization_id to feedback tables
-- Bu script, feedback tablolarına eksik olan organization_id sütununu ekler.

-- 1. feedback_suggestions
ALTER TABLE feedback_suggestions 
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) DEFAULT 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

-- 2. feedback_responses
ALTER TABLE feedback_responses 
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) DEFAULT 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

-- 3. feedback_votes
ALTER TABLE feedback_votes 
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) DEFAULT 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

-- 4. feedback_categories
ALTER TABLE feedback_categories 
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) DEFAULT 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
