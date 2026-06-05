-- 1) Roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- 2) Role check function (avoids recursive RLS)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;

-- 3) Admin-only RPC to read all waitlist signups
CREATE OR REPLACE FUNCTION public.admin_list_waitlist_signups()
RETURNS TABLE (
  id uuid,
  full_name text,
  phone text,
  email text,
  country text,
  user_type text,
  pain_point text,
  referral_code text,
  referred_by text,
  created_at timestamptz
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'not_authorized';
  END IF;

  RETURN QUERY
  SELECT w.id, w.full_name, w.phone, w.email, w.country, w.user_type,
         w.pain_point, w.referral_code, w.referred_by, w.created_at
  FROM public.waitlist_signups w
  ORDER BY w.created_at DESC;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_list_waitlist_signups() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_list_waitlist_signups() TO authenticated, service_role;