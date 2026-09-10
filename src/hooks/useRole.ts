import { useQuery } from "@tanstack/react-query";
import { supabase } from "../../config/config";

export function useRole() {
  const { data, isLoading } = useQuery({
    queryKey: ["authUser"],
    queryFn: async () => {
        
      // getUser() securely requests the fresh user object from the Supabase Auth server
     
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error || !user) return null;
      return user;
    },
    // Use TanStack Query's select feature to transform and derive the role state
    select: (user) => {
      // Prioritize secure app_metadata over user_metadata
      const role = user?.app_metadata?.role || user?.user_metadata?.role;
      console.log(user,role)
      
      return {
        role,
        isLoggedIn: !!user,
        isAdmin: role === "admin",
      };
    },
    staleTime: 1000 * 60 * 5, // 5 minutes cache window
  });

  // Handle the loading state accurately
  return {
    isLoading,
    isLoggedIn: data?.isLoggedIn ?? false,
    role: data?.role ?? "user",
    isAdmin: data?.isAdmin ?? false,
  };
}
