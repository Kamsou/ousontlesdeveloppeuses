-- Migration number: 0001 	 2025-12-20T18:57:10.658Z
ALTER TABLE developers ADD COLUMN profile_type TEXT;
ALTER TABLE developers ADD COLUMN profile_phrase TEXT;
