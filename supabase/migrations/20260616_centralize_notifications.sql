-- Centralize notifications: remove per-user tracking
-- All users now see the same system-wide notifications

-- First, delete all existing per-user duplicate notifications
DELETE FROM public.notifications;

-- Drop per-user RLS policies that depend on user_id
DROP POLICY IF EXISTS notifications_select_own ON public.notifications;
DROP POLICY IF EXISTS notifications_update_own ON public.notifications;
DROP POLICY IF EXISTS notifications_delete_own ON public.notifications;

-- Drop the user_id foreign key constraint and column
ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS notifications_user_id_fkey;
ALTER TABLE public.notifications DROP COLUMN IF EXISTS user_id;
