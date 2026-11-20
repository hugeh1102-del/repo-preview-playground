import { Capacitor } from "@capacitor/core";
import { LocalNotifications } from "@capacitor/local-notifications";
import { DEFAULT_SETTINGS, REMINDER_TEXTS, halfHourSlots, type ReminderSettings } from "./reminder-schedule";

const KEY = "reminder-settings";

export function loadSettings(): ReminderSettings {
  try {
    return { ...DEFAULT_SETTINGS, ...JSON.parse(localStorage.getItem(KEY) || "{}") };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(s: ReminderSettings) {
  localStorage.setItem(KEY, JSON.stringify(s));
}

export const isNativeApp = () => Capacitor.isNativePlatform();

const SMALL_ICON = "ic_stat_notify";
const ICON_COLOR = "#1F5A3D";

/** Whether to ask Android for on-time (exact) alarms in this scheduling pass. */
export function wantsExactAlarms(exactGranted: boolean, fromUser: boolean) {
  return exactGranted || fromUser;
}

async function exactAllowed(fromUser: boolean) {
  try {
    const { exact_alarm } = await LocalNotifications.checkExactNotificationSetting();
    return wantsExactAlarms(exact_alarm === "granted", fromUser);
  } catch {
    return fromUser;
  }
}

export async function requestPermission(): Promise<boolean> {
  if (!isNativeApp()) return false;
  const res = await LocalNotifications.requestPermissions();
  return res.display === "granted";
}

/**
 * Clears and re-creates every scheduled reminder on the phone.
 * `fromUser` is true only when the visitor pressed Save: then Android may open its
 * "Alarms & reminders" screen once to allow on-time reminders. On app start the
 * reminders are re-created silently (slightly less punctual if that is not allowed),
 * so the app never jumps to the phone settings by itself.
 */
export async function applyReminders(s: ReminderSettings, fromUser = false) {
  if (!isNativeApp()) return;
  const perm = await LocalNotifications.checkPermissions();
  if (perm.display !== "granted") return;
  const exact = await exactAllowed(fromUser);
  const pending = await LocalNotifications.getPending();
  if (pending.notifications.length) {
    await LocalNotifications.cancel({ notifications: pending.notifications.map((n) => ({ id: n.id })) });
  }
  const list: Parameters<typeof LocalNotifications.schedule>[0]["notifications"] = [];
  const daily = (id: number, time: string, title: string, body: string) => {
    const [hour, minute] = time.split(":").map(Number);
    list.push({ id, title, body, schedule: { on: { hour, minute }, repeats: true, allowWhileIdle: true }, isExactNotification: exact, smallIcon: SMALL_ICON, iconColor: ICON_COLOR });
  };
  if (s.morningEnabled) daily(1, s.morningTime, "أذكار الصباح", "حان وقت أذكار الصباح، افتح التطبيق لقراءتها");
  if (s.eveningEnabled) daily(2, s.eveningTime, "أذكار المساء", "حان وقت أذكار المساء، افتح التطبيق لقراءتها");
  halfHourSlots(new Date(), s).forEach((at, i) => {
    list.push({ id: 100 + i, title: "تقوى القلوب", body: REMINDER_TEXTS[(at.getHours() * 2 + (at.getMinutes() >= 30 ? 1 : 0)) % REMINDER_TEXTS.length], schedule: { at, allowWhileIdle: true }, isExactNotification: exact, smallIcon: SMALL_ICON, iconColor: ICON_COLOR });
  });
  if (list.length) await LocalNotifications.schedule({ notifications: list });
}

/** Called on every app start to keep the next 48 hours of reminders topped up. */
export async function refreshRemindersOnStart() {
  try {
    await applyReminders(loadSettings());
  } catch (e) {
    console.error("reminders", e);
  }
}
