import { test } from "node:test";
import assert from "node:assert/strict";
import {
  position,
  project,
  progress,
  routePath,
} from "../../mobile/src/route.ts";
const seoul = { lat: 37.5665, lon: 126.978 },
  seattle = { lat: 47.6062, lon: -122.3321 };
test("Seoul–Seattle great circle travels through Pacific across date line", () => {
  assert.deepEqual(
    position(seoul, seattle, 0).map(Math.round),
    project(seoul.lon, seoul.lat).map(Math.round),
  );
  assert.deepEqual(
    position(seoul, seattle, 1).map(Math.round),
    project(seattle.lon, seattle.lat).map(Math.round),
  );
  assert.ok(
    position(seoul, seattle, 0.5)[0] > 400 &&
      position(seoul, seattle, 0.5)[0] < 600,
  );
  assert.ok(!routePath(seoul, seattle).includes("NaN"));
});
test("map progress clamps and identical cities produce a finite route", () => {
  assert.equal(progress(100, 200, 99), 0);
  assert.equal(progress(100, 200, 150), 0.5);
  assert.equal(progress(100, 200, 300), 1);
  assert.ok(!routePath(seoul, seoul).includes("NaN"));
});
test("map splits Greenwich seam instead of drawing across entire world", () => {
  const path = routePath({ lat: 51, lon: -5 }, { lat: 51, lon: 5 });
  assert.equal((path.match(/M/g) || []).length, 2);
});
