"use client";

import { useEffect, useState } from "react";
import { ArrowDownRight, ArrowUpRight, Check, Copy, History, MapPin, Phone, Share2, Sparkles, Store, X } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { formatMnt, formatPoints, MembershipTier } from "@/lib/loyalty";
import QRCode from "react-qr-code";

type StoreItem = {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
};

type DashboardData = {
  user: { name: string; phone: string; qrCode: string; referralCode: string; role: string };
  points: number;
  tier: MembershipTier;
  nextTier: MembershipTier | null;
  pointsToNext: number;
  transactions: Array<{
    id: string; type: string; points: number; purchaseAmount: number | null;
    description: string | null; createdAt: string; store: { name: string } | null;
  }>;
  stores: StoreItem[];
};

type Tab = "history" | "referral" | "stores";

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<Tab>("history");
  const [copied, setCopied] = useState(false);
  const [qrFullscreen, setQrFullscreen] = useState(false);

  useEffect(() => {
    fetch("/api/me")
      .then(async (r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then(setData)
      .catch(() => setError("Мэдээлэл ачаалахад алдаа гарлаа"));
  }, []);

  function copy(text: string) {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (error) return <div className="min-h-screen"><Navbar /><p className="mx-auto mt-20 max-w-sm text-center text-red-300">{error}</p></div>;
  if (!data) return <div className="min-h-screen"><Navbar loading /><p className="mx-auto mt-20 max-w-sm text-center text-gray-500">Ачааллаж байна...</p></div>;

  const { user, points, tier, nextTier, pointsToNext } = data;
  const progressPct = nextTier
    ? Math.round(((points - tier.minPoints) / (nextTier.minPoints - tier.minPoints)) * 100)
    : 100;

  return (
    <div className="min-h-screen">
      <Navbar userName={user.name} role={user.role} />

      {/* ── Fullscreen QR overlay ── */}
      {qrFullscreen && (
        <div
          className="fixed inset-0 z-50 flex animate-fade-up flex-col items-center justify-center bg-abico-navy/95 backdrop-blur-sm [animation-duration:0.25s]"
          onClick={() => setQrFullscreen(false)}
        >
          <p className="mb-6 text-sm text-white/60">Дэлгүүрт энэ QR кодоо үзүүлнэ</p>
          <div className="rounded-3xl bg-white p-6 shadow-2xl">
            <QRCode value={user.qrCode} size={260} />
          </div>
          <p className="mt-4 font-mono text-sm text-white/50">{user.qrCode}</p>
          <button
            type="button"
            className="mt-8 flex items-center gap-2 rounded-full bg-white/10 px-5 py-2.5 text-sm text-white transition-colors hover:bg-white/20"
          >
            <X className="h-4 w-4" /> Хаах
          </button>
        </div>
      )}

      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
          {/* ── Left: Membership Card ── */}
          <div className="animate-fade-up">
            <div className="relative overflow-hidden rounded-3xl p-6 shadow-elevated ring-1 ring-white/10 sm:p-8"
              style={{ background: "linear-gradient(135deg, #001C3B 0%, #023876 60%, #001C3B 100%)" }}>

              <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full"
                style={{ background: "radial-gradient(circle, rgba(21,114,190,0.25) 0%, transparent 70%)" }} />
              <div className="pointer-events-none absolute -bottom-12 -left-12 h-48 w-48 rounded-full"
                style={{ background: `radial-gradient(circle, ${tier.color}33 0%, transparent 70%)` }} />

              {/* Top */}
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-abico-blue text-sm font-bold text-white">A</span>
                  <div>
                    <p className="text-xs font-bold tracking-widest text-abico-light">ABICO</p>
                    <p className="text-xs text-white/50">LOYALTY CARD</p>
                  </div>
                </div>
                <span className="flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-bold tracking-wide"
                  style={{ borderColor: tier.color, color: tier.color, backgroundColor: tier.color + "22" }}>
                  <Sparkles className="h-3 w-3" /> {tier.nameMn}
                </span>
              </div>

              {/* Name + points left, QR right */}
              <div className="relative mt-6 flex gap-6">
                <div className="flex-1">
                  <p className="text-sm text-white/60">Гишүүний нэр</p>
                  <p className="mt-0.5 text-2xl font-bold text-white">{user.name}</p>
                  <div className="mt-4">
                    <p className="text-sm text-white/60">Нийт оноо</p>
                    <p className="text-4xl font-extrabold text-abico-gold">{formatPoints(points)}</p>
                  </div>
                  {nextTier && (
                    <div className="mt-4">
                      <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                        <div className="h-full rounded-full"
                          style={{ width: `${progressPct}%`, background: `linear-gradient(90deg, ${tier.color}, #1572BE)` }} />
                      </div>
                      <p className="mt-1.5 text-xs text-white/50">
                        {formatPoints(pointsToNext)} оноо → <span style={{ color: nextTier.color }}>{nextTier.nameMn}</span>
                      </p>
                    </div>
                  )}
                  <div className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2">
                    <span className="text-xs text-white/60">Урамшуулал</span>
                    <span className="text-lg font-extrabold" style={{ color: tier.color }}>{tier.discountPercent}%</span>
                  </div>
                </div>

                {/* QR — tap to fullscreen */}
                <button type="button" onClick={() => setQrFullscreen(true)}
                  className="flex flex-col items-center justify-center transition hover:opacity-80 active:scale-95"
                  title="Томруулах">
                  <div className="rounded-2xl bg-white p-3 shadow-xl">
                    <QRCode value={user.qrCode} size={110} />
                  </div>
                  <p className="mt-1.5 text-center text-[10px] text-white/40">Дарж томруулах</p>
                </button>
              </div>

              <div className="relative mt-6 border-t border-white/10 pt-4">
                <p className="text-center text-xs text-white/40">
                  {user.qrCode} · Дэлгүүрт QR кодоо үзүүлж оноо цуглуулна
                </p>
              </div>
            </div>

            {/* Referral card — visible on desktop below membership card */}
            <div className="mt-4 hidden rounded-2xl border p-5 lg:block"
              style={{ borderColor: tier.color + "44", background: tier.color + "0d" }}>
              <div className="mb-3 flex items-center gap-2">
                <span className="flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold"
                  style={{ backgroundColor: tier.color + "22", color: tier.color }}>
                  <Sparkles className="h-3 w-3" /> {tier.nameMn}
                </span>
                <p className="font-semibold text-gray-900">гишүүний давуу эрх</p>
              </div>
              <p className="text-3xl font-extrabold tracking-tight" style={{ color: tier.color }}>{tier.discountPercent}%</p>
              <p className="text-sm text-gray-600">{tier.perks}</p>
              {nextTier && (
                <p className="mt-3 rounded-xl bg-white/70 px-3 py-2 text-xs text-gray-500">
                  {formatPoints(pointsToNext)} оноо нэмбэл{" "}
                  <span className="font-semibold" style={{ color: nextTier.color }}>{nextTier.nameMn}</span>{" "}
                  ({nextTier.discountPercent}% урамшуулал) болно
                </p>
              )}
            </div>
          </div>

          {/* ── Right: Tabs ── */}
          <div className="animate-fade-up [animation-delay:80ms]">
            <div className="flex rounded-2xl border border-gray-200 bg-gray-50 p-1">
              <TabBtn active={tab === "history"} onClick={() => setTab("history")}>
                <History className="h-4 w-4" /> Түүх
              </TabBtn>
              <TabBtn active={tab === "referral"} onClick={() => setTab("referral")}>
                <Share2 className="h-4 w-4" /> Урилга
              </TabBtn>
              <TabBtn active={tab === "stores"} onClick={() => setTab("stores")}>
                <Store className="h-4 w-4" /> Дэлгүүр
              </TabBtn>
            </div>

            {/* ── History ── */}
            {tab === "history" && (
              <div className="mt-4 space-y-2">
                {data.transactions.length === 0 ? (
                  <div className="card-premium px-6 py-12 text-center">
                    <History className="mx-auto h-8 w-8 text-gray-300" />
                    <p className="mt-3 text-sm font-medium text-gray-500">Одоогоор гүйлгээ байхгүй байна</p>
                    <p className="mt-1 text-xs text-gray-400">Дэлгүүрт QR кодоо үзүүлж оноо цуглуулна уу</p>
                  </div>
                ) : data.transactions.map((tx) => {
                  const isRedeem = tx.type === "REDEEM";
                  return (
                    <div key={tx.id} className="card-premium-hover flex items-center justify-between px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${isRedeem ? "bg-rose-50 text-rose-600" : "bg-emerald-50 text-emerald-600"}`}>
                          {isRedeem ? <ArrowDownRight className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                        </span>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{tx.description ?? tx.store?.name ?? "Гүйлгээ"}</p>
                          <p className="mt-0.5 text-xs text-gray-400">
                            {new Date(tx.createdAt).toLocaleString("mn-MN")}
                            {tx.purchaseAmount ? ` · ${formatMnt(tx.purchaseAmount)}` : ""}
                          </p>
                        </div>
                      </div>
                      <span className={`shrink-0 text-sm font-bold ${isRedeem ? "text-rose-600" : "text-emerald-600"}`}>
                        {isRedeem ? "-" : "+"}{formatPoints(tx.points)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* ── Referral ── */}
            {tab === "referral" && (
              <div className="mt-4 space-y-4">
                <div className="card-premium p-5">
                  <p className="font-semibold text-gray-900">Урилгын код</p>
                  <p className="mt-1 text-sm text-gray-500">
                    Найзаа урьж тус бүр <span className="font-bold text-abico-blue">+50 оноо</span> авна
                  </p>
                  <div className="mt-4 flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3">
                    <code className="font-mono text-xl tracking-widest text-gray-900">{user.referralCode}</code>
                    <button
                      type="button"
                      onClick={() => copy(user.referralCode)}
                      className="rounded-lg p-1.5 text-abico-blue transition-colors hover:bg-abico-blue/10 hover:text-abico-dark"
                      title="Хуулах"
                    >
                      {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                    </button>
                  </div>
                  {copied && <p className="mt-2 text-center text-xs font-medium text-emerald-600">✓ Хуулагдлаа</p>}
                </div>

                <div className="rounded-2xl border p-5 lg:hidden"
                  style={{ borderColor: tier.color + "44", background: tier.color + "0d" }}>
                  <div className="mb-3 flex items-center gap-2">
                    <span className="flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold"
                      style={{ backgroundColor: tier.color + "22", color: tier.color }}>
                      <Sparkles className="h-3 w-3" /> {tier.nameMn}
                    </span>
                    <p className="font-semibold text-gray-900">гишүүний давуу эрх</p>
                  </div>
                  <p className="text-3xl font-extrabold tracking-tight" style={{ color: tier.color }}>{tier.discountPercent}%</p>
                  <p className="text-sm text-gray-600">{tier.perks}</p>
                  {nextTier && (
                    <p className="mt-3 rounded-xl bg-white/70 px-3 py-2 text-xs text-gray-500">
                      {formatPoints(pointsToNext)} оноо нэмбэл{" "}
                      <span className="font-semibold" style={{ color: nextTier.color }}>{nextTier.nameMn}</span>{" "}
                      ({nextTier.discountPercent}% урамшуулал) болно
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* ── Stores ── */}
            {tab === "stores" && (
              <div className="mt-4 space-y-3">
                {data.stores.length === 0 ? (
                  <div className="card-premium px-6 py-12 text-center">
                    <Store className="mx-auto h-8 w-8 text-gray-300" />
                    <p className="mt-3 text-sm text-gray-500">Дэлгүүр бүртгэлгүй байна</p>
                  </div>
                ) : data.stores.map((s) => (
                  <div key={s.id} className="card-premium-hover px-4 py-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900">{s.name}</p>
                        {s.address && (
                          <p className="mt-1 flex items-center gap-1.5 text-sm text-gray-500">
                            <MapPin className="h-3.5 w-3.5 shrink-0 text-gray-400" /> {s.address}
                          </p>
                        )}
                        {s.phone && (
                          <p className="mt-0.5 flex items-center gap-1.5 text-sm text-gray-500">
                            <Phone className="h-3.5 w-3.5 shrink-0 text-gray-400" /> {s.phone}
                          </p>
                        )}
                      </div>
                      <span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">Нээлттэй</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function TabBtn({ active, onClick, children }: {
  active: boolean; onClick: () => void; children: React.ReactNode;
}) {
  return (
    <button type="button" onClick={onClick}
      className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-medium transition-all duration-200 ${
        active ? "bg-white text-gray-900 shadow-soft" : "text-gray-400 hover:text-gray-700"
      }`}>
      {children}
    </button>
  );
}
