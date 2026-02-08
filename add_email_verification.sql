-- 1. Add verification status column to public.users
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS is_email_verified BOOLEAN DEFAULT FALSE;

-- 2. Backfill existing data
-- Note: This requires permissions to read auth.users which standard postgres/service_role has.
DO $$
BEGIN
    UPDATE public.users u
    SET is_email_verified = (au.email_confirmed_at IS NOT NULL)
    FROM auth.users au
    WHERE u.id = au.id;
END $$;

-- 3. Create a function to sync verification status
CREATE OR REPLACE FUNCTION public.sync_user_verification()
RETURNS TRIGGER AS $$
BEGIN
    -- If email was just confirmed
    IF (NEW.email_confirmed_at IS NOT NULL AND (OLD.email_confirmed_at IS NULL OR OLD.email_confirmed_at != NEW.email_confirmed_at)) THEN
        UPDATE public.users 
        SET is_email_verified = TRUE 
        WHERE id = NEW.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Create trigger on auth.users to run this function
DROP TRIGGER IF EXISTS on_auth_user_verification_sync ON auth.users;
CREATE TRIGGER on_auth_user_verification_sync
AFTER UPDATE ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.sync_user_verification();

-- 5. Ensure new users get correct status on insert if they are auto-confirmed (rare but possible)
CREATE OR REPLACE FUNCTION public.handle_new_user_verification()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.users 
    SET is_email_verified = (NEW.email_confirmed_at IS NOT NULL)
    WHERE id = NEW.id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created_verification ON auth.users;
CREATE TRIGGER on_auth_user_created_verification
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user_verification();
