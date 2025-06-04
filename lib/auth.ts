import { sendEmail } from "@/app/actions/send-email";
import { betterAuth } from "better-auth";
import { Pool } from "pg";

export const auth = betterAuth({
  trustedOrigins: ["*.shrivatsav.dev"],
  database: new Pool({
    connectionString: process.env.DATABASE_URL,
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
  emailVerification: {
    sendOnSignUp: true,
    expiresIn: 60 * 60,
    autoSignInAfterVerification: true,

    sendVerificationEmail: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: "Verify your email address",
        meta: {
          link: url,
        },
      });
    },
  },
});
