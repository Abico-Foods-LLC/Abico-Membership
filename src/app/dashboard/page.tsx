"use client";

import { useEffect, useState } from "react";
import { Copy, History, Share2, Store, X, Zap } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { formatMnt, formatPoints, MembershipTier } from "@/lib/loyalty";
import QRCode from "react-qr-code";

type Promotion = {
  id: string;
  title: string;
  multiplier: number;
  endsAt: string;
  store: { name: string } | null;
};

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
  promotions: Promotion[];
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
  if (!data) return <div className="min-h-screen"><Navbar /><p className="mx-auto mt-20 max-w-sm text-center text-blue-100/60">Ачааллаж байна...</p></div>;

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
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/95"
          onClick={() => setQrFullscreen(false)}
        >
          <p className="mb-6 text-sm text-white/60">Дэлгүүрт энэ QR кодоо үзүүлнэ</p>
          <div className="rounded-3xl bg-white p-6 shadow-2xl">
            <QRCode value={user.qrCode} size={260} />
          </div>
          <p className="mt-4 font-mono text-sm text-white/50">{user.qrCode}</p>
          <button className="mt-8 flex items-center gap-2 rounded-full bg-white/10 px-5 py-2.5 text-sm text-white hover:bg-white/20">
            <X className="h-4 w-4" /> Хаах
          </button>
        </div>
      )}

      <main className="mx-auto max-w-2xl px-4 py-8">

        {/* ── Active promotions banner ── */}
        {data.promotions.length > 0 && (
          <div className="mb-5 space-y-2">
            {data.promotions.map((p) => (
              <div key={p.id}
                className="flex items-center gap-3 rounded-2xl border border-abico-gold/30 bg-abico-gold/10 px-4 py-3">
                <Zap className="h-4 w-4 shrink-0 text-abico-gold" />
                <div className="flex-1 text-sm">
                  <span className="font-bold text-abico-gold">{p.multiplier}x оноо</span>
                  {" — "}{p.title}
                  {p.store && <span className="text-blue-100/60"> · {p.store.name}</span>}
                </div>
                <span className="text-xs text-blue-100/50">
                  {new Date(p.endsAt).toLocaleDateString("mn-MN")} хүртэл
                </span>
              </div>
            ))}
          </div>
        )}

        {/* ── Membership Card ── */}
        <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8"
          style={{ background: "linear-gradient(135deg, #001C3B 0%, #003060 60%, #001C3B 100%)" }}>

          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full"
            style={{ background: "radial-gradient(circle, rgba(245,197,24,0.18) 0%, transparent 70%)" }} />
          <div className="pointer-events-none absolute -bottom-12 -left-12 h-48 w-48 rounded-full"
            style={{ background: `radial-gradient(circle, ${tier.color}33 0%, transparent 70%)` }} />

          {/* Top */}
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-abico-gold text-sm font-bold text-abico-navy">A</span>
              <div>
                <p className="text-xs font-bold tracking-widest text-abico-gold">ABICO</p>
                <p className="text-xs text-blue-100/50">LOYALTY CARD</p>
              </div>
            </div>
            <span className="rounded-full border px-3 py-1 text-xs font-bold tracking-wide"
              style={{ borderColor: tier.color, color: tier.color, backgroundColor: tier.color + "22" }}>
              ★ {tier.nameMn}
            </span>
          </div>

          {/* Name + points left, QR right */}
          <div className="relative mt-6 flex gap-6">
            <div className="flex-1">
              <p className="text-sm text-blue-100/60">Гишүүний нэр</p>
              <p className="mt-0.5 text-2xl font-bold">{user.name}</p>
              <div className="mt-4">
                <p className="text-sm text-blue-100/60">Нийт оноо</p>
                <p className="text-4xl font-extrabold text-abico-gold">{formatPoints(points)}</p>
              </div>
              {nextTier && (
                <div className="mt-4">
                  <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                    <div className="h-full rounded-full"
                      style={{ width: `${progressPct}%`, background: `linear-gradient(90deg, ${tier.color}, #F5C518)` }} />
                  </div>
                  <p className="mt-1.5 text-xs text-blue-100/50">
                    {formatPoints(pointsToNext)} оноо → <span style={{ color: nextTier.color }}>{nextTier.nameMn}</span>
                  </p>
                </div>
              )}
              <div className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2">
                <span className="text-xs text-blue-100/60">Хөнгөлөлт</span>
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
              <p className="mt-1.5 text-center text-[10px] text-blue-100/40">Дарж томруулах</p>
            </button>
          </div>

          <div className="relative mt-6 border-t border-white/10 pt-4">
            <p className="text-center text-xs text-blue-100/40">
              {user.qrCode} · Дэлгүүрт QR кодоо үзүүлж оноо цуглуулна
            </p>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="mt-6 flex rounded-2xl border border-white/10 bg-white/5 p-1">
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
          <div className="mt-4 space-y-3">
            {data.transactions.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-white/5 px-6 py-10 text-center">
                <p className="text-sm text-blue-100/50">Одоогоор гүйлгээ байхгүй байна.</p>
                <p className="mt-1 text-xs text-blue-100/30">Дэлгүүрт QR кодоо үзүүлж оноо цуглуулна уу.</p>
              </div>
            ) : data.transactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <div>
                  <p className="text-sm font-medium">{tx.description ?? tx.store?.name ?? "Гүйлгээ"}</p>
                  <p className="mt-0.5 text-xs text-blue-100/50">
                    {new Date(tx.createdAt).toLocaleString("mn-MN")}
                    {tx.purchaseAmount ? ` · ${formatMnt(tx.purchaseAmount)}` : ""}
                  </p>
                </div>
                <span className={`text-sm font-bold ${tx.type === "REDEEM" ? "text-red-300" : "text-emerald-300"}`}>
                  {tx.type === "REDEEM" ? "-" : "+"}{formatPoints(tx.points)}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* ── Referral ── */}
        {tab === "referral" && (
          <div className="mt-4 space-y-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <p className="font-semibold">Урилгын код</p>
              <p className="mt-1 text-sm text-blue-100/60">
                Найзаа урьж тус бүр <span className="font-bold text-abico-gold">+50 оноо</span> авна
              </p>
              <div className="mt-4 flex items-center justify-between rounded-xl bg-white/10 px-4 py-3">
                <code className="font-mono text-xl tracking-widest">{user.referralCode}</code>
                <button type="button" onClick={() => copy(user.referralCode)} className="text-abico-gold hover:text-yellow-300">
                  <Copy className="h-5 w-5" />
                </button>
              </div>
              {copied && <p className="mt-2 text-center text-xs text-emerald-300">✓ Хуулагдлаа</p>}
            </div>

            <div className="rounded-2xl border p-5"
              style={{ borderColor: tier.color + "44", background: tier.color + "11" }}>
              <div className="flex items-center gap-2 mb-3">
                <span className="rounded-full px-2 py-0.5 text-xs font-bold"
                  style={{ backgroundColor: tier.color + "33", color: tier.color }}>★ {tier.nameMn}</span>
                <p className="font-semibold">гишүүний давуу эрх</p>
              </div>
              <p className="text-3xl font-extrabold" style={{ color: tier.color }}>{tier.discountPercent}%</p>
              <p className="text-sm text-blue-100/60">{tier.perks}</p>
              {nextTier && (
                <p className="mt-3 rounded-xl bg-white/5 px-3 py-2 text-xs text-blue-100/50">
                  {formatPoints(pointsToNext)} оноо нэмбэл{" "}
                  <span style={{ color: nextTier.color }}>{nextTier.nameMn}</span>{" "}
                  ({nextTier.discountPercent}% хөнгөлөлт) болно
                </p>
              )}
            </div>
          </div>
        )}

        {/* ── Stores ── */}
        {tab === "stores" && (
          <div className="mt-4 space-y-3">
            {data.stores.length === 0 ? (
              <p className="py-8 text-center text-sm text-blue-100/50">Дэлгүүр бүртгэлгүй байна</p>
            ) : data.stores.map((s) => (
              <div key={s.id} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold">{s.name}</p>
                    {s.address && <p className="mt-1 text-sm text-blue-100/60">📍 {s.address}</p>}
                    {s.phone && <p className="mt-0.5 text-sm text-blue-100/60">📞 {s.phone}</p>}
                  </div>
                  <span className="rounded-full bg-emerald-400/10 px-2 py-0.5 text-xs text-emerald-300">Нээлттэй</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function TabBtn({ active, onClick, children }: {
  active: boolean; onClick: () => void; children: React.ReactNode;
}) {
  return (
    <button type="button" onClick={onClick}
      className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-medium transition ${
        active ? "bg-white/10 text-white" : "text-blue-100/50 hover:text-blue-100/80"
      }`}>
      {children}
    </button>
  );
}
