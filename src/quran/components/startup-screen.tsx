import { useEffect, useState } from "react";
import splashArt from "@/assets/splash-art.jpg";
import splashLoader from "@/assets/splash-loader.png";

/** Present in the initial HTML, including the offline SPA shell. */
export function StartupScreen() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    const images = Array.from(document.images);
    const imageReady = (image: HTMLImageElement) => {
      if (image.complete) return Promise.resolve();
      return new Promise<void>((resolve) => {
        image.addEventListener("load", () => resolve(), { once: true });
        image.addEventListener("error", () => resolve(), { once: true });
      });
    };
    Promise.all([document.fonts.ready, ...images.map(imageReady)]).then(() => {
      requestAnimationFrame(() => {
        if (!active) return;
        document.documentElement.dataset["appReady"] = "true";
        setReady(true);
      });
    });
    return () => { active = false; };
  }, []);

  if (ready) return null;
  return (
    <div className="startup-screen" role="status" aria-label="جارٍ فتح التطبيق">
      <div className="startup-backdrop" style={{ backgroundImage: `url(${splashArt})` }} aria-hidden="true" />
      <div className="startup-art">
        <img src={splashArt} alt="محمد صديق المنشاوي — تطبيق تقوى القلوب" fetchPriority="high" />
        <img className="startup-loader" src={splashLoader} alt="" aria-hidden="true" />
      </div>
    </div>
  );
}