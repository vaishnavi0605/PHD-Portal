-- =========================================================
-- PhD Admission Portal - Supabase PostgreSQL Schema
-- Run this in Supabase SQL Editor
-- =========================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── admins table (for admin role check) ──
CREATE TABLE IF NOT EXISTS admins (
  id       SERIAL PRIMARY KEY,
  user_id  UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name     TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ── applications ──
CREATE TABLE IF NOT EXISTS applications (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email            TEXT,
  name             TEXT NOT NULL,
  dob              DATE,
  category         TEXT CHECK (category IN ('GEN','OBC','SC','ST')),
  address          TEXT,
  phone            TEXT,
  cgpa             FLOAT,
  graduation_marks FLOAT,
  nbhm_eligible    BOOLEAN DEFAULT FALSE,
  created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ── education ──
CREATE TABLE IF NOT EXISTS education (
  id             SERIAL PRIMARY KEY,
  application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
  level          TEXT CHECK (level IN ('10th','12th','Graduation','Post Graduation')),
  discipline     TEXT,
  institute      TEXT,
  study_type     TEXT CHECK (study_type IN ('Regular','Part-time')),
  year           INT,
  percentage     FLOAT,
  division       TEXT,
  UNIQUE(application_id, level)
);

-- ── exam_scores ──
CREATE TABLE IF NOT EXISTS exam_scores (
  id             SERIAL PRIMARY KEY,
  application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
  exam_type      TEXT CHECK (exam_type IN ('GATE','CSIR')),
  score          FLOAT,
  year           INT
);

-- =========================================================
-- Row Level Security (RLS)
-- =========================================================

ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE education     ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_scores   ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins        ENABLE ROW LEVEL SECURITY;

-- Applications: students can only see/edit their own
CREATE POLICY "Students: own application read"
  ON applications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Students: own application write"
  ON applications FOR ALL
  USING (auth.uid() = user_id);

-- Education: linked to own application
CREATE POLICY "Students: own education read"
  ON education FOR SELECT
  USING (
    application_id IN (
      SELECT id FROM applications WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Students: own education write"
  ON education FOR ALL
  USING (
    application_id IN (
      SELECT id FROM applications WHERE user_id = auth.uid()
    )
  );

-- Exam scores: linked to own application
CREATE POLICY "Students: own exam_scores read"
  ON exam_scores FOR SELECT
  USING (
    application_id IN (
      SELECT id FROM applications WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Students: own exam_scores write"
  ON exam_scores FOR ALL
  USING (
    application_id IN (
      SELECT id FROM applications WHERE user_id = auth.uid()
    )
  );

-- Admins: can read their own row
CREATE POLICY "Admins: own row"
  ON admins FOR SELECT
  USING (auth.uid() = user_id);

-- =========================================================
-- NOTE: The backend uses the SERVICE_ROLE key which bypasses
-- RLS entirely, so admins can read ALL data via the API.
-- =========================================================
