import { test } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { createApp } from "../app.mjs";

test("local Expo web is an allowed second client without opening production CORS", async () => {
  const origin = "http://192.168.1.7:8081";
  const preview = createApp({ filename: ":memory:", mode: "development", devWebOrigins: [origin] });
  try {
    const preflight = await request(preview.app).options("/auth/register")
      .set("Origin", origin).set("Access-Control-Request-Method", "POST");
    assert.equal(preflight.status, 204);
    assert.equal(preflight.headers["access-control-allow-origin"], origin);
    assert.match(preflight.headers["access-control-allow-headers"], /Authorization/);
    const unknown = await request(preview.app).get("/health").set("Origin", "https://unexpected.example");
    assert.equal(unknown.headers["access-control-allow-origin"], undefined);
  } finally { preview.db.close(); }

  const production = createApp({ filename: ":memory:", mode: "production", devWebOrigins: [origin] });
  try {
    const response = await request(production.app).get("/health").set("Origin", origin);
    assert.equal(response.headers["access-control-allow-origin"], undefined);
  } finally { production.db.close(); }
});
