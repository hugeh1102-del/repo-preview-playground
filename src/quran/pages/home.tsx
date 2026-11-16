import { Link } from "@/quran/wouter-shim";
import { ChevronLeft } from "lucide-react";
import minshawiHeaderAsset from "@/assets/minshawi-header-cream.jpg";

const homeBackground = `${import.meta.env.BASE_URL}quran-home-4k.jpg`;
const iconAsset = (name: string) => `${import.meta.env.BASE_URL}home-icons/${name}.png`;

/** Every home button shares one card design; only the icon and text change. */
const homeButtons = [
  { href: "/illuminated-book", icon: "illuminated", title: "الكتاب المضيئ", subtitle: "اسأل واعرف وتعلم", testid: "link-illuminated-book" },
  { href: "/quran-audio", icon: "offline", title: "القرآن الكريم مرتل بدون نت", subtitle: "تلاوة مرتلة وبدون حاجة للإنترنت", testid: "link-quran-audio" },
  { href: "/quran-tajweed", icon: "tajweed", title: "القرآن الكريم مجود", subtitle: "تلاوة بالتجويد والأحكام", testid: "link-quran-tajweed" },
  { href: "/asma-husna", icon: "asma", title: "أسماء الله الحسنى", subtitle: "شرح ومعاني أسماء الله", testid: "link-asma-husna" },
  { href: "/hadith", icon: "hadith", title: "الأحاديث النبوية الشريفة", subtitle: "أحاديث صحيحة من السيرة النبوية", testid: "link-hadith" },
  { href: "/quran-written", icon: "written", title: "القرآن الكريم مكتوب", subtitle: "النص الكامل للمصحف الشريف", testid: "link-quran-written" },
  { href: "/prayer-times", icon: "prayer", title: "مواقيت الصلاة", subtitle: "الأوقات الدقيقة بناءً على موقعك", testid: "link-prayer-times" },
  { href: "/qibla", icon: "qibla", title: "تحديد اتجاه القبلة", subtitle: "تحديد القبلة بدقة سهلة", testid: "link-qibla" },
  { href: "/duas", icon: "duas", title: "الدعاء", subtitle: "أدعية مستجابة للمناسبات", testid: "link-duas" },
  { href: "/adhkar", icon: "adhkar", title: "الأذكار", subtitle: "أذكار الصباح والمساء واليومية", testid: "link-adhkar" },
  { href: "/tasbeeh", icon: "tasbeeh", title: "التسابيح", subtitle: "سبحان الله والحمد لله", testid: "link-tasbeeh" },
] as const;

export default function Home() {
  return (
    <main
      className="quran-home-screen"
      dir="rtl"
      aria-label="الصفحة الرئيسية"
    >
      <div className="quran-home-art">
        <img
          className="quran-home-header"
          src={minshawiHeaderAsset}
          alt="فضيلة الشيخ محمد صديق المنشاوي"
          draggable={false}
        />
        <div
          className="quran-home-bottom-background"
          style={{ backgroundImage: `url(${homeBackground})` }}
          aria-hidden="true"
        />
        <nav className="home-button-stack" aria-label="أقسام التطبيق">
          {homeButtons.map((button) => (
            <Link
              key={button.href}
              href={button.href}
              className="home-card"
              data-testid={button.testid}
              aria-label={button.title}
            >
              <img className="home-card-icon" src={iconAsset(button.icon)} alt="" aria-hidden="true" draggable={false} />
              <span className="home-card-text">
                <span className="home-card-title">{button.title}</span>
                <span className="home-card-subtitle">{button.subtitle}</span>
              </span>
              <span className="home-card-chevron" aria-hidden="true">
                <ChevronLeft />
              </span>
            </Link>
          ))}
          <Link href="/privacy" className="block py-2 text-center text-sm text-muted-foreground underline" data-testid="link-privacy">
            سياسة الخصوصية
          </Link>
        </nav>
      </div>
    </main>
  );
}