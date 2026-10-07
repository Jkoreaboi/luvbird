import { createEmailSender } from "./account.mjs";
import { createApp } from "./app.mjs";
const { app, tick, db } = createApp({
  devWebOrigins: (process.env.DEV_WEB_ORIGINS || "").split(",").filter(Boolean),
  operationsToken: process.env.OPERATIONS_TOKEN,
  trustProxyHops: Number(process.env.TRUST_PROXY_HOPS || 0),
  sendEmail: createEmailSender({ apiKey: process.env.RESEND_API_KEY, from: process.env.EMAIL_FROM }),
  requireEmailVerification: process.env.APP_ENV === "production" || process.env.REQUIRE_EMAIL_VERIFICATION === "true",
  filename: process.env.DATABASE_PATH || "data/luvbird.sqlite",
  mode: process.env.APP_ENV || "development",
  deliverySeconds: Number(process.env.DELIVERY_SECONDS || 86400),
  pushEnabled: process.env.PUSH_ENABLED === "true",
});
const port = Number(process.env.PORT || 4000);
const server = app.listen(port, "0.0.0.0", () =>
  console.log(`luvbird API listening on ${port}`),
);
let running = false;
const worker = setInterval(async () => {
  if (running) return;
  running = true;
  try {
    await tick();
  } catch {
    console.error("Delivery worker failed; inspect service health.");
  } finally {
    running = false;
  }
}, 15000);

let closing = false;
function shutdown() {
  if (closing) return;
  closing = true;
  clearInterval(worker);
  server.close(() => {
    // Close SQLite only after the in-flight mail/push worker finishes.
    const finish = () => {
      if (running) { setTimeout(finish, 100); return; }
      db.close(); process.exit(0);
    };
    finish();
  });
  setTimeout(() => process.exit(1), 30000).unref();
}
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
