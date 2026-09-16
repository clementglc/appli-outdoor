import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Client Supabase pour les Server Components / Server Actions / Route Handlers.
 * Doit être recréé à chaque requête (ne pas mettre en cache/singleton global).
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // `setAll` appelé depuis un Server Component : ignorable si un
            // middleware rafraîchit déjà la session utilisateur.
          }
        },
      },
    }
  );
}
