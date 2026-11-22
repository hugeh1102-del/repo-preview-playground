const geminiKey = process.env["GEMINI_API_KEY"] || apiKey;
  const useGemini = Boolean(process.env["GEMINI_API_KEY"]);

  const { result } = createResponsesCall(
    new Request("https://app.internal/illuminated-book"),
    useGemini
      ? {
          apiKey: geminiKey,
          baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
          model: "gemini-2.5-flash",
        }
      : {
          apiKey,
          baseURL: "https://ai.gateway.lovable.dev/v1",
          model: "openai/gpt-6-astra",
        },
    [
      {
        role: "user",
        content: `السؤال: ${question}\n\nنصوص موثقة من التطبيق (قد تكون ذات صلة أو لا):\n${matches.length ? "" : "لا توجد"}${matches.map(r => `[${r.id}] ${r.label}\n${r.text}`).join("\n\n")}`,
      },
    ],
    instructions
  );
