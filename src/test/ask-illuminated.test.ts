import { describe, expect, it } from "vitest";
import { answersEndpoint } from "@/quran/lib/ask-illuminated";

describe("Illuminated Book answers address", () => {
  it("the Android app asks the published site (it has no server of its own)", () =>
    expect(answersEndpoint(true)).toBe("https://project--d2bdf364-510e-4e21-9ce1-36bc4609ddff.lovable.app/api/public/illuminated-book"));
  it("the website asks its own server", () => expect(answersEndpoint(false)).toBe("/api/public/illuminated-book"));
});
