import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import type { LoginInput } from "../../schemas/login.schema";
import { signInWithEmail } from "../../services/supabase";

export function useSignInMutation() {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (credentials: LoginInput) => {
      const result = await signInWithEmail(credentials);

      if (!result.success) {
        throw new Error(result.error);
      }

      return result;
    },
    onSuccess: () => {
      navigate("/");
    },
  });
}
