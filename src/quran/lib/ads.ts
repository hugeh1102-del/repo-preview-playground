import { Capacitor } from "@capacitor/core";
import { canShowInterstitial, isPlayerPage } from "./credits";

// Real AdMob unit ids supplied by the user (2026-10-25). Live ads, not test ads.
export const AD_IDS = {
  banner: "ca-app-pub-4072506919111365/9417628859",
  interstitial: "ca-app-pub-4072506919111365/6316822793",
  rewarded: "ca-app-pub-4072506919111365/4165302170",
};
const TESTING = false;

export const adsAvailable = () => Capacitor.isNativePlatform();
const lib = () => import("@capacitor-community/admob");

let ready: Promise<void> | null = null;
function init() {
  if (!ready) {
    ready = lib()
      .then(({ AdMob }) => AdMob.initialize({ initializeForTesting: TESTING }))
      .then(() => listenToBanner())
      .catch((error) => { ready = null; throw error; });
  }
  return ready;
}

/* ── Bottom banner (every page except home) ─────────────────────────── */
let bannerWanted = false;
let bannerShown = false;
let bannerWork: Promise<void> | null = null;
let bannerRetry: ReturnType<typeof setTimeout> | null = null;

/** Reserves room at the bottom of the page for the banner so it never covers content. */
function setBannerSpace(px: number) {
  document.documentElement.style.setProperty("--ad-banner-height", `${Math.max(0, Math.round(px))}px`);
}

async function listenToBanner() {
  const { AdMob, BannerAdPluginEvents } = await lib();
  await AdMob.addListener(BannerAdPluginEvents.SizeChanged, (size) => {
    setBannerSpace(bannerWanted ? size.height : 0);
  });
  await AdMob.addListener(BannerAdPluginEvents.FailedToLoad, () => {
    // No ad right now: free the space and try again in a minute while still on an ad page.
    setBannerSpace(0);
    bannerShown = false;
    if (bannerRetry) clearTimeout(bannerRetry);
    bannerRetry = setTimeout(() => { bannerRetry = null; void syncBanner(); }, 60_000);
  });
}

async function syncBanner(): Promise<void> {
  if (bannerWork) return bannerWork;
  bannerWork = (async () => {
    while (bannerWanted !== bannerShown) {
      const target = bannerWanted;
      try {
        await init();
        const { AdMob, BannerAdPosition, BannerAdSize } = await lib();
        if (target) {
          await AdMob.showBanner({
            adId: AD_IDS.banner,
            adSize: BannerAdSize.ADAPTIVE_BANNER,
            position: BannerAdPosition.BOTTOM_CENTER,
            margin: 0,
            isTesting: TESTING,
          });
        } else {
          await AdMob.hideBanner();
          setBannerSpace(0);
        }
        bannerShown = target;
      } catch {
        break; // ad service unavailable; the app keeps working without it
      }
    }
  })().finally(() => { bannerWork = null; });
  return bannerWork;
}

export function setBanner(visible: boolean) {
  if (!adsAvailable()) return Promise.resolve();
  bannerWanted = visible;
  if (!visible) setBannerSpace(0);
  return syncBanner();
}

/* ── Full-screen image ad on navigation ─────────────────────────────── */
let lastInterstitial = 0;
let interstitialBusy = false;
export async function onPageChange(path: string) {
  if (!adsAvailable() || interstitialBusy) return;
  // Never on the recitation player pages, so listening is not interrupted.
  if (isPlayerPage(path)) return;
  // Image interstitial: at most once every 4 minutes.
  if (!canShowInterstitial(lastInterstitial, Date.now())) return;
  interstitialBusy = true;
  try {
    await init();
    const { AdMob } = await lib();
    await AdMob.prepareInterstitial({ adId: AD_IDS.interstitial, isTesting: TESTING });
    // The visitor may have opened a player page while the ad was loading.
    if (isPlayerPage(window.location.pathname)) return;
    await AdMob.showInterstitial();
    lastInterstitial = Date.now();
  } catch { /* no interstitial available */ }
  finally { interstitialBusy = false; }
}

/* ── Rewarded video (Illuminated Book credits) ──────────────────────── */
/**
 * Plays one rewarded video and waits until it is closed.
 * Resolves true only if Google reported the reward; closing early or a load failure resolves false.
 */
async function playRewarded(adId: string): Promise<boolean> {
  const handles: Array<{ remove: () => Promise<void> }> = [];
  try {
    await init();
    const { AdMob, RewardAdPluginEvents } = await lib();
    let rewarded = false;
    let finish: () => void = () => {};
    const closed = new Promise<void>((resolve) => { finish = resolve; });
    handles.push(await AdMob.addListener(RewardAdPluginEvents.Rewarded, () => { rewarded = true; }));
    handles.push(await AdMob.addListener(RewardAdPluginEvents.Dismissed, () => finish()));
    handles.push(await AdMob.addListener(RewardAdPluginEvents.FailedToShow, () => finish()));
    await AdMob.prepareRewardVideoAd({ adId, isTesting: TESTING });
    // showRewardVideoAd only settles once the reward is earned, so wait for the ad to close instead.
    void AdMob.showRewardVideoAd().then(() => { rewarded = true; }, () => finish());
    await closed;
    return rewarded;
  } catch {
    return false;
  } finally {
    await Promise.all(handles.map((h) => h.remove().catch(() => {})));
  }
}

/** Shows one rewarded video; resolves true only if Google reports the reward. */
export async function showRewarded(): Promise<boolean> {
  return playRewarded(AD_IDS.rewarded);
}
