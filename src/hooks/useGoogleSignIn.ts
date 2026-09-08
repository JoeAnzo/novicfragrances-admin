import { useMutation } from "@tanstack/react-query";
import { supabase } from "../../config/config";

export function useGoogleLogin() {
  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          // Instructs the engine to return to the active application origins
          redirectTo: `${window.location.origin}`, 
        },
      });
      if (error) throw error;
      return data;
    },
    onError: (error: Error) => {
      console.error('OAuth configuration failed:', error.message);
    },
  });
}