export type AskResult =
  | { ok: true; answer: string; references: { id: string; label: string; text: string }[] }
  | { ok: false; error: string };

export async function askQuestion(question: string): Promise<AskResult> {
  const key = process.env["GEMINI_API_KEY"] || process.env["LOVABLE_API_KEY"];
  if (!key) return { ok: false, error: "خدمة الإجابات غير مهيأة حاليًا." };
  try {
    const { answerReligiousQuestion } = await import("./answer.server");
    return { ok: true, ...(await answerReligiousQuestion(question, key)) };
  } catch (error) {
    const detail = error as { responseBody?: string; message?: string };
    let message = detail.message || "تعذر الاتصال بخدمة الإجابات. لم يُعد إرسال السؤال تلقائيًا.";
    if (detail.responseBody) {
      try {
        const body = JSON.parse(detail.responseBody);
        message = body.message || body.error?.message || message;
      } catch { /* Keep the original safe service message. */ }
    }
    return { ok: false, error: message };
  }
}
