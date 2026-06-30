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
  { src: "/brands/LION_logo.png", name: "Lion" },
  { src: "/brands/KireiKirei.png", name: "KireiKirei" },
  { src: "/brands/Dydo.png", name: "Dydo" },
  { src: "/brands/Kagome.png", name: "Kagome" },
];

export default async function HomePage() {
  const session = await getSession();
  if (session) redirect("/dashboard");

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main>
        {/* ── Hero ── */}
        <section className="mx-auto max-w-7xl px-6 py-14 md:py-20">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            {/* Left: Text */}
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-abico-blue">
                ABICO.MN
              </p>
              <h1 className="mt-4 text-4xl font-extrabold leading-tight text-gray-900 md:text-5xl xl:text-6xl">
                Гишүүнчлэлийн
                <span className="text-abico-blue"> Бонус Систем</span>
              </h1>
              <p className="mt-5 text-lg text-gray-600">
                Олон дэлгүүрт нэг картаар — оноо цуглуулж, бонус авна. QR
                кодоор хурдан бүртгэл, ажилтан оноо нэмэх, гишүүний шатлал.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link href="/register" className="btn-primary px-6 py-3 text-base">
                  Одоо бүртгүүлэх
                </Link>
                <Link
                  href="/login"
                  className="rounded-xl border border-gray-300 bg-white px-6 py-3 text-base font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Нэвтрэх
                </Link>
              </div>

              {/* Brand logos strip */}
              <div className="mt-10">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Партнер брэндүүд
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  {BRAND_LOGOS.map((b) => (
                    <div
                      key={b.name}
                      className="flex h-10 w-20 items-center justify-center rounded-xl border border-gray-200 bg-white px-2 shadow-sm"
                    >
                      <Image
                        src={b.src}
                        alt={b.name}
                        width={64}
                        height={32}
                        className="max-h-8 w-auto object-contain"
                        unoptimized
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Visual card mockup — stays dark for contrast */}
            <div className="hidden lg:block">
              <div
                className="relative overflow-hidden rounded-3xl p-8 shadow-2xl"
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
        </section>

        {/* ── Features ── */}
        <section className="mx-auto max-w-7xl px-6 pb-12">
          <div className="grid gap-4 md:grid-cols-3">
            <FeatureCard icon={<QrCode className="h-6 w-6 text-abico-blue" />} title="QR код" text="Дэлгүүрт QR кодоо үзүүлж оноо цуглуулна" />
            <FeatureCard icon={<Award className="h-6 w-6 text-abico-blue" />} title="Шатлал" text="СТАНДАРТ → ХҮРЭЛ → АЛТ → ПЛАТИНУМ → VIP урамшуулал" />
            <FeatureCard icon={<Bell className="h-6 w-6 text-abico-blue" />} title="Урамшуулал" text="2x–3x оноо, урилга +50 оноо" />
          </div>
        </section>

        {/* ── Tiers ── */}
        <section className="border-y border-gray-200 bg-white py-12">
          <div className="mx-auto max-w-7xl px-6">
            <h2 className="text-2xl font-bold text-gray-900">Гишүүний шатлал</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {MEMBERSHIP_TIERS.map((tier) => (
                <div key={tier.id} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                  <p className="text-sm font-bold uppercase tracking-wide" style={{ color: tier.color }}>
                    {tier.nameMn}
                  </p>
                  <p className="mt-2 text-2xl font-extrabold text-gray-900">{tier.discountPercent}%</p>
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
        <section className="mx-auto max-w-7xl px-6 py-12">
          <h2 className="text-2xl font-bold text-gray-900">Хэрхэн ажилладаг вэ?</h2>
          <div className="mt-6 grid gap-5 md:grid-cols-3">
            <StepCard icon={<Users />} title="Хэрэглэгч" items={["Апп эсвэл веб дээр бүртгүүлнэ", "QR кодоор дэлгүүрт нэвтэрнэ", "Оноогоо цуглуулж, бонус авна"]} />
            <StepCard icon={<Store />} title="Дэлгүүр" items={["Партнер дэлгүүр бүртгэлтэй", "Кассчин оноо нэмэх эрхтэй", "Гишүүдийн мэдээлэл харах"]} />
            <StepCard icon={<TrendingUp />} title="ABICO платформ" items={["Нэгдсэн нэвтрэх тогтолцоо", "Онооны баталгаажуулалт", "Тайлан & шинжилгээ"]} />
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="mx-auto max-w-7xl px-6 pb-16">
          <div className="rounded-3xl border border-abico-blue/20 bg-gradient-to-br from-abico-blue/5 to-abico-light/5 p-8 md:p-10">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm uppercase tracking-wider text-abico-blue">₮1,000 = 1 оноо</p>
                <h3 className="mt-2 text-2xl font-bold text-gray-900">Нэг апп, олон дэлгүүр</h3>
                <p className="mt-2 max-w-xl text-gray-600">
                  ABICO Loyalty-г туршиж үзээрэй. MVP хувилбарт бүртгэл, QR, оноо нэмэх, удирдлагын самбар багтсан.
                </p>
              </div>
              <Link href="/register" className="btn-primary shrink-0 px-8 py-3 text-base">
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

function FeatureCard({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      {icon}
      <h3 className="mt-4 font-semibold text-gray-900">{title}</h3>
      <p className="mt-2 text-sm text-gray-600">{text}</p>
    </div>
  );
}

function StepCard({ icon, title, items }: { icon: React.ReactNode; title: string; items: string[] }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
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
