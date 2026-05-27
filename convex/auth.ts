import { Password } from "@convex-dev/auth/providers/Password";
import { convexAuth } from "@convex-dev/auth/server";
import { DataModel } from "./_generated/dataModel";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    Password<DataModel>({
      profile(params) {
        return {
          email: params.email as string,
          name: (params.name as string | undefined) ?? undefined,
        };
      },
    }),
  ],
  callbacks: {
    async afterUserCreatedOrUpdated(ctx, { userId }) {
      const user = await ctx.db.get(userId);
      if (user) {
        const updates: Partial<typeof user> = {};
        let needsUpdate = false;

        if (user.verificationStatus === undefined) {
          updates.verificationStatus = "pending";
          needsUpdate = true;
        }
        if (user.totalTripsAsGoer === undefined) {
          updates.totalTripsAsGoer = 0;
          needsUpdate = true;
        }
        if (user.totalTripsAsRequester === undefined) {
          updates.totalTripsAsRequester = 0;
          needsUpdate = true;
        }
        if (user.createdAt === undefined) {
          updates.createdAt = Date.now();
          needsUpdate = true;
        }

        if (needsUpdate) {
          await ctx.db.patch(userId, updates);
        }
      }
    },
  },
});
