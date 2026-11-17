// @vitest-environment node
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const APP_ID = "ca-app-pub-4072506919111365~3383451970";
const read = (p: string) => readFileSync(new URL(`../../${p}`, import.meta.url), "utf8");

describe("Android AdMob setup (app crashes on launch without it)", () => {
  it("manifest declares the AdMob application id entry", () => {
    expect(read("android/app/src/main/AndroidManifest.xml")).toContain(
      'android:name="com.google.android.gms.ads.APPLICATION_ID"\n            android:value="@string/admob_app_id"',
    );
  });
  it("the manifest id is the user's publisher app id", () => {
    expect(read("android/app/src/main/res/values/strings.xml")).toContain(`>${APP_ID}</string>`);
  });
  it("matches the id in the Capacitor config", () => {
    expect(read("capacitor.config.ts")).toContain(`appID: "${APP_ID}"`);
  });
});
