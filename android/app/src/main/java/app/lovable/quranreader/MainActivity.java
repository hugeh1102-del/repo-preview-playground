package app.lovable.quranreader;

import com.getcapacitor.BridgeActivity;
import android.animation.ObjectAnimator;
import android.animation.ValueAnimator;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.view.Gravity;
import android.view.ViewGroup;
import android.view.animation.LinearInterpolator;
import android.widget.FrameLayout;
import android.widget.ImageView;

/**
 * Shows the same startup artwork as the web app (portrait art with its own dot ring spinning)
 * until the web page reports it is ready, so there is no blank screen or second loader.
 */
public class MainActivity extends BridgeActivity {
    // Artwork size and dot-ring position, identical to .startup-art in src/styles.css.
    private static final float ART_W = 1482f, ART_H = 3200f;
    private static final float RING_LEFT = .407557f, RING_TOP = .842188f, RING_SIZE = .183536f;
    private static final long MAX_WAIT_MS = 10000;

    private final Handler startupHandler = new Handler(Looper.getMainLooper());
    private FrameLayout startupOverlay;
    private ObjectAnimator ringSpin;
    private long startedAt;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        startedAt = System.currentTimeMillis();

        startupOverlay = new FrameLayout(this);
        startupOverlay.setBackgroundColor(getColor(R.color.splash_background));
        startupOverlay.setClickable(true);

        ImageView backdrop = new ImageView(this);
        backdrop.setImageResource(R.drawable.splash_backdrop);
        backdrop.setScaleType(ImageView.ScaleType.CENTER_CROP);
        startupOverlay.addView(backdrop, new FrameLayout.LayoutParams(-1, -1));

        ImageView artwork = new ImageView(this);
        artwork.setImageResource(R.drawable.splash);
        artwork.setScaleType(ImageView.ScaleType.FIT_XY);
        FrameLayout.LayoutParams artPos = new FrameLayout.LayoutParams(0, 0, Gravity.TOP | Gravity.START);
        startupOverlay.addView(artwork, artPos);

        ImageView ring = new ImageView(this);
        ring.setImageResource(R.drawable.splash_loader);
        ring.setScaleType(ImageView.ScaleType.FIT_XY);
        FrameLayout.LayoutParams ringPos = new FrameLayout.LayoutParams(0, 0, Gravity.TOP | Gravity.START);
        startupOverlay.addView(ring, ringPos);

        startupOverlay.addOnLayoutChangeListener((v, l, t, r, b, ol, ot, or, ob) -> {
            int w = v.getWidth(), h = v.getHeight();
            if (w == 0 || h == 0) return;
            float artH = Math.min(h, w * ART_H / ART_W);
            float artW = artH * ART_W / ART_H;
            int left = Math.round((w - artW) / 2f), top = Math.round((h - artH) / 2f);
            int ringSize = Math.round(artW * RING_SIZE);
            int ringLeft = left + Math.round(artW * RING_LEFT), ringTop = top + Math.round(artH * RING_TOP);
            if (artPos.width == Math.round(artW) && artPos.height == Math.round(artH)
                    && ringPos.leftMargin == ringLeft && ringPos.topMargin == ringTop) return;
            artPos.width = Math.round(artW); artPos.height = Math.round(artH);
            artPos.leftMargin = left; artPos.topMargin = top;
            ringPos.width = ringSize; ringPos.height = ringSize;
            ringPos.leftMargin = ringLeft; ringPos.topMargin = ringTop;
            v.post(() -> { artwork.setLayoutParams(artPos); ring.setLayoutParams(ringPos); });
        });

        ringSpin = ObjectAnimator.ofFloat(ring, "rotation", 0f, 360f);
        ringSpin.setDuration(1100);
        ringSpin.setInterpolator(new LinearInterpolator());
        ringSpin.setRepeatCount(ValueAnimator.INFINITE);
        ringSpin.start();

        addContentView(startupOverlay, new ViewGroup.LayoutParams(-1, -1));
        startupHandler.post(checkStartupReady);
    }

    private void hideStartup() {
        if (startupOverlay == null) return;
        if (ringSpin != null) ringSpin.cancel();
        ViewGroup parent = (ViewGroup) startupOverlay.getParent();
        if (parent != null) parent.removeView(startupOverlay);
        startupOverlay = null;
    }

    private final Runnable checkStartupReady = new Runnable() {
        @Override public void run() {
            if (isFinishing() || isDestroyed() || startupOverlay == null) return;
            // Never keep the user stuck on the startup screen.
            if (System.currentTimeMillis() - startedAt > MAX_WAIT_MS) { hideStartup(); return; }
            if (getBridge() == null || getBridge().getWebView() == null) { startupHandler.postDelayed(this, 100); return; }
            getBridge().getWebView().evaluateJavascript(
                "document.documentElement.dataset.appReady === 'true'",
                result -> {
                    if ("true".equals(result)) hideStartup();
                    else startupHandler.postDelayed(this, 100);
                });
        }
    };

    @Override public void onDestroy() {
        startupHandler.removeCallbacksAndMessages(null);
        if (ringSpin != null) ringSpin.cancel();
        super.onDestroy();
    }
}
