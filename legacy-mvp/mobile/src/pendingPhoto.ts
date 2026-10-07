import AsyncStorage from "@react-native-async-storage/async-storage";
export type PendingPhoto = { key: string; data: string };
const prefix = (user: string, recipient: string) =>
  `draft:${user}:${recipient}:upload`;
export async function savePending(
  user: string,
  recipient: string,
  photo: PendingPhoto,
) {
  const base = prefix(user, recipient);
  const chunks = photo.data.match(/.{1,250000}/g) || [];
  await AsyncStorage.multiSet(
    chunks.map((value, i) => [`${base}:${photo.key}:${i}`, value]),
  );
  await AsyncStorage.setItem(
    base,
    JSON.stringify({ key: photo.key, count: chunks.length }),
  );
}
export async function loadPending(
  user: string,
  recipient: string,
): Promise<PendingPhoto | null> {
  const base = prefix(user, recipient);
  const raw = await AsyncStorage.getItem(base);
  if (!raw) return null;
  const { key, count } = JSON.parse(raw);
  const chunks = await AsyncStorage.multiGet(
    Array.from({ length: count }, (_, i) => `${base}:${key}:${i}`),
  );
  if (chunks.some(([, value]) => value === null))
    throw new Error("photo_recovery_failed");
  return { key, data: chunks.map(([, value]) => value).join("") };
}
export async function clearPending(user: string, recipient: string) {
  const base = prefix(user, recipient);
  await AsyncStorage.removeItem(base);
  await AsyncStorage.multiRemove(
    (await AsyncStorage.getAllKeys()).filter((k) => k.startsWith(`${base}:`)),
  );
}
