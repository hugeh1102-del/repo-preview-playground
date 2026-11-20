import type { CapacitorConfig } from "@capacitor/cli";
const config: CapacitorConfig = {
  appId: "app.lovable.quranreader",
  appName: "تقوى القلوب",
  webDir: "dist/client",
  // Offline APK: loads the bundled static build from webDir (no external URL).
  android: {
    allowMixedContent: false,
  },
  plugins: {
    LocalNotifications: {
      // White logo silhouette for the status bar (res/drawable-*/ic_stat_notify.png).
      smallIcon: "ic_stat_notify",
      iconColor: "#1F5A3D",
    },
    Admob: {
      // Publisher app ID provided by the user (2026-10-25).
      appID: "ca-app-pub-4072506919111365~3383451970",
      // Ad unit IDs in src/quran/lib/ads.ts are the user's real ids (2026-10-25);
      // live ads, so initializeForTesting is false.
      initializeForTesting: false,
    },
  },
};

export default config;
