-- Developers table
CREATE TABLE IF NOT EXISTS developers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  github_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  avatar_url TEXT,
  bio TEXT,
  location TEXT,
  years_experience INTEGER,
  website TEXT,
  github_url TEXT,
  linkedin_url TEXT,
  twitter_url TEXT,
  created_at INTEGER DEFAULT (unixepoch()),
  updated_at INTEGER DEFAULT (unixepoch())
);

-- Developer skills
CREATE TABLE IF NOT EXISTS developer_skills (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  developer_id INTEGER NOT NULL REFERENCES developers(id) ON DELETE CASCADE,
  skill_name TEXT NOT NULL
);

-- Developer open to tags
CREATE TABLE IF NOT EXISTS developer_open_to (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  developer_id INTEGER NOT NULL REFERENCES developers(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('conference', 'mentoring', 'freelance', 'cdi', 'coffee_chat', 'pair_programming', 'cv_review'))
);

-- Speaker profiles
CREATE TABLE IF NOT EXISTS speaker_profiles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  developer_id INTEGER UNIQUE NOT NULL REFERENCES developers(id) ON DELETE CASCADE,
  topics TEXT,
  past_talks_url TEXT,
  available INTEGER DEFAULT 1,
  travel_willing INTEGER DEFAULT 0,
  remote_ok INTEGER DEFAULT 1
);

-- Companies
CREATE TABLE IF NOT EXISTS companies (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  logo_url TEXT,
  website TEXT,
  description TEXT,
  location TEXT,
  created_at INTEGER DEFAULT (unixepoch())
);

-- Company reviews
CREATE TABLE IF NOT EXISTS company_reviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  developer_id INTEGER NOT NULL REFERENCES developers(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  is_inclusive INTEGER NOT NULL,
  comment TEXT,
  created_at INTEGER DEFAULT (unixepoch())
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_developer_skills_developer ON developer_skills(developer_id);
CREATE INDEX IF NOT EXISTS idx_developer_open_to_developer ON developer_open_to(developer_id);
CREATE INDEX IF NOT EXISTS idx_developer_open_to_type ON developer_open_to(type);
CREATE INDEX IF NOT EXISTS idx_speaker_profiles_available ON speaker_profiles(available);
CREATE INDEX IF NOT EXISTS idx_company_reviews_company ON company_reviews(company_id);
