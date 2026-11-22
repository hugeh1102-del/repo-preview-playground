import { useEffect, useRef, useState } from "react";
import { AD_PACKAGES, QUESTION_COST, START_CREDITS, afterQuestion, canAsk, loadCredits, rewardFor, saveCredits } from "@/quran/lib/credits";
import { adsAvailable, showRewarded } from "@/quran/lib/ads";
import { Link } from "@tanstack/react-router";
import { ArrowRight, BookOpen, Send, LoaderCircle, RotateCcw, ShieldCheck, SkipForward } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Button } from "@/quran/components/ui/button";
import { Textarea } from "@/quran/components/ui/textarea";
import { askIlluminated } from "@/quran/lib/ask-illuminated";
import videoAsset from "@/assets/video/illuminated-book-v2.mp4.asset.json";

type Answer = { answer: string; references: { id: string; label: string; text: string }[] };

export default function IlluminatedBook() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [question, setQuestion] = useState("");
  const [submitted, setSubmitted] = useState("");
  const [busy, setBusy] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [videoDone, setVideoDone] = useState(false);
  const [answer, setAnswer] = useState<Answer | null>(null);
  const [error, setError] = useState("");
  const [credits, setCredits] = useState<number>(() => loadCredits());
  const [adBusy, setAdBusy] = useState(false);
  const [adMsg, setAdMsg] = useState("");

  useEffect(() => {
    if (credits < START_CREDITS && loadCredits() === credits) {
      saveCredits(credits);
    }
  }, [credits]);

  function resetVideo() {
    setPlaying(false);
    setVideoDone(false);
    const v = videoRef.current;
    if (v) {
      v.pause();
      v.currentTime = 0;
    }
  }

  function skip() {
    setVideoDone(true);
    const v = videoRef.current;
    if (v) v.pause();
  }

  async function watchAds(count: number) {
    if (!adsAvailable()) {
      setAdMsg("الإعلانات تعمل داخل تطبيق الأندرويد فقط.");
      return;
    }
    setAdBusy(true);
    setAdMsg("");
    for (let i = 1; i <= count; i++) {
      if (i > 1) setAdMsg(`شاهدت ${i - 1} من ${count}… جارٍ تحميل الإعلان التالي`);
      if (!(await showRewarded())) {
        setAdBusy(false);
        setAdMsg("لم يكتمل الإعلان أو لا يتوفر إعلان الآن، فلم يُضف رصيد. تأكد من الاتصال بالإنترنت وحاول مرة أخرى.");
        return;
      }
      if (i < count) setAdMsg(`شاهدت ${i} من ${count}…`);
    }
    setCredits((c) => {
      const n = c + rewardFor(count);
      saveCredits(n);
      return n;
    });
    setAdBusy(false);
    setAdMsg(`أُضيف ${rewardFor(count)} كريدت إلى رصيدك.`);
    setError("");
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const q = question.trim();
    if (q.length < 3 || busy) return;

    if (!canAsk(credits)) {
      setError(`رصيدك الحالي لا يكفي لطرح سؤال (المطلوب ${QUESTION_COST} كريدت). شاهد إعلانًا للحصول على رصيد.`);
      return;
    }

    setBusy(true);
    setSubmitted(q);
    setAnswer(null);
    setError("");
    setPlaying(true);
    setVideoDone(false);

    const v = videoRef.current;
    if (v) {
      v.currentTime = 0;
      v.play().catch(() => setVideoDone(true));
    } else {
      setVideoDone(true);
    }

    try {
      const result = await askIlluminated(q);
      if (result.ok) {
        setAnswer(result);
        setCredits((c) => {
          const n = afterQuestion(c);
          saveCredits(n);
          return n;
        });
      } else {
        setError(result.error);
        resetVideo();
      }
    } catch {
      setError("تعذر الاتصال بخدمة الإجابات. حاول لاحقًا.");
      resetVideo();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground" dir="rtl">
      <header className="flex items-center justify-between border-b px-4 py-3">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium hover:underline">
          <ArrowRight className="size-4" />
          <span>العودة</span>
        </Link>
        <div className="flex items-center gap-2 text-sm font-semibold">
          <BookOpen className="size-4 text-primary" />
          <span>الكتاب المضيء</span>
        </div>
        <div className="rounded-md border px-2.5 py-1 text-xs font-semibold">
          الرصيد: {credits}
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-between px-4">
        <div className="flex flex-1 flex-col items-center justify-start gap-5 py-7 sm:py-10">
          <div className="relative w-full max-w-xl">
            <video
              ref={videoRef}
              src={videoAsset.url}
              poster="/assets/video/illuminated-book-poster.jpg"
              playsInline
              preload="auto"
              disablePictureInPicture
              controlsList="nodownload noplaybackrate"
              onEnded={() => setVideoDone(true)}
              onError={() => setVideoDone(true)}
              onContextMenu={(e) => e.preventDefault()}
              className="pointer-events-none aspect-video w-full rounded-lg bg-muted"
              aria-label="فيديو الكتاب المضيئ"
            />
            {playing && !videoDone && (
              <Button type="button" size="sm" variant="secondary" className="absolute bottom-3 left-3" onClick={skip}>
                <SkipForward className="ml-1 size-4" />
                تخطي
              </Button>
            )}
          </div>

          {question.trim().length > 0 && question.trim().length < 3 && !busy && (
            <p className="text-sm text-muted-foreground">اكتب سؤالًا من ثلاثة أحرف على الأقل.</p>
          )}

          {error && (
            <div className="w-full max-w-xl rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
              {error}
            </div>
          )}

          {!canAsk(credits) && (
            <div className="w-full max-w-xl rounded-lg border bg-card p-4 text-sm">
              <div className="mb-3 flex items-center gap-2 font-semibold">
                <ShieldCheck className="size-4 text-primary" />
                <span>احصل على رصيد إضافي عبر مشاهدة الإعلانات</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {AD_PACKAGES.map((pkg) => (
                  <Button
                    key={pkg}
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={adBusy || busy}
                    onClick={() => watchAds(pkg)}
                  >
                    مشاهدة {pkg} إعلان (+{rewardFor(pkg)} كريدت)
                  </Button>
                ))}
              </div>
              {adMsg && <p className="mt-2 text-xs text-muted-foreground">{adMsg}</p>}
            </div>
          )}

          {submitted && (
            <div className="w-full max-w-xl rounded-lg border bg-muted/40 p-3 text-sm">
              <span className="font-semibold">السؤال: </span>
              <span>{submitted}</span>
            </div>
          )}

          {answer && videoDone && (
            <article className="w-full max-w-xl space-y-4 rounded-lg border bg-card p-5 text-sm leading-relaxed">
              <ReactMarkdown>{answer.answer}</ReactMarkdown>
              {answer.references?.length > 0 && (
                <div className="space-y-2 border-t pt-3">
                  <div className="text-xs font-semibold text-muted-foreground">المراجع:</div>
                  {answer.references.map((ref) => (
                    <div key={ref.id} className="rounded bg-muted/50 p-2.5 text-xs">
                      <div className="font-semibold">{ref.label}</div>
                      <p className="mt-1 text-muted-foreground">{ref.text}</p>
                    </div>
                  ))}
                </div>
              )}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setAnswer(null);
                  setQuestion("");
                  resetVideo();
                }}
              >
                <RotateCcw className="ml-1 size-3.5" />
                سؤال جديد
              </Button>
            </article>
          )}

          {false && (
            <p role="status" className="flex items-center gap-2 text-base font-semibold text-primary">
              <LoaderCircle className="size-4 animate-spin motion-reduce:animate-none" />
              جاري إعداد الإجابة…
            </p>
          )}
        </div>

        <form onSubmit={submit} className="sticky bottom-[var(--ad-banner-height,0px)] border-t bg-background pb-4 pt-5">
          <label htmlFor="religious-question" className="mb-3 block text-sm font-semibold">
            ما سؤالك؟
          </label>
          <div className="rounded-lg border border-input bg-card p-3 focus-within:ring-1 focus-within:ring-ring">
            <Textarea
              id="religious-question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="اكتب سؤالك عن القرآن أو التفسير أو الشريعة أو التاريخ الإسلامي…"
              maxLength={2000}
              disabled={busy}
              className="min-h-24 resize-none border-0 bg-transparent p-1 shadow-none focus-visible:ring-0"
            />
            <div className="mt-2 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{question.trim().length} / 2000</span>
              <Button type="submit" size="sm" disabled={busy || question.trim().length < 3}>
                {busy ? <LoaderCircle className="ml-1 size-4 animate-spin" /> : <Send className="ml-1 size-4" />}
                إرسال
              </Button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
