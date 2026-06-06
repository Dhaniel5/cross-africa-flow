
CREATE OR REPLACE FUNCTION public.submit_waitlist_signup(_full_name text, _phone text, _email text, _country text, _user_type text, _pain_point text DEFAULT NULL::text, _referred_by text DEFAULT NULL::text)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  new_code text;
  clean_name text;
  clean_phone text;
  clean_email text;
  clean_pain text;
  clean_ref text;
BEGIN
  clean_name  := btrim(coalesce(_full_name, ''));
  clean_phone := btrim(coalesce(_phone, ''));
  clean_email := lower(btrim(coalesce(_email, '')));
  clean_pain  := btrim(coalesce(_pain_point, ''));
  clean_ref   := btrim(coalesce(_referred_by, ''));

  IF length(clean_name) < 2 OR length(clean_name) > 100
     OR clean_name !~ '^[[:alpha:] .''\-]+$' THEN
    RAISE EXCEPTION 'invalid_full_name';
  END IF;

  IF length(clean_phone) < 7 OR length(clean_phone) > 20
     OR clean_phone !~ '^[+0-9[:space:]()\-]+$'
     OR length(regexp_replace(clean_phone, '[^0-9]', '', 'g')) < 7 THEN
    RAISE EXCEPTION 'invalid_phone';
  END IF;

  IF length(clean_email) > 255
     OR clean_email !~ '^[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,}$' THEN
    RAISE EXCEPTION 'invalid_email';
  END IF;

  IF _country NOT IN ('Nigeria','Ghana','Other') THEN
    RAISE EXCEPTION 'invalid_country';
  END IF;
  IF _user_type NOT IN ('Student','Freelancer','Business Owner','POS Agent','Other') THEN
    RAISE EXCEPTION 'invalid_user_type';
  END IF;

  IF length(clean_pain) < 10 OR length(clean_pain) > 500 THEN
    RAISE EXCEPTION 'invalid_pain_point';
  END IF;

  IF clean_ref <> '' AND (length(clean_ref) > 32 OR clean_ref !~ '^[a-zA-Z0-9]+$') THEN
    clean_ref := '';
  END IF;

  INSERT INTO public.waitlist_signups (full_name, phone, email, country, user_type, pain_point, referred_by)
  VALUES (clean_name, clean_phone, clean_email, _country, _user_type, clean_pain, NULLIF(clean_ref, ''))
  RETURNING referral_code INTO new_code;

  RETURN new_code;
END;
$function$;
