import { convexAuth } from "@convex-dev/auth/server";
import Password from "@auth/core/providers/credentials";

export const { auth, signIn, signOut, store } = convexAuth({
  providers: [Password],
});
