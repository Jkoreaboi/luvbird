// Local UI QA only. This server is never the production entrypoint.
import express from "express";
import { resolve } from "node:path";
import { createApp } from "./app.mjs";
const { app: api, tick } = createApp({
  filename: process.env.DATABASE_PATH || "data/preview.sqlite",
  mode: "staging",
  deliverySeconds: Number(process.env.DELIVERY_SECONDS || 60),
});
const app = express();
app.use(express.static(resolve("../mobile/dist")));
app.get("/app/{*path}", (_, res) =>
  res.sendFile(resolve("../mobile/dist/index.html")),
);
app.use(api);
app.listen(4000, "127.0.0.1", () =>
  console.log("Local UI QA on http://localhost:4000"),
);
setInterval(() => tick().catch(() => {}), 15000);
