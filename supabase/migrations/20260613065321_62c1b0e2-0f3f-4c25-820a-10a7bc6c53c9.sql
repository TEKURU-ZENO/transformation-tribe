GRANT SELECT, INSERT, UPDATE, DELETE ON public.squads TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.squad_members TO authenticated;
GRANT ALL ON public.squads TO service_role;
GRANT ALL ON public.squad_members TO service_role;

GRANT EXECUTE ON FUNCTION public.create_squad(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.join_squad_by_code(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_squad_invite_code(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_squad_member(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.shares_squad_with(uuid, uuid) TO authenticated;