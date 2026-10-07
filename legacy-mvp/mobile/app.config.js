const { isReleaseOrigin } = require("./release-origin.cjs");
const variant = process.env.APP_VARIANT || "development";
const production = variant === "production";
if (
  variant !== "development" &&
  !isReleaseOrigin(process.env.EXPO_PUBLIC_API_URL)
)
  throw new Error(
    "Set EXPO_PUBLIC_API_URL to the deployed HTTPS API before a test/store build.",
  );
if (variant !== "development" && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(process.env.EXPO_PROJECT_ID || ""))
  throw new Error("Set EXPO_PROJECT_ID to the actual EAS project before a device/store build.");
module.exports = {
  expo: {
    name: production ? "DearBird" : "DearBird Preview",
    slug: "luvbird-dearbird",
    ...(process.env.EXPO_OWNER ? { owner: process.env.EXPO_OWNER } : {}),
    version: "0.1.0",
    scheme: "dearbird",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#F7F5EE",
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: production
        ? (process.env.IOS_BUNDLE_IDENTIFIER || "com.luvbird.dearbird")
        : "com.luvbird.dearbird.preview",
      infoPlist: { ITSAppUsesNonExemptEncryption: false },
    },
    android: {
      allowBackup: false,
      package: production
        ? (process.env.ANDROID_PACKAGE || "com.luvbird.dearbird")
        : "com.luvbird.dearbird.preview",
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive.png",
        backgroundColor: "#F7F5EE",
      },
      blockedPermissions: ["android.permission.RECORD_AUDIO"],
    },
    web: { favicon: "./assets/favicon.png" },
    plugins: [
      "expo-router",
      "expo-secure-store",
      [
        "expo-image-picker",
        {
          photosPermission: "사진 편지와 프로필에 넣을 사진을 선택합니다.",
          cameraPermission: false,
          microphonePermission: false,
        },
      ],
      ["expo-notifications", { color: "#24464A" }],
    ],
    extra: {
      company: "Luvbird",
      variant,
      ...(process.env.EXPO_PROJECT_ID
        ? { eas: { projectId: process.env.EXPO_PROJECT_ID } }
        : {}),
    },
  },
};
