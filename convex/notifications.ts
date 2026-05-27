import { v } from "convex/values";
import { internalAction } from "./_generated/server";
import { Resend } from "resend";

// Internal action to send notification emails via Resend
export const sendNotificationEmail = internalAction({
  args: {
    to: v.string(),
    subject: v.string(),
    body: v.string(),
  },
  handler: async (ctx, args) => {
    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
      console.log("----------------------------------------");
      console.log("[MOCK EMAIL NOTIFICATION]");
      console.log(`To: ${args.to}`);
      console.log(`Subject: ${args.subject}`);
      console.log("Body:");
      console.log(args.body);
      console.log("----------------------------------------");
      return;
    }

    try {
      const resend = new Resend(apiKey);
      await resend.emails.send({
        from: "CampusCarry <notify@campuscarry.in>",
        to: args.to,
        subject: args.subject,
        html: args.body,
      });
      console.log(`Email successfully sent to ${args.to}`);
    } catch (err) {
      console.error("Failed to send email via Resend:", err);
    }
  },
});
