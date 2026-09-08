-- Store the user-drawn land boundary as an ordered latitude/longitude polygon.
ALTER TABLE lands ADD COLUMN IF NOT EXISTS boundary_polygon JSONB;