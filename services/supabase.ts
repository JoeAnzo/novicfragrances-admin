import type { LoginInput } from '../schemas/login.schema';
import { supabase } from '../config/config';


export const signInWithEmail = async (credentials: LoginInput) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, user: data.user, session: data.session };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An unexpected authentication error occurred.';
    return { success: false, error: message };
  }
};


export const signOutUser = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) return { success: false, error: error.message };
  return { success: true };
};
