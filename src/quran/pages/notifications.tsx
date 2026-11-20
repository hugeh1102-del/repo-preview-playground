import { useEffect, useState } from "react";
import { Link } from "@/quran/wouter-shim";
import { ChevronRight } from "lucide-react";
import { Switch } from "@/quran/components/ui/switch";
import { Input } from "@/quran/components/ui/input";
import { Button } from "@/quran/components/ui/button";
import { DEFAULT_SETTINGS, type ReminderSettings } from "@/quran/lib/reminder-schedule";
import { applyReminders, isNativeApp, loadSettings, requestPermission, saveSettings } from "@/quran/lib/reminders";

export default function Notifications() {
  const [s, setS] = useState<ReminderSettings>(DEFAULT_SETTINGS);
  const [native, setNative] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    setS(loadSettings());
    setNative(isNativeApp());
  }, []);

  const set = <K extends keyof ReminderSettings>(k: K, v: ReminderSettings[K]) => setS((p) => ({ ...p, [k]: v }));

  async function save() {
    saveSettings(s);
    if (!native) return setMsg("تم الحفظ. الإشعارات تعمل داخل تطبيق الأندرويد فقط.");
    if (!(await requestPermission())) return setMsg("يرجى السماح للتطبيق بالإشعارات من إعدادات الهاتف.");
    try {
      await applyReminders(s, true);
      setMsg("تم حفظ الإعدادات وجدولة الإشعارات.");
    } catch {
      setMsg("تعذّرت جدولة الإشعارات. تأكد من السماح بالإشعارات للتطبيق ثم اضغط حفظ مرة أخرى.");
    }
  }

  // Plain render helper (not a nested component) so inputs keep focus while typing.
  const row = (label: string, k: keyof ReminderSettings, time?: keyof ReminderSettings) => (
    <div key={k} className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card p-4">
      <span className="font-semibold text-foreground">{label}</span>
      <div className="flex items-center gap-3">
        {time && <Input type="time" className="w-28" value={s[time] as string} onChange={(e) => set(time, e.target.value as never)} />}
        <Switch checked={s[k] as boolean} onCheckedChange={(v) => set(k, v as never)} />
      </div>
    </div>
  );

  return (
    <div className="mx-auto max-w-xl space-y-4 py-4" dir="rtl">
      <div className="flex items-center gap-2">
        <Link href="/" className="p-2 text-foreground" aria-label="العودة"><ChevronRight /></Link>
        <h1 className="text-2xl font-bold text-foreground">الإشعارات والتذكير</h1>
      </div>
      {row("أذكار الصباح", "morningEnabled", "morningTime")}
      {row("أذكار المساء", "eveningEnabled", "eveningTime")}
      {row("تسبيحة أو دعاء كل نصف ساعة", "halfHourlyEnabled")}
      <div className="space-y-3 rounded-xl border border-border bg-card p-4">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-foreground">إيقاف تذكير نصف الساعة ليلاً</span>
          <Switch checked={s.quietEnabled} onCheckedChange={(v) => set("quietEnabled", v)} />
        </div>
        {s.quietEnabled && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            من <Input type="time" className="w-28" value={s.quietStart} onChange={(e) => set("quietStart", e.target.value)} />
            إلى <Input type="time" className="w-28" value={s.quietEnd} onChange={(e) => set("quietEnd", e.target.value)} />
          </div>
        )}
      </div>
      <Button className="w-full" onClick={save}>حفظ</Button>
      {msg && <p className="text-center text-sm text-muted-foreground">{msg}</p>}
    </div>
  );
}
