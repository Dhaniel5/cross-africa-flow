
-- Remove the broad insert policy and grants; route signups through a SECURITY DEFINER function instead
DROP POLICY IF EXISTS "Anyone can sign up to waitlist" ON public.waitlist_signups;

REVOKE ALL ON public.waitlist_signups FROM anon, authenticated;
GRANT ALL ON public.waitlist_signups TO service_role;

-- Explicit restrictive baseline: no SELECT/UPDATE/DELETE for anon or authenticated
CREATE POLICY "No public read" ON public.waitlist_signups FOR SELECT USING (false);
CREATE POLICY "No public update" ON public.waitlist_signups FOR UPDATE USING (false) WITH CHECK (false);
CREATE POLICY "No public delete" ON public.waitlist_signups FOR DELETE USING (false);

-- Secure signup RPC: validates input, inserts row, returns only the referral code
CREATE OR REPLACE FUNCTION public.submit_waitlist_signup(
  _full_name text,
  _phone text,
  _email text,
  _country text,
  _user_type text,
  _pain_point text DEFAULT NULL,
  _referred_by text DEFAULT NULL
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_code text;
BEGIN
  IF _full_name IS NULL OR length(btrim(_full_name)) < 2 OR length(_full_name) > 100 THEN
    RAISE EXCEPTION 'invalid_full_name';
  END IF;
  IF _phone IS NULL OR length(btrim(_phone)) < 7 OR length(_phone) > 20 OR _phone !~ '^[+\d\s()\-]+$' THEN
    RAISE EXCEPTION 'invalid_phone';
  END IF;
  IF _email IS NULL OR length(_email) > 255 OR _email !~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' THEN
    RAISE EXCEPTION 'invalid_email';
  END IF;
  IF _country NOT IN ('Nigeria','Ghana','Other') THEN
    RAISE EXCEPTION 'invalid_country';
  END IF;
  IF _user_type NOT IN ('Student','Freelancer','Business Owner','POS Agent','Other') THEN
    RAISE EXCEPTION 'invalid_user_type';
  END IF;
  IF _pain_point IS NOT NULL AND length(_pain_point) > 500 THEN
    RAISE EXCEPTION 'invalid_pain_point';
  END IF;

  INSERT INTO public.waitlist_signups (full_name, phone, email, country, user_type, pain_point, referred_by)
  VALUES (btrim(_full_name), btrim(_phone), lower(btrim(_email)), _country, _user_type, NULLIF(btrim(_pain_point), ''), _referred_by)
  RETURNING referral_code INTO new_code;

  RETURN new_code;
END;
$$;

REVOKE ALL ON FUNCTION public.submit_waitlist_signup(text,text,text,text,text,text,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_waitlist_signup(text,text,text,text,text,text,text) TO anon, authenticated;
