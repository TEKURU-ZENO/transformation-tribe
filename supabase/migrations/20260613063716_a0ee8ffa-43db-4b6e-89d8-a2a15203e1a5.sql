
-- Revoke broad EXECUTE from PUBLIC and anon on all SECURITY DEFINER functions
REVOKE EXECUTE ON FUNCTION public.is_squad_member(uuid, uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.shares_squad_with(uuid, uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_squad_invite_code(uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.create_squad(text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.join_squad_by_code(text) FROM PUBLIC, anon;

-- Re-grant only what the app actually needs from the client
GRANT EXECUTE ON FUNCTION public.create_squad(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.join_squad_by_code(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_squad_invite_code(uuid) TO authenticated;
