import { Capacitor } from "@capacitor/core";

/** Published site that answers questions; the offline Android app has no server of its own. */
export const ANSWERS_ORIGIN = "https://project--d2bdf364-510e-4e21-9ce1-36bc4609ddff.lovable.app";

export type IlluminatedAnswer =
  | { ok: true; answer: string; references: { id: string; label: string; text: string }[] }
  | { ok: false; error: string };

export function answersEndpoint(native = Capacitor.isNativePlatform()) {
  return `${native ? ANSWERS_ORIGIN : ""}/api/public/illuminated-book`;
}

export async function askIlluminated(question: string): Promise<IlluminatedAnswer> {
  const response = await fetch(answersEndpoint(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question }),
  });
  return (await response.json()) as IlluminatedAnswer;
}
