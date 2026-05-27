import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { auth } from "./auth";
import { api } from "./_generated/api";

const http = httpRouter();

// Mount the Convex Auth routes
auth.addHttpRoutes(http);

// Webhook for SheerID verification success
http.route({
  path: "/sheerid-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const body = await request.json();
      console.log("SheerID Webhook received:", body);

      // In SheerID, we pass userId in the externalSessionId or metadata
      // Let's look for userId in the request payload
      const userId = body.userId || body.externalSessionId;
      const verificationId = body.verificationId || body.currentVerificationId;

      if (!userId) {
        return new Response("Missing userId", { status: 400 });
      }

      // Update user verification status to verified
      await ctx.runMutation(api.users.verifyUserByWebhook, {
        userId,
        verificationId,
        college: body.collegeName || "Verified College",
      });

      return new Response("OK", { status: 200 });
    } catch (err: any) {
      console.error("Webhook processing error:", err);
      return new Response("Internal Server Error", { status: 500 });
    }
  }),
});

export default http;
