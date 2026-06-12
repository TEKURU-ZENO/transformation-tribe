
-- Hide invite_code column from non-owners via column-level privileges
REVOKE SELECT ON public.squads FROM authenticated;
GRANT SELECT (id, created_at, owner_id, name) ON public.squads TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.squads TO authenticated;

-- Owner-only getter for invite code
CREATE OR REPLACE FUNCTION public.get_squad_invite_code(_squad_id uuid)
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT invite_code FROM public.squads
  WHERE id = _squad_id AND owner_id = auth.uid()
$$;

-- Create squad + auto-join + return invite code in one trusted call
CREATE OR REPLACE FUNCTION public.create_squad(_name text)
RETURNS TABLE(id uuid, name text, invite_code text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid uuid := auth.uid();
  _new public.squads;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  IF _name IS NULL OR length(btrim(_name)) = 0 OR length(_name) > 60 THEN
    RAISE EXCEPTION 'Invalid squad name';
  END IF;
  INSERT INTO public.squads(name, owner_id) VALUES (btrim(_name), _uid)
  RETURNING * INTO _new;
  INSERT INTO public.squad_members(squad_id, user_id) VALUES (_new.id, _uid);
  RETURN QUERY SELECT _new.id, _new.name, _new.invite_code;
END;
$$;

-- Join by code without exposing invite_code to callers
CREATE OR REPLACE FUNCTION public.join_squad_by_code(_code text)
RETURNS TABLE(id uuid, name text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid uuid := auth.uid();
  _sid uuid;
  _sname text;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  SELECT s.id, s.name INTO _sid, _sname
  FROM public.squads s
  WHERE s.invite_code = upper(btrim(_code))
  LIMIT 1;
  IF _sid IS NULL THEN RAISE EXCEPTION 'Invalid invite code'; END IF;
  INSERT INTO public.squad_members(squad_id, user_id)
  VALUES (_sid, _uid)
  ON CONFLICT DO NOTHING;
  RETURN QUERY SELECT _sid, _sname;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_squad_invite_code(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_squad(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.join_squad_by_code(text) TO authenticated;
