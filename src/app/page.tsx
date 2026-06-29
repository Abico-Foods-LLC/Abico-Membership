import Link from "next/link";
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

export default async function HomePage() {
  const session = await getSession();

  return (
    <div className="min-h-screen">
      <Navbar
        userName={session?.name}
        role={session?.role}
      />

      <main>
        <section className="mx-auto max-w-6xl px-4 py-16 md:py-24">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-abico-sky">
              ABICO.MN
            </p>
            <h1 className="mt-4 text-4xl font-extrabold leading-tight md:text-6xl">
              Гишүүнчлэлийн
              <span className="text-abico-gold"> Бонус Систем</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-blue-100/80">
              Олон дэлгүүрт нэг картаар — оноо цуглуулж, бонус авна. QR кодоор
              хурдан бүртгэл, ажилтан оноо нэмэх, гишүүний шатлал.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/register" className="btn-primary">
                Одоо бүртгүүлэх
              </Link>
              <Link href="/login" className="rounded-xl border border-white/20 px-4 py-2.5 text-sm font-semibold hover:bg-white/10">
                Нэвтрэх
              </Link>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-16">
          <div className="grid gap-4 md:grid-cols-3">
            <FeatureCard
              icon={<QrCode className="h-6 w-6 text-abico-gold" />}
              title="QR код"
              text="Дэлгүүрт QR кодоо үзүүлж оноо цуглуулна"
            />
            <FeatureCard
              icon={<Award className="h-6 w-6 text-abico-gold" />}
              title="Шатлал"
              text="МӨНГӨ → АЛТ → ПЛАТИНУМ → VIP хөнгөлөлт"
            />
            <FeatureCard
              icon={<Bell className="h-6 w-6 text-abico-gold" />}
              title="Урамшуулал"
              text="2x–3x оноо, урилга +50 оноо"
            />
          </div>
        </section>

        <section className="border-y border-white/10 bg-white/5 py-16">
          <div className="mx-auto max-w-6xl px-4">
            <h2 className="text-2xl font-bold">Гишүүний шатлал</h2>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {MEMBERSHIP_TIERS.map((tier) => (
                <div
                  key={tier.id}
                  className="rounded-2xl border border-white/10 bg-abico-navy/40 p-5"
                >
                  <p className="text-sm font-bold uppercase tracking-wide" style={{ color: tier.color === "#001C3B" ? "#bfe0f3" : tier.color }}>
                    {tier.nameMn}
                  </p>
                  <p className="mt-2 text-2xl font-extrabold">
                    {tier.discountPercent}%
                  </p>
                  <p className="mt-1 text-sm text-blue-100/70">{tier.perks}</p>
                  <p className="mt-3 text-xs text-blue-100/50">
                    {tier.maxPoints
                      ? `${tier.minPoints.toLocaleString()} – ${tier.maxPoints.toLocaleString()} оноо`
                      : `${tier.minPoints.toLocaleString()}+ оноо`}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="text-2xl font-bold">Хэрхэн ажилладаг вэ?</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            <StepCard
              icon={<Users />}
              title="Хэрэглэгч"
              items={[
                "Апп эсвэл веб дээр бүртгүүлнэ",
                "QR кодоор дэлгүүрт нэвтэрнэ",
                "Оноогоо цуглуулж, бонус авна",
              ]}
            />
            <StepCard
              icon={<Store />}
              title="Дэлгүүр"
              items={[
                "Партнер дэлгүүр бүртгэлтэй",
                "Кассчин оноо нэмэх эрхтэй",
                "Гишүүдийн мэдээлэл харах",
              ]}
            />
            <StepCard
              icon={<TrendingUp />}
              title="ABICO платформ"
              items={[
                "Нэгдсэн нэвтрэх тогтолцоо",
                "Онооны баталгаажуулалт",
                "Тайлан & шинжилгээ",
              ]}
            />
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-20">
          <div className="rounded-3xl border border-abico-gold/30 bg-gradient-to-br from-abico-gold/15 to-transparent p-8 md:p-10">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm uppercase tracking-wider text-abico-gold">
                  ₮1,000 = 1 оноо
                </p>
                <h3 className="mt-2 text-2xl font-bold">
                  Нэг апп, олон дэлгүүр
                </h3>
                <p className="mt-2 max-w-xl text-blue-100/80">
                  ABICO Loyalty-г туршиж үзээрэй. MVP хувилбарт бүртгэл, QR,
                  оноо нэмэх, удирдлагын самбар багтсан.
                </p>
              </div>
              <Link href="/register" className="btn-primary shrink-0">
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

function FeatureCard({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
      {icon}
      <h3 className="mt-4 font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-blue-100/70">{text}</p>
    </div>
  );
}

function StepCard({
  icon,
  title,
  items,
}: {
  icon: React.ReactNode;
  title: string;
  items: string[];
}) {
  return (
    <div className="rounded-2xl border border-white/10 p-6">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-abico-gold">
        {icon}
      </div>
      <h3 className="mt-4 text-lg font-semibold">{title}</h3>
      <ul className="mt-3 space-y-2 text-sm text-blue-100/75">
        {items.map((item) => (
          <li key={item}>• {item}</li>
        ))}
      </ul>
    </div>
  );
}
