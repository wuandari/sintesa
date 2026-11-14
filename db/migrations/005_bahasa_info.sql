-- Cache penjelasan komponen sekarang per bahasa (id / en).
ALTER TABLE ar_part_info ADD COLUMN lang text NOT NULL DEFAULT 'id';
ALTER TABLE ar_part_info DROP CONSTRAINT ar_part_info_pkey;
ALTER TABLE ar_part_info ADD PRIMARY KEY (mission_slug, part, lang);
