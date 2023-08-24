import { Auth, AuthConfig } from "@auth/core";
import GitHub from "@auth/core/providers/github";
import Google from "@auth/core/providers/google";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "../../../db";
import { SolidAuth, SolidAuthConfig } from "@auth/solid-start";
import { env } from "../../../env";

export const authOpts = {
  adapter: DrizzleAdapter(db),
  providers: [
    GitHub({
      clientId: env.GITHUB_CLIENT_ID,
      clientSecret: env.GITHUB_CLIENT_SECRET,
    }),
    // Google({
    //   clientId: env.GOOGLE_CLIENT_ID,
    //   clientSecret: env.GOOGLE_CLIENT_SECRET,
    // }),
  ],
  callbacks: {
    async session({ session, user, token }) {
      const ses = Object.assign(session, { user, token });
      return ses;
    },
  },
} satisfies SolidAuthConfig;

export const { GET, POST } = SolidAuth(authOpts);
