<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

## What Lovable manages

Rules outside this block are the project's own. Change the pieces below in
Lovable, not by hand. With the [Lovable MCP](https://mcp.lovable.dev)
connected, `send_message` asks Lovable to do it; otherwise ask the user to
use the editor.

- **Database.** Do not add or edit `supabase/migrations/` or `drizzle/`.
  Ask Lovable to change the schema.
- **Generated files.** Do not edit a file whose header says it is automatically
  generated.
- **AI gateway.** Keep model calls on Lovable's gateway, and keep
  `LOVABLE_API_KEY` out of browser code.
- **Connectors.** Lovable provides native connectors. `list_connectors` shows
  which are enabled; `add_connector` only returns the dashboard link. When a
  connector is enabled, calls go through the connector gateway and need
  `LOVABLE_API_KEY`. When Lovable does not provide one, users can bring their
  own key and store it in Secrets.
- **Secrets.** Lovable manages them. Do not put secret values in the repo.
<!-- LOVABLE:END -->

## App structure

- Keep the imported Quran app and its feature modules under `src/quran/` and `src/routes/`, while preserving the host's `src/start.ts`, `src/router.tsx`, `src/server.ts`, and pinned TanStack versions so the existing preview runtime remains intact.
- Keep Android launcher icon and splash assets synchronized with the supplied brand artwork across all density variants, so the installed app matches the web startup experience.
- Android builds (`CAPACITOR_BUILD=1`, via `cap:sync`) switch TanStack Start to SPA mode with a prerendered `index.html`, because the APK loads files offline and has no server; web builds stay server-rendered.
- The AdMob app ID must live in `android/app/src/main/AndroidManifest.xml` (via `@string/admob_app_id`) as well as `capacitor.config.ts`, because Google Mobile Ads crashes at launch without the manifest entry.
- Illuminated Book answers go through `/api/public/illuminated-book` (CORS limited to the Capacitor local origins); the Android app calls the stable published URL because the offline APK has no server, so the site must be republished after answer-service changes.
- Bundled murattal MP3s are VBR, so each file (and each split surah, before splitting) must carry a Xing header with TOC; without it players misreport total length and elapsed time.

- Hadith books ship inside the APK, so on native they are read straight from the bundled files (no Cache API); on web, caching is best-effort and must never block reading.
- Player auto-advance tags each audio source with its surah number so a stale source from the previous surah is never loaded or played.
