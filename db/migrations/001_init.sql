-- Tahap 1: akun, kelas, dan XP.
-- Tabel untuk misi AR, tugas, dan library ditambahkan di migrasi berikutnya.

CREATE TABLE users (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name          text NOT NULL,
  email         text NOT NULL UNIQUE,          -- selalu disimpan huruf kecil
  password_hash text NOT NULL,
  role          text NOT NULL CHECK (role IN ('MURID', 'GURU', 'ADMIN')),
  avatar_url    text,
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- Buku besar XP: total XP murid = jumlah amount. Setiap pemberian XP tercatat dan tidak ganda.
CREATE TABLE xp_events (
  id         bigserial PRIMARY KEY,
  user_id    uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  kind       text NOT NULL CHECK (kind IN ('MISSION', 'TASK', 'REVISION', 'ADJUST')),
  amount     integer NOT NULL,
  ref_id     text NOT NULL,                     -- id misi / tugas / revisi terkait
  note       text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, kind, ref_id)                -- XP yang sama tidak bisa diberikan dua kali
);
CREATE INDEX xp_events_user_idx ON xp_events (user_id);

CREATE TABLE classes (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  description text,
  code        text NOT NULL UNIQUE,             -- contoh: KELAS-782BG
  teacher_id  uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX classes_teacher_idx ON classes (teacher_id);

CREATE TABLE class_members (
  class_id   uuid NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  joined_at  timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (class_id, student_id)
);
CREATE INDEX class_members_student_idx ON class_members (student_id);
