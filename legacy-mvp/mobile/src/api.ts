import { API } from "./config";
let token = "";
export const setToken = (value: string) => {
  token = value;
};
export const imageSource = (path: string) => ({
  uri: API + path,
  headers: { Authorization: `Bearer ${token}` },
});
export async function api<T = any>(
  path: string,
  method = "GET",
  body?: unknown,
): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25000);
  try {
    const r = await fetch(API + path, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: controller.signal,
    });
    let data;
    try { data = await r.json(); } catch { throw new Error(r.status === 429 ? "rate_limited" : "service_unavailable"); }
    if (!r.ok) throw new Error(r.status === 401 && data.error === "unauthorized" ? "unauthorized" : data.error || "request_failed");
    return data;
  } catch (error: any) {
    if (error.name === "AbortError" || error instanceof TypeError) throw new Error("network_unavailable");
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}
