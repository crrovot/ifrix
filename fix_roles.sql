-- Fix for monitor_users_role_check constraint
-- This script updates the allowed roles to include 'technician'

-- 1. Drop the existing constraint
ALTER TABLE monitor_users DROP CONSTRAINT IF EXISTS monitor_users_role_check;

-- 2. Add the correct constraint including 'technician'
ALTER TABLE monitor_users ADD CONSTRAINT monitor_users_role_check 
    CHECK (role IN ('admin', 'creator', 'technician'));

-- 3. Verify it worked by checking the constraint definition (Optional, just for info)
-- SELECT conname, pg_get_constraintdef(oid) 
-- FROM pg_constraint 
-- WHERE conrelid = 'monitor_users'::regclass;
