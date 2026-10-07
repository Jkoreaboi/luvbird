export const brand = {
  company: "luvbird",
  app: "DearBird",
  tagline: "A little closer, one letter at a time.",
};
export const API = (
  process.env.EXPO_PUBLIC_API_URL || "http://localhost:4000"
).replace(/\/$/, "");
export type Profile = {
  id: string;
  mbti?: string;
  purpose?: string;
  travelCity?: string;
  nickname: string;
  city: string;
  bio: string;
  lookingFor: string;
  interests: string[];
  languages: string[];
  avatar: string;
  hasPhoto?: boolean;
  avatarVersion?: string;
};
export type City = { name: string; country: string; lat: number; lon: number };
export type Letter = {
  id: string;
  sender: Profile;
  recipient: Profile;
  sent: number;
  arrives: number;
  arrived: boolean;
  origin: City;
  destination: City;
  body?: string;
  photos?: string[];
  paper?: string;
  stamp?: string;
};
export type Connection = {
  id: string;
  sender: Profile;
  recipient: Profile;
  status: string;
};
export type Draft = {
  recipient: string;
  body: string;
  photos: string[];
  paper: string;
  stamp: string;
  key: string;
  updated?: number;
};
export const cities: Record<string, City> = {
  seoul: { name: "Seoul", country: "KR", lat: 37.5665, lon: 126.978 },
  busan: { name: "Busan", country: "KR", lat: 35.1796, lon: 129.0756 },
  newyork: { name: "New York", country: "US", lat: 40.7128, lon: -74.006 },
  seattle: { name: "Seattle", country: "US", lat: 47.6062, lon: -122.3321 },
  sanfrancisco: {
    name: "San Francisco",
    country: "US",
    lat: 37.7749,
    lon: -122.4194,
  },
  losangeles: {
    name: "Los Angeles",
    country: "US",
    lat: 34.0522,
    lon: -118.2437,
  },
  london: { name: "London", country: "GB", lat: 51.5074, lon: -0.1278 },
  tokyo: { name: "Tokyo", country: "JP", lat: 35.6762, lon: 139.6503 },
};
export const avatarSymbols: Record<string, string> = {
  dove: "🕊",
  flower: "✿",
  moon: "☾",
  sea: "≈",
};
export const emptyProfile = {
  mbti: "",
  purpose: "letters",
  travelCity: "",
  nickname: "",
  city: "seoul",
  bio: "",
  lookingFor: "",
  interests: ["photography"],
  languages: ["ko", "en"],
  avatar: "dove",
};
