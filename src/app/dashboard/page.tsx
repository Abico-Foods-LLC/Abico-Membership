"use client";

import { useEffect, useState } from "react";
import { Copy, Gift, History, Share2 } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Card } from "@/components/Card";
import { TierBadge } from "@/components/TierBadge";
import { QrDisplay } from "@/components/QrDisplay";
import { formatMnt, formatPoints, MembershipTier } from "@/lib/loyalty";

type DashboardData = {
  user: {
    name: string;
    phone: string;
    qrCode: string;
    referralCode: string;
    role: string;
  };
  points: number;
  tier: MembershipTier;
  nextTier: MembershipTier | null;
  pointsToNext: number;
  transactions: Array<{
    id: string;
    type: string;
    points: number;
    purchaseAmount: number | null;
    multiplier: number;
    description: string | null;
    createdAt: string;
    store: { name: string } | null;
  }>;
};

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/me")
      .then(async (res) => {
        if (!res.ok) throw new Error("Ачаалах амжилтгүй");
        return res.json();
      })
      .then(setData)
      .catch(() => setError("Мэдээлэл ачаалахад алдаа гарлаа"));
  }, []);

  return (
    <div className="min-h-screen">
      <Navbar userName={data?.user.name} role={data?.user.role} />
      <main className="mx-auto max-w-6xl px-4 py-10">
        {error && <p className="text-red-300">{error}</p>}
        {!data && !error && <p className="text-blue-100/70">Ачааллаж байна...</p>}

        {data && (
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-6">
              <Card>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-sm text-blue-100/70">Сайн байна уу,</p>
                    <h1 className="text-3xl font-bold">{data.user.name}</h1>
                    <div className="mt-3">
                      <TierBadge tier={data.tier} large />
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="stat-label">Нийт оноо</p>
                    <p className="stat-value text-abico-gold">
                      {formatPoints(data.points)}
                    </p>
                    {data.nextTier && (
                      <p className="mt-1 text-sm text-blue-100/70">
                        Дараагийн шат ({data.nextTier.nameMn}):{" "}
                        {formatPoints(data.pointsToNext)} оноо
                      </p>
                    )}
                  </div>
                </div>
              </Card>

              <Card>
                <div className="mb-4 flex items-center gap-2">
                  <History className="h-5 w-5 text-abico-gold" />
                  <h2 className="text-lg font-semibold">Онооны түүх</h2>
                </div>
                <div className="space-y-3">
                  {data.transactions.length === 0 ? (
                    <p className="text-sm text-blue-100/60">
                      Одоогоор гүйлгээ байхгүй. Дэлгүүрт QR кодоо үзүүлнэ үү.
                    </p>
                  ) : (
                    data.transactions.map((tx) => (
                      <div
                        key={tx.id}
                        className="flex items-center justify-between rounded-xl border border-white/10 px-4 py-3"
                      >
                        <div>
                          <p className="font-medium">
                            {tx.description ??
                              (tx.store?.name ? tx.store.name : "Гүйлгээ")}
                          </p>
                          <p className="text-xs text-blue-100/60">
                            {new Date(tx.createdAt).toLocaleString("mn-MN")}
                            {tx.purchaseAmount
                              ? ` · ${formatMnt(tx.purchaseAmount)}`
                              : ""}
                          </p>
                        </div>
                        <p
                          className={
                            tx.type === "REDEEM"
                              ? "font-bold text-red-300"
                              : "font-bold text-emerald-300"
                          }
                        >
                          {tx.type === "REDEEM" ? "-" : "+"}
                          {formatPoints(tx.points)}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <div className="mb-4 flex items-center gap-2">
                  <Gift className="h-5 w-5 text-abico-gold" />
                  <h2 className="text-lg font-semibold">Миний QR код</h2>
                </div>
                <QrDisplay value={data.user.qrCode} />
                <p className="mt-4 text-center text-sm text-blue-100/70">
                  Дэлгүүрт энэ QR кодоо үзүүлж оноо цуглуулна
                </p>
              </Card>

              <Card>
                <div className="mb-3 flex items-center gap-2">
                  <Share2 className="h-5 w-5 text-abico-gold" />
                  <h2 className="text-lg font-semibold">Урилгын код</h2>
                </div>
                <p className="text-sm text-blue-100/70">
                  Найзаа уривал тус бүр +50 оноо
                </p>
                <div className="mt-3 flex items-center justify-between rounded-xl bg-white/10 px-4 py-3">
                  <code className="font-mono text-lg">{data.user.referralCode}</code>
                  <button
                    type="button"
                    className="text-abico-gold hover:text-yellow-300"
                    onClick={() => navigator.clipboard.writeText(data.user.referralCode)}
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
              </Card>

              <Card>
                <h2 className="font-semibold">Таны давуу эрх</h2>
                <p className="mt-2 text-2xl font-bold text-abico-gold">
                  {data.tier.discountPercent}% хөнгөлөлт
                </p>
                <p className="mt-1 text-sm text-blue-100/70">{data.tier.perks}</p>
              </Card>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
