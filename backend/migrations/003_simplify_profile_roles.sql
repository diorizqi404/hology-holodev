-- Simplify profiles.role to farmer | reviewer only
-- Legacy: farmer_group_leader, ppl, admin → reviewer

UPDATE profiles
SET role = 'reviewer'
WHERE role IN ('farmer_group_leader', 'ppl', 'admin');

-- Any unexpected values fall back to farmer
UPDATE profiles
SET role = 'farmer'
WHERE role NOT IN ('farmer', 'reviewer');

ALTER TABLE profiles
  DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE profiles
  ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('farmer', 'reviewer'));

COMMENT ON COLUMN profiles.role IS 'Roles: farmer, reviewer';
