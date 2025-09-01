-- Migration: Add status column to articles table
-- Execute this script in Supabase SQL Editor

-- 1. Create ENUM for article status
CREATE TYPE article_status AS ENUM ('draft', 'in-progress', 'published', 'paused', 'ready-to-publish');

-- 2. Add status column to articles table
ALTER TABLE articles 
ADD COLUMN status article_status DEFAULT 'draft';

-- 3. Create index for status column
CREATE INDEX idx_articles_status ON articles(status);

-- 4. Update existing articles to have draft status (if any exist)
UPDATE articles SET status = 'draft' WHERE status IS NULL;
