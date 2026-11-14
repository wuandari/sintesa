-- Streak harian (penyemangat) dan data profil murid.
ALTER TABLE users
  ADD COLUMN streak_count integer NOT NULL DEFAULT 0,
  ADD COLUMN streak_best  integer NOT NULL DEFAULT 0,
  ADD COLUMN streak_last  date,                 -- tanggal (WIB) terakhir murid membuka Sintesa
  ADD COLUMN nis          text,
  ADD COLUMN bio          text;
