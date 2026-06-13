
-- 1) Cap task XP at the database level
ALTER TABLE public.tasks ADD CONSTRAINT tasks_xp_range CHECK (xp BETWEEN 0 AND 100);

-- 2) Tighten profiles SELECT policy to self + squad mates
DROP POLICY IF EXISTS "Profiles readable by authed" ON public.profiles;
CREATE POLICY "Profiles readable by self or squad mates"
ON public.profiles FOR SELECT TO authenticated
USING (auth.uid() = id OR public.shares_squad_with(auth.uid(), id));

-- 3) Prevent client from writing xp/level directly
DROP POLICY IF EXISTS "Profiles update own" ON public.profiles;
CREATE POLICY "Profiles update own non-xp fields"
ON public.profiles FOR UPDATE TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE OR REPLACE FUNCTION public.prevent_xp_tampering()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Allow xp/level changes only when invoked by SECURITY DEFINER RPCs
  -- (which set a session-local flag) or by service_role.
  IF (NEW.xp IS DISTINCT FROM OLD.xp OR NEW.level IS DISTINCT FROM OLD.level)
     AND current_setting('app.allow_xp_write', true) IS DISTINCT FROM 'on'
     AND current_user <> 'service_role' THEN
    RAISE EXCEPTION 'Direct updates to xp/level are not allowed';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_prevent_xp_tampering ON public.profiles;
CREATE TRIGGER profiles_prevent_xp_tampering
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.prevent_xp_tampering();

-- 4) Atomic, server-enforced complete/uncomplete RPCs
CREATE OR REPLACE FUNCTION public.complete_task(_task_id uuid)
RETURNS TABLE(new_xp integer, new_level integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid uuid := auth.uid();
  _task public.tasks;
  _profile public.profiles;
  _xp integer;
  _level integer;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;

  SELECT * INTO _task FROM public.tasks WHERE id = _task_id AND user_id = _uid;
  IF _task IS NULL THEN RAISE EXCEPTION 'Task not found'; END IF;
  IF _task.completed THEN
    SELECT xp, level INTO _xp, _level FROM public.profiles WHERE id = _uid;
    RETURN QUERY SELECT _xp, _level;
    RETURN;
  END IF;

  UPDATE public.tasks SET completed = true, completed_at = now()
    WHERE id = _task_id AND user_id = _uid;

  PERFORM set_config('app.allow_xp_write', 'on', true);
  SELECT * INTO _profile FROM public.profiles WHERE id = _uid;
  _xp := COALESCE(_profile.xp, 0) + _task.xp;
  _level := GREATEST(1, floor(sqrt(_xp / 50.0))::int + 1);
  UPDATE public.profiles SET xp = _xp, level = _level WHERE id = _uid;
  PERFORM set_config('app.allow_xp_write', 'off', true);

  INSERT INTO public.activities(user_id, emoji, message)
    VALUES (_uid, '⚡', 'completed ' || _task.title);

  RETURN QUERY SELECT _xp, _level;
END;
$$;

CREATE OR REPLACE FUNCTION public.uncomplete_task(_task_id uuid)
RETURNS TABLE(new_xp integer, new_level integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid uuid := auth.uid();
  _task public.tasks;
  _profile public.profiles;
  _xp integer;
  _level integer;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  SELECT * INTO _task FROM public.tasks WHERE id = _task_id AND user_id = _uid;
  IF _task IS NULL THEN RAISE EXCEPTION 'Task not found'; END IF;

  UPDATE public.tasks SET completed = false, completed_at = NULL
    WHERE id = _task_id AND user_id = _uid;

  IF _task.completed THEN
    PERFORM set_config('app.allow_xp_write', 'on', true);
    SELECT * INTO _profile FROM public.profiles WHERE id = _uid;
    _xp := GREATEST(0, COALESCE(_profile.xp, 0) - _task.xp);
    _level := GREATEST(1, floor(sqrt(_xp / 50.0))::int + 1);
    UPDATE public.profiles SET xp = _xp, level = _level WHERE id = _uid;
    PERFORM set_config('app.allow_xp_write', 'off', true);
  ELSE
    SELECT xp, level INTO _xp, _level FROM public.profiles WHERE id = _uid;
  END IF;

  RETURN QUERY SELECT _xp, _level;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.complete_task(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.uncomplete_task(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.prevent_xp_tampering() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.complete_task(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.uncomplete_task(uuid) TO authenticated;
