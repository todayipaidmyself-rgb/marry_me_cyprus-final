import { supabase } from "@/lib/supabase";

export async function signUpWithEmail(email: string, password: string) {
  return supabase.auth.signUp({
    email,
    password,
  });
}

export async function signInWithEmail(email: string, password: string) {
  return supabase.auth.signInWithPassword({
    email,
    password,
  });
}

export async function signOutSupabase() {
  return supabase.auth.signOut();
}

export async function getSupabaseSession() {
  return supabase.auth.getSession();
}

export async function getSupabaseUser() {
  return supabase.auth.getUser();
}
