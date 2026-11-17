import { useEffect, type RefObject } from "react";

/** Fired by the Android app when the user leaves it (home, recents, back). Not fired when the screen is locked. */
export const APP_EXIT_EVENT = "quran:app-exit";

/** Stops this player's recitation when the user leaves the app; keeps playing while the phone is locked. */
export function useStopOnAppExit(audioRef: RefObject<HTMLAudioElement | null>, onStopped: () => void) {
  useEffect(() => {
    const stop = () => {
      audioRef.current?.pause();
      onStopped();
    };
    window.addEventListener(APP_EXIT_EVENT, stop);
    return () => window.removeEventListener(APP_EXIT_EVENT, stop);
  });
}
