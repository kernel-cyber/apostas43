-- Force type regeneration by adding a comment to trigger sync
COMMENT ON TABLE public.pilots IS 'Pilots racing in Area 43 events';
COMMENT ON TABLE public.matches IS 'Racing matches between pilots';
COMMENT ON TABLE public.bets IS 'User bets on racing matches';
COMMENT ON TABLE public.events IS 'Racing events and tournaments';
COMMENT ON TABLE public.user_points IS 'User points for betting';
COMMENT ON TABLE public.user_roles IS 'User role management';
COMMENT ON TABLE public.profiles IS 'User profile information';