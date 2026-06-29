"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Camera, CameraOff, CheckCircle2, MinusCircle, ScanLine, UserSearch } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { formatMnt, formatPoints, getMembershipTier, POINTS_PER_MNT } from "@/lib/loyalty";

type MemberPreview = {
  id: string;
  name: string;
  phone: string;
  qrCode: string;
  totalPoints: number;
};

export default function EmployeePage() {
  const [qrCode, setQrCode] = useState("");
  const [phoneInput, setPhoneInput] = useState("");
  const [lookupMode, setLookupMode] = useState<"qr" | "phone">("qr");
  const [purchaseAmount, setPurchaseAmount] = useState("");
  const [redeemPoints, setRedeemPoints] = useState("");
  const [member, setMember] = useState<MemberPreview | null>(null);
  const [earnResult, setEarnResult] = useState("");
  const [redeemResult, setRedeemResult] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number>(0);

  const stopScan = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setScanning(false);
  }, []);

  useEffect(() => () => stopScan(), [stopScan]);

  async function startScan() {
    // ponytail: BarcodeDetector — Chrome 88+/Edge/Android Chrome. Falls back to manual input.
    type BarcodeDetectorCtor = new (opts: { formats: string[] }) => {
      detect(el: HTMLVideoElement): Promise<{ rawValue: string }[]>;
    };
    const w = window as unknown as { BarcodeDetector?: BarcodeDetectorCtor };
    if (!w.BarcodeDetector) {
      setError("QR скан хийхэд Chrome браузер шаардлагатай");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;
      if (!videoRef.current) return;
      videoRef.current.srcObject = stream;
      videoRef.current.play();
      setScanning(true);
      setError("");

      const detector = new w.BarcodeDetector({ formats: ["qr_code"] });
      const loop = async () => {
        if (!videoRef.current) return;
        try {
          const codes = await detector.detect(videoRef.current);
          if (codes.length > 0) {
            const value: string = codes[0].rawValue;
            stopScan();
            setQrCode(value.toUpperCase());
            doLookup(value.toUpperCase());
            return;
          }
        } catch {}
        rafRef.current = requestAnimationFrame(loop);
      };
      rafRef.current = requestAnimationFrame(loop);
    } catch {
      setError("Камерт нэвтрэх эрх олдсонгүй");
    }
  }

  async function doLookup(code: string, mode: "qr" | "phone" = "qr") {
    setError("");
    setMember(null);
    setEarnResult("");
    setRedeemResult("");
    const param = mode === "phone"
      ? `phone=${encodeURIComponent(code)}`
      : `qr=${encodeURIComponent(code)}`;
    const res = await fetch(`/api/points/add?${param}`);
    const data = await res.json();
    if (!res.ok) { setError(data.error ?? "Олдсонгүй"); return; }
    setMember(data.member);
    setQrCode(data.member.qrCode);
  }

  async function addPoints(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setEarnResult("");

    const res = await fetch("/api/points/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ qrCode, purchaseAmount: Number(purchaseAmount) }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) { setError(data.error ?? "Алдаа гарлаа"); return; }

    setEarnResult(
      `${data.transaction.user.name}-д ${formatPoints(data.pointsAdded)} оноо нэмэгдлээ` +
        (data.promotion ? ` (${data.promotion})` : ""),
    );
    setMember((m) => m && { ...m, totalPoints: m.totalPoints + data.pointsAdded });
    setPurchaseAmount("");
  }

  async function redeemPointsFn(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setRedeemResult("");

    const res = await fetch("/api/points/redeem", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ qrCode, points: Number(redeemPoints) }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) { setError(data.error ?? "Алдаа гарлаа"); return; }

    setRedeemResult(`${formatPoints(data.pointsRedeemed)} оноо хасагдлаа. Үлдэгдэл: ${formatPoints(data.remainingPoints)}`);
    setMember((m) => m && { ...m, totalPoints: data.remainingPoints });
    setRedeemPoints("");
  }

  const previewPoints = purchaseAmount ? Math.floor(Number(purchaseAmount) / POINTS_PER_MNT) : 0;
  const tier = member ? getMembershipTier(member.totalPoints) : null;

  return (
    <div className="min-h-screen">
      <Navbar role="EMPLOYEE" />
      <main className="mx-auto max-w-3xl px-4 py-10">
        <div className="mb-8">
          <p className="text-sm uppercase tracking-wider text-abico-gold">Ажилтан</p>
          <h1 className="text-3xl font-bold">Гишүүн хайх</h1>
          <p className="mt-2 text-gray-600">QR код уншиж эсвэл гараар оруулна. ₮1,000 = 1 оноо.</p>
        </div>

        <div className="space-y-6">
          {/* QR lookup */}
          <Card>
            <div className="mb-4 flex items-center gap-2">
              <UserSearch className="h-5 w-5 text-abico-gold" />
              <h2 className="font-semibold">1. Гишүүн хайх</h2>
            </div>

            {/* Mode toggle */}
            <div className="mb-3 flex rounded-xl border border-gray-200 bg-gray-50 p-1">
              <button type="button"
                onClick={() => setLookupMode("qr")}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-medium transition ${lookupMode === "qr" ? "bg-gray-100 text-white" : "text-gray-400"}`}>
                <ScanLine className="h-4 w-4" /> QR код
              </button>
              <button type="button"
                onClick={() => setLookupMode("phone")}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-medium transition ${lookupMode === "phone" ? "bg-gray-100 text-white" : "text-gray-400"}`}>
                <UserSearch className="h-4 w-4" /> Утасны дугаар
              </button>
            </div>

            {lookupMode === "qr" ? (
              <>
                {scanning && (
                  <div className="mb-4 overflow-hidden rounded-xl border border-abico-gold/40">
                    <video ref={videoRef} className="w-full" playsInline muted />
                    <div className="flex items-center justify-between bg-black/40 px-4 py-2">
                      <p className="text-sm text-gray-600">QR код камер руу чиглүүлнэ...</p>
                      <button type="button" onClick={stopScan} className="flex items-center gap-1 text-sm text-red-300 hover:text-red-200">
                        <CameraOff className="h-4 w-4" /> Зогсоох
                      </button>
                    </div>
                  </div>
                )}
                <div className="flex gap-2">
                  <input
                    value={qrCode}
                    onChange={(e) => setQrCode(e.target.value.toUpperCase())}
                    placeholder="ABICO-XXXXXXXXXXXX"
                    className="flex-1 rounded-xl border border-gray-200 bg-gray-100 px-4 py-2.5 font-mono text-sm outline-none focus:ring-2 focus:ring-abico-gold"
                  />
                  <Button type="button" variant="secondary" onClick={() => doLookup(qrCode)} disabled={!qrCode}>
                    Хайх
                  </Button>
                  <button
                    type="button"
                    onClick={scanning ? stopScan : startScan}
                    title="Камераар скан хийх"
                    className="flex items-center gap-1 rounded-xl border border-gray-200 bg-gray-100 px-3 py-2.5 text-sm hover:bg-white/20"
                  >
                    <Camera className="h-4 w-4 text-abico-gold" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex gap-2">
                <input
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  placeholder="99112233"
                  type="tel"
                  className="flex-1 rounded-xl border border-gray-200 bg-gray-100 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-abico-gold"
                />
                <Button type="button" variant="secondary" onClick={() => doLookup(phoneInput, "phone")} disabled={!phoneInput}>
                  Хайх
                </Button>
              </div>
            )}

            {member && (
              <div className="mt-4 rounded-xl border border-emerald-400/30 bg-emerald-400/10 p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold">{member.name}</p>
                    <p className="text-sm text-gray-600">{member.phone}</p>
                  </div>
                  {tier && (
                    <span className="rounded-full px-3 py-1 text-xs font-bold" style={{ backgroundColor: tier.color + "33", color: tier.color }}>
                      {tier.nameMn}
                    </span>
                  )}
                </div>
                <p className="mt-2 text-sm">
                  Оноо: <span className="font-bold text-abico-gold">{formatPoints(member.totalPoints)}</span>
                  {tier && <span className="ml-2 text-gray-500">· {tier.discountPercent}% хөнгөлөлт</span>}
                </p>
              </div>
            )}
            {error && <p className="mt-3 text-sm text-red-300">{error}</p>}
          </Card>

          {/* Оноо нэмэх */}
          <Card>
            <div className="mb-4 flex items-center gap-2">
              <ScanLine className="h-5 w-5 text-abico-gold" />
              <h2 className="font-semibold">2. Оноо нэмэх</h2>
            </div>
            <form onSubmit={addPoints} className="space-y-4">
              <label className="block">
                <span className="mb-1 block text-sm text-gray-700">Худалдан авалтын дүн (₮)</span>
                <input
                  type="number"
                  min="1000"
                  step="100"
                  value={purchaseAmount}
                  onChange={(e) => setPurchaseAmount(e.target.value)}
                  placeholder="50000"
                  required
                  className="w-full rounded-xl border border-gray-200 bg-gray-100 px-4 py-2.5 outline-none focus:ring-2 focus:ring-abico-gold"
                />
              </label>
              {previewPoints > 0 && (
                <p className="text-sm text-gray-600">
                  Олгох оноо: <span className="font-bold text-abico-gold">{formatPoints(previewPoints)}</span>{" "}
                  ({formatMnt(Number(purchaseAmount))})
                </p>
              )}
              {earnResult && (
                <p className="flex items-center gap-2 text-sm text-emerald-300">
                  <CheckCircle2 className="h-4 w-4" /> {earnResult}
                </p>
              )}
              <Button type="submit" className="w-full" disabled={loading || !qrCode}>
                {loading ? "Баталгаажуулж байна..." : "Оноо нэмэх"}
              </Button>
            </form>
          </Card>

          {/* Оноо хасах */}
          <Card>
            <div className="mb-4 flex items-center gap-2">
              <MinusCircle className="h-5 w-5 text-red-400" />
              <h2 className="font-semibold">3. Оноо хасах (Хөнгөлөлт ашиглах)</h2>
            </div>
            <form onSubmit={redeemPointsFn} className="space-y-4">
              <label className="block">
                <span className="mb-1 block text-sm text-gray-700">Хасах оноо</span>
                <input
                  type="number"
                  min="1"
                  value={redeemPoints}
                  onChange={(e) => setRedeemPoints(e.target.value)}
                  placeholder="100"
                  required
                  className="w-full rounded-xl border border-gray-200 bg-gray-100 px-4 py-2.5 outline-none focus:ring-2 focus:ring-abico-gold"
                />
              </label>
              {member && redeemPoints && Number(redeemPoints) > member.totalPoints && (
                <p className="text-sm text-red-300">Оноо хүрэхгүй байна ({formatPoints(member.totalPoints)} л бий)</p>
              )}
              {redeemResult && (
                <p className="flex items-center gap-2 text-sm text-emerald-300">
                  <CheckCircle2 className="h-4 w-4" /> {redeemResult}
                </p>
              )}
              <Button
                type="submit"
                className="w-full !bg-red-500/20 !text-red-200 hover:!bg-red-500/30"
                disabled={loading || !qrCode || !member}
              >
                {loading ? "Хасаж байна..." : "Оноо хасах"}
              </Button>
            </form>
          </Card>
        </div>
      </main>
    </div>
  );
}
