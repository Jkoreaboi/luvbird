import type { City } from "./config";
export function project(lon: number, lat: number): [number, number] {
  return [((((lon % 360) + 360) % 360) / 360) * 960, ((90 - lat) / 180) * 480];
}
export function position(a: City, b: City, t: number): [number, number] {
  const rad = Math.PI / 180,
    v = (c: City) => [
      Math.cos(c.lat * rad) * Math.cos(c.lon * rad),
      Math.cos(c.lat * rad) * Math.sin(c.lon * rad),
      Math.sin(c.lat * rad),
    ];
  const av = v(a),
    bv = v(b),
    omega = Math.acos(
      Math.max(
        -1,
        Math.min(
          1,
          av.reduce((s, x, i) => s + x * bv[i], 0),
        ),
      ),
    );
  if (omega < 1e-6) return project(a.lon, a.lat);
  const s = Math.sin(omega),
    aa = Math.sin((1 - t) * omega) / s,
    bb = Math.sin(t * omega) / s;
  const v3 = av.map((x, i) => aa * x + bb * bv[i]);
  return project(
    Math.atan2(v3[1], v3[0]) / rad,
    Math.atan2(v3[2], Math.hypot(v3[0], v3[1])) / rad,
  );
}
export function routePath(a: City, b: City, fraction = 1) {
  let d = "",
    prev: [number, number] | undefined;
  for (let i = 0; i <= 100; i++) {
    const p = position(a, b, (i / 100) * fraction);
    d += `${!prev || Math.abs(p[0] - prev[0]) > 480 ? "M" : "L"}${p[0].toFixed(2)},${p[1].toFixed(2)} `;
    prev = p;
  }
  return d;
}
export const progress = (sent: number, arrives: number, now: number) =>
  Math.max(0, Math.min(1, (now - sent) / (arrives - sent)));
