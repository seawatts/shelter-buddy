"use client";

import type { ActiveSessionResource, UserResource } from "@clerk/types";
import { useSession, useUser } from "@clerk/nextjs";
import { createBrowserClient } from "@supabase/ssr";

import { env } from "~/env.client";

export const useClient = () => {
  const { user } = useUser();
  const { session } = useSession();

  return createClient({
    session: session,
    user: user,
  });
};

const createClient = (props: {
  user?: UserResource | null;
  session?: ActiveSessionResource | null;
}) =>
  createBrowserClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      global: {
        // Get the custom Supabase token from Clerk
        fetch: async (url, options = {}) => {
          const clerkToken = await props.session?.getToken({
            template: "supabase",
          });

          // Insert the Clerk Supabase token into the headers
          const headers = new Headers(options.headers);
          headers.set("Authorization", `Bearer ${clerkToken}`);

          // Now call the default fetch
          return fetch(url, {
            ...options,
            headers,
          });
        },
      },
    },
  );
