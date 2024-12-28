import { PostHog } from "posthog-node";

import { env } from "../env";

export const posthog = new PostHog(env.POSTHOG_KEY, {
  flushAt: 1,
  flushInterval: 0,
  host: "https://us.i.posthog.com",
});
