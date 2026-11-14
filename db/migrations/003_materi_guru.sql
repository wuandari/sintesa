-- Materi AR buatan guru (model GLB sendiri) yang dibagikan ke satu kelas.
CREATE TABLE custom_missions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id uuid NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  teacher_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title text NOT NULL CHECK (char_length(title) BETWEEN 2 AND 100),
  level text,
  subject text,
  description text,
  model_url text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX custom_missions_class_idx ON custom_missions (class_id, created_at DESC);
ALTER TABLE library_files ADD COLUMN note text;
