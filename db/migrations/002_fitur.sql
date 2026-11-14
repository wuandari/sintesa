-- Tahap 2-6: misi AR, tugas, penilaian, library.

CREATE TABLE mission_progress (
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  mission_slug text NOT NULL,
  best_score int NOT NULL CHECK (best_score BETWEEN 0 AND 100),
  attempts int NOT NULL DEFAULT 1,
  passed boolean NOT NULL DEFAULT false,
  completed_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, mission_slug)
);

CREATE TABLE class_missions (
  class_id uuid NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  mission_slug text NOT NULL,
  assigned_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (class_id, mission_slug)
);

CREATE TABLE ar_part_info (
  mission_slug text NOT NULL,
  part text NOT NULL,
  info text NOT NULL,
  source text NOT NULL CHECK (source IN ('AI', 'BAWAAN')),
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (mission_slug, part)
);

CREATE TABLE tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id uuid NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  teacher_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title text NOT NULL CHECK (char_length(title) BETWEEN 2 AND 120),
  description text,
  points int NOT NULL CHECK (points BETWEEN 1 AND 10000),
  due_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX tasks_class_idx ON tasks (class_id, created_at DESC);

CREATE TABLE task_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  name text NOT NULL,
  url text NOT NULL,
  size int NOT NULL,
  mime text
);

CREATE TABLE submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  revision_count int NOT NULL DEFAULT 0 CHECK (revision_count >= 0),
  status text NOT NULL DEFAULT 'SUBMITTED' CHECK (status IN ('SUBMITTED', 'GRADED', 'REVISION_REQUESTED')),
  score int CHECK (score BETWEEN 0 AND 100),
  feedback text,
  submitted_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (task_id, student_id)
);

CREATE TABLE submission_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id uuid NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
  revision int NOT NULL DEFAULT 0,
  name text NOT NULL,
  url text NOT NULL,
  size int NOT NULL,
  mime text,
  score int CHECK (score BETWEEN 0 AND 100),
  feedback text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX submission_files_sub_idx ON submission_files (submission_id, revision);

CREATE TABLE library_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name text NOT NULL,
  url text NOT NULL,
  size int NOT NULL,
  mime text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX library_user_idx ON library_files (user_id, created_at DESC);
