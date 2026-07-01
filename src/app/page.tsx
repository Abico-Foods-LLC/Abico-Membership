import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Award,
  Bell,
  QrCode,
  ShoppingBag,
  Store,
  TrendingUp,
  Users,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { MEMBERSHIP_TIERS } from "@/lib/loyalty";
import { getSession } from "@/lib/auth";

const BRAND_LOGOS = [
  { src: "/brands/Daiso.png", name: "Daiso" },
  { src: "/brands/Pigeon.png", name: "Pigeon" },
  { src: "/brands/Lion.png", name: "Lion" },
  { src: "/brands/KireiKirei.png", name: "KireiKirei" },
  { src: "/brands/Dydo.png", name: "Dydo" },
  { src: "/brands/Kagome.png", name: "Kagome" },
  { src: "/brands/Elis.png", name: "Elis" },
  { src: "/brands/Fundokin.png", name: "Fundokin" },
  { src: "/brands/Goon.png", name: "Goon" },
  { src: "/brands/Ideal.png", name: "Ideal" },
  { src: "/brands/PigeonTeens.png", name: "Pigeon Teens" },
  { src: "/brands/PokkaSapporo.png", name: "Pokka Sapporo" },
  { src: "/brands/Sanytol.webp", name: "Sanytol" },
  { src: "/brands/SB.png", name: "S&B" },
  { src: "/brands/BlackThunder.jpg", name: "Black Thunder" },
  { src: "/brands/Pip.jpg", name: "Pip" },
];

export default async function HomePage() {
  const session = await getSession();
  if (session) redirect("/dashboard");

  return (
    <div className="min-h-screen overflow-x-hidden bg-gray-50">
      <Navbar />

      <main>
        {/* ── Hero ── */}
        <section className="relative overflow-hidden">
          {/* ambient brand wash — barely-there depth, no visual noise */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 -top-40 -z-10 h-[560px]"
            style={{
              background:
                "radial-gradient(60% 60% at 50% 0%, rgba(21,114,190,0.08) 0%, rgba(21,114,190,0) 70%)",
            }}
          />
          <div className="mx-auto max-w-7xl px-6 py-14 md:py-24">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              {/* Left: Text */}
              <div className="min-w-0">
                <p className="animate-fade-up text-sm font-semibold uppercase tracking-[0.2em] text-abico-blue">
                  ABICO.MN
                </p>
                <h1 className="mt-4 animate-fade-up text-4xl font-extrabold leading-[1.08] tracking-tight text-gray-900 [animation-delay:80ms] md:text-5xl xl:text-6xl">
                  Гишүүнчлэлийн
                  <span className="bg-gradient-to-r from-abico-blue to-abico-sky bg-clip-text text-transparent"> Бонус Систем</span>
                </h1>
                <p className="mt-5 max-w-lg animate-fade-up text-lg text-gray-600 [animation-delay:140ms]">
                  Олон дэлгүүрт нэг картаар — оноо цуглуулж, бонус авна. QR
                  кодоор хурдан бүртгэл, ажилтан оноо нэмэх, гишүүний шатлал.
                </p>
                <div className="mt-7 flex animate-fade-up flex-wrap gap-3 [animation-delay:200ms]">
                  <Link href="/register" className="btn-primary px-6 py-3 text-base">
                    Одоо бүртгүүлэх
                  </Link>
                  <Link
                    href="/login"
                    className="rounded-xl border border-gray-300 bg-white px-6 py-3 text-base font-semibold text-gray-700 transition-all duration-300 ease-premium hover:-translate-y-0.5 hover:border-gray-400 hover:shadow-soft"
                  >
                    Нэвтрэх
                  </Link>
                </div>

              {/* Brand logos strip — sideways-scrolling badge marquee */}
              <div className="mt-10 -mx-6 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_5%,black_95%,transparent)] px-6 md:-mx-0 md:px-0">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Партнер брэндүүд
                </p>
                <div className="flex w-max animate-marquee gap-3 hover:[animation-play-state:paused]">
                  {[...BRAND_LOGOS, ...BRAND_LOGOS].map((b, i) => (
                    <div
                      key={`${b.name}-${i}`}
                      className="flex h-10 w-20 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white px-2 shadow-sm"
                    >
                      <Image
                        src={b.src}
                        alt={b.name}
                        width={64}
                        height={32}
                        className="max-h-8 w-auto object-contain"
                        unoptimized
                        loading="eager"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Visual card mockup — stays dark for contrast */}
            <div className="hidden animate-fade-up [animation-delay:260ms] lg:block">
              <div
                className="relative overflow-hidden rounded-3xl p-8 shadow-elevated ring-1 ring-white/10"
                style={{
                  background:
                    "linear-gradient(135deg, #001C3B 0%, #023876 60%, #001C3B 100%)",
                }}
              >
                <div
                  className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full"
                  style={{
                    background:
                      "radial-gradient(circle, rgba(21,114,190,0.3) 0%, transparent 70%)",
                  }}
                />

                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-abico-blue text-xs font-bold text-white">
                      A
                    </span>
                    <div>
                      <p className="text-[10px] font-bold tracking-widest text-abico-light">
                        ABICO
                      </p>
                      <p className="text-[10px] text-blue-100/50">
                        LOYALTY CARD
                      </p>
                    </div>
                  </div>
                  <span
                    className="rounded-full border px-3 py-1 text-xs font-bold tracking-wide"
                    style={{ borderColor: "#f59e0b", color: "#f59e0b", backgroundColor: "#f59e0b22" }}
                  >
                    ★ АЛТ
                  </span>
                </div>

                <div className="relative mt-6">
                  <p className="text-sm text-blue-100/60">Нийт оноо</p>
                  <p className="text-5xl font-extrabold" style={{ color: "#f59e0b" }}>
                    2,450
                  </p>
                  <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                    <div className="h-full rounded-full" style={{ width: "49%", background: "linear-gradient(90deg, #f59e0b, #1572BE)" }} />
                  </div>
                  <p className="mt-1.5 text-xs text-blue-100/50">
                    2,550 оноо → ПЛАТИНУМ болно
                  </p>
                </div>

                <div className="relative mt-6 grid grid-cols-5 gap-2">
                  {MEMBERSHIP_TIERS.map((t) => (
                    <div key={t.id} className="rounded-xl border border-white/10 p-2.5 text-center">
                      <p className="text-[9px] font-bold uppercase" style={{ color: t.color }}>{t.nameMn}</p>
                      <p className="mt-1 text-base font-extrabold text-white">{t.discountPercent}%</p>
                    </div>
                  ))}
                </div>

                <div className="relative mt-5 border-t border-white/10 pt-4 text-center">
                  <p className="text-[10px] text-blue-100/40">
                    ABICO-DEMO123 · Дэлгүүрт QR кодоо үзүүлнэ
                  </p>
                </div>
              </div>
            </div>
          </div>
          </div>
        </section>

        {/* ── Features ── */}
        <section className="mx-auto max-w-7xl px-6 py-16">
          <SectionHeading eyebrow="БОЛОМЖУУД" title="Гишүүнд юу санал болгодог вэ?" />
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            <FeatureCard icon={<QrCode className="h-6 w-6 text-abico-blue" />} title="QR код" text="Дэлгүүрт QR кодоо үзүүлж оноо цуглуулна" />
            <FeatureCard icon={<Award className="h-6 w-6 text-abico-blue" />} title="Шатлал" text="СТАНДАРТ → ХҮРЭЛ → АЛТ → ПЛАТИНУМ → VIP урамшуулал" />
            <FeatureCard icon={<Bell className="h-6 w-6 text-abico-blue" />} title="Урамшуулал" text="Урилга +50 оноо, шатлал ахиулах" />
          </div>
        </section>

        {/* ── Tiers ── */}
        <section className="border-y border-gray-200 bg-white py-16">
          <div className="mx-auto max-w-7xl px-6">
            <SectionHeading eyebrow="ШАТЛАЛ" title="Гишүүний шатлал" />
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {MEMBERSHIP_TIERS.map((tier) => (
                <div
                  key={tier.id}
                  className="card-premium-hover group relative overflow-hidden p-5"
                >
                  <div
                    className="absolute inset-x-0 top-0 h-1"
                    style={{ background: tier.color }}
                    aria-hidden
                  />
                  <p className="text-sm font-bold uppercase tracking-wide" style={{ color: tier.color }}>
                    {tier.nameMn}
                  </p>
                  <p className="mt-2 text-2xl font-extrabold tracking-tight text-gray-900">{tier.discountPercent}%</p>
                  <p className="mt-1 text-sm text-gray-600">{tier.perks}</p>
                  <p className="mt-3 text-xs text-gray-400">
                    {tier.maxPoints
                      ? `${tier.minPoints.toLocaleString()} – ${tier.maxPoints.toLocaleString()} оноо`
                      : `${tier.minPoints.toLocaleString()}+ оноо`}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── How it works ── */}
        <section className="mx-auto max-w-7xl px-6 py-16">
          <SectionHeading eyebrow="ХЭРХЭН АЖИЛЛАДАГ" title="Гурван энгийн алхам" />
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            <StepCard step={1} icon={<Users />} title="Хэрэглэгч" items={["Апп эсвэл веб дээр бүртгүүлнэ", "QR кодоор дэлгүүрт нэвтэрнэ", "Оноогоо цуглуулж, бонус авна"]} />
            <StepCard step={2} icon={<Store />} title="Дэлгүүр" items={["Партнер дэлгүүр бүртгэлтэй", "Кассчин оноо нэмэх эрхтэй", "Гишүүдийн мэдээлэл харах"]} />
            <StepCard step={3} icon={<TrendingUp />} title="ABICO платформ" items={["Нэгдсэн нэвтрэх тогтолцоо", "Онооны баталгаажуулалт", "Тайлан & шинжилгээ"]} />
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="mx-auto max-w-7xl px-6 pb-20">
          <div
            className="relative overflow-hidden rounded-3xl p-8 shadow-elevated md:p-12"
            style={{ background: "linear-gradient(135deg, #001C3B 0%, #023876 65%, #001C3B 100%)" }}
          >
            <div
              aria-hidden
              className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full"
              style={{ background: "radial-gradient(circle, rgba(21,114,190,0.35) 0%, transparent 70%)" }}
            />
            <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wider text-abico-light">₮1,000 = 1 оноо</p>
                <h3 className="mt-2 text-2xl font-bold text-white md:text-3xl">Нэг апп, олон дэлгүүр</h3>
                <p className="mt-3 max-w-xl text-blue-100/70">
                  ABICO Loyalty-г туршиж үзээрэй. MVP хувилбарт бүртгэл, QR, оноо нэмэх, удирдлагын самбар багтсан.
                </p>
              </div>
              <Link
                href="/register"
                className="inline-flex shrink-0 items-center justify-center rounded-xl bg-white px-8 py-3 text-base font-semibold text-abico-navy shadow-lg transition-all duration-300 ease-premium hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0"
              >
                <ShoppingBag className="mr-2 inline h-4 w-4" />
                Эхлэх
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function SectionHeading({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-abico-blue">{eyebrow}</p>
      <h2 className="mt-2 text-2xl font-bold tracking-tight text-gray-900 md:text-3xl">{title}</h2>
    </div>
  );
}

function FeatureCard({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="card-premium-hover p-6">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-abico-blue/10">
        {icon}
      </div>
      <h3 className="mt-4 font-semibold text-gray-900">{title}</h3>
      <p className="mt-2 text-sm text-gray-600">{text}</p>
    </div>
  );
}

function StepCard({ step, icon, title, items }: { step: number; icon: React.ReactNode; title: string; items: string[] }) {
  return (
    <div className="card-premium-hover relative p-6">
      <span className="absolute right-6 top-6 text-4xl font-extrabold text-gray-100" aria-hidden>
        {String(step).padStart(2, "0")}
      </span>
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-abico-blue/10 text-abico-blue">
        {icon}
      </div>
      <h3 className="mt-4 text-lg font-semibold text-gray-900">{title}</h3>
      <ul className="mt-3 space-y-2 text-sm text-gray-600">
        {items.map((item) => (
          <li key={item}>• {item}</li>
        ))}
      </ul>
    </div>
  );
}
