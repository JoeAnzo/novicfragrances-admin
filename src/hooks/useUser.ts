import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../config/config";
import { AUTH_KEYS } from "../constants/queryKeys";

export function useUser() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: AUTH_KEYS.session,
    queryFn: async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      return session?.user ?? null;
    },
    staleTime: Infinity, // The explicit session shouldn't declare updates unless triggered by triggers
  });

  // Watch background state triggers and explicitly populate or eject data caches
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
        queryClient.setQueryData(AUTH_KEYS.session, session?.user ?? null);
      } else if (event === 'SIGNED_OUT') {
        queryClient.setQueryData(AUTH_KEYS.session, null);
        queryClient.clear(); // Security baseline: wipe sensitive query caches when logging out
      }
    });

    return () => subscription.unsubscribe();
  }, [queryClient]);

  return query;
}
