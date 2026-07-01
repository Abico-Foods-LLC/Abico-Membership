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

// ponytail: BarcodeDetector — Chrome 88+/Edge/Android Chrome. Falls back to manual input.
type BarcodeDetectorCtor = new (opts: { formats: string[] }) => {
  detect(el: HTMLVideoElement): Promise<{ rawValue: string }[]>;
};

export default function EmployeePage() {
  const [me, setMe] = useState<{ name: string; role: string } | null>(null);
  const [qrCode, setQrCode] = useState("");
  const [phoneInput, setPhoneInput] = useState("");
  const [lookupMode, setLookupMode] = useState<"qr" | "phone">("qr");
  const [purchaseAmount, setPurchaseAmount] = useState("");
  const [redeemPoints, setRedeemPoints] = useState("");
  const [redeemReason, setRedeemReason] = useState("");
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

  useEffect(() => {
    fetch("/api/me")
      .then(async (r) => { if (!r.ok) throw new Error(String(r.status)); return r.json(); })
      .then((d) => setMe({ name: d.user.name, role: d.user.role }))
      .catch(() => {});
  }, []);

  async function startScan() {
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
      setError("");
      setScanning(true); // <video> mounts on next render — wiring happens in the effect below
    } catch {
      setError("Камерт нэвтрэх эрх олдсонгүй");
    }
  }

  // videoRef only exists once `scanning` is true and the <video> has mounted
  useEffect(() => {
    if (!scanning || !videoRef.current || !streamRef.current) return;
    const video = videoRef.current;
    video.srcObject = streamRef.current;
    video.play();

    const w = window as unknown as { BarcodeDetector: BarcodeDetectorCtor };
    const detector = new w.BarcodeDetector({ formats: ["qr_code"] });
    let stopped = false;
    const loop = async () => {
      if (stopped) return;
      try {
        const codes = await detector.detect(video);
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
    return () => { stopped = true; };
  }, [scanning, stopScan]);

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

    setEarnResult(`${data.transaction.user.name}-д ${formatPoints(data.pointsAdded)} оноо нэмэгдлээ`);
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
      body: JSON.stringify({ qrCode, points: Number(redeemPoints), reason: redeemReason || undefined }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) { setError(data.error ?? "Алдаа гарлаа"); return; }

    setRedeemResult(`${formatPoints(data.pointsRedeemed)} оноо хасагдлаа. Үлдэгдэл: ${formatPoints(data.remainingPoints)}`);
    setMember((m) => m && { ...m, totalPoints: data.remainingPoints });
    setRedeemPoints("");
    setRedeemReason("");
  }

  const previewPoints = purchaseAmount ? Math.floor(Number(purchaseAmount) / POINTS_PER_MNT) : 0;
  const tier = member ? getMembershipTier(member.totalPoints) : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar userName={me?.name} role={me?.role ?? "EMPLOYEE"} loading={!me} />
      <main className="mx-auto max-w-3xl px-4 py-10">
        <div className="mb-8 animate-fade-up">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-abico-blue">Ажилтан</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-gray-900">Гишүүн хайх</h1>
          <p className="mt-2 text-gray-600">QR код уншиж эсвэл гараар оруулна. ₮1,000 = 1 оноо.</p>
        </div>

        <div className="space-y-6">
          {/* QR lookup */}
          <Card className="animate-fade-up">
            <div className="mb-4 flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-abico-blue/10 text-abico-blue">
                <UserSearch className="h-4.5 w-4.5" />
              </span>
              <h2 className="font-semibold text-gray-900">1. Гишүүн хайх</h2>
            </div>

            {/* Mode toggle */}
            <div className="mb-3 flex rounded-xl border border-gray-200 bg-gray-50 p-1">
              <button type="button"
                onClick={() => setLookupMode("qr")}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-medium transition-all duration-200 ${lookupMode === "qr" ? "bg-white text-gray-900 shadow-soft" : "text-gray-400 hover:text-gray-600"}`}>
                <ScanLine className="h-4 w-4" /> QR код
              </button>
              <button type="button"
                onClick={() => setLookupMode("phone")}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-medium transition-all duration-200 ${lookupMode === "phone" ? "bg-white text-gray-900 shadow-soft" : "text-gray-400 hover:text-gray-600"}`}>
                <UserSearch className="h-4 w-4" /> Утасны дугаар
              </button>
            </div>

            {lookupMode === "qr" ? (
              <>
                {scanning && (
                  <div className="mb-4 overflow-hidden rounded-xl border border-abico-blue/30">
                    <video ref={videoRef} className="w-full" playsInline muted />
                    <div className="flex items-center justify-between bg-gray-900/80 px-4 py-2">
                      <p className="text-sm text-white/80">QR код камер руу чиглүүлнэ...</p>
                      <button type="button" onClick={stopScan} className="flex items-center gap-1 rounded-lg px-2 py-1 text-sm text-rose-300 transition-colors hover:bg-white/10 hover:text-rose-200">
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
                    className="input-premium flex-1 font-mono text-sm"
                  />
                  <Button type="button" variant="secondary" onClick={() => doLookup(qrCode)} disabled={!qrCode}>
                    Хайх
                  </Button>
                  <button
                    type="button"
                    onClick={scanning ? stopScan : startScan}
                    title="Камераар скан хийх"
                    className="flex items-center gap-1 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm transition-colors hover:bg-gray-50"
                  >
                    <Camera className="h-4 w-4 text-abico-blue" />
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
                  className="input-premium flex-1 text-sm"
                />
                <Button type="button" variant="secondary" onClick={() => doLookup(phoneInput, "phone")} disabled={!phoneInput}>
                  Хайх
                </Button>
              </div>
            )}

            {member && (
              <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">{member.name}</p>
                    <p className="text-sm text-gray-600">{member.phone}</p>
                  </div>
                  {tier && (
                    <span className="rounded-full px-3 py-1 text-xs font-bold" style={{ backgroundColor: tier.color + "22", color: tier.color }}>
                      {tier.nameMn}
                    </span>
                  )}
                </div>
                <p className="mt-2 text-sm text-gray-700">
                  Оноо: <span className="font-bold text-abico-blue">{formatPoints(member.totalPoints)}</span>
                  {tier && <span className="ml-2 text-gray-500">· {tier.discountPercent}% урамшуулал</span>}
                </p>
              </div>
            )}
            {error && (
              <p className="mt-3 rounded-xl bg-rose-50 px-3 py-2 text-sm font-medium text-rose-600">{error}</p>
            )}
          </Card>

          {/* Оноо нэмэх */}
          <Card className="animate-fade-up [animation-delay:80ms]">
            <div className="mb-4 flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-abico-blue/10 text-abico-blue">
                <ScanLine className="h-4.5 w-4.5" />
              </span>
              <h2 className="font-semibold text-gray-900">2. Оноо нэмэх</h2>
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
                  className="input-premium"
                />
              </label>
              {previewPoints > 0 && (
                <p className="text-sm text-gray-600">
                  Олгох оноо: <span className="font-bold text-abico-blue">{formatPoints(previewPoints)}</span>{" "}
                  ({formatMnt(Number(purchaseAmount))})
                </p>
              )}
              {earnResult && (
                <p className="flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-600">
                  <CheckCircle2 className="h-4 w-4" /> {earnResult}
                </p>
              )}
              <Button type="submit" className="w-full" disabled={loading || !qrCode}>
                {loading ? "Баталгаажуулж байна..." : "Оноо нэмэх"}
              </Button>
            </form>
          </Card>

          {/* Оноо хасах */}
          <Card className="animate-fade-up [animation-delay:160ms]">
            <div className="mb-4 flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-rose-500">
                <MinusCircle className="h-4.5 w-4.5" />
              </span>
              <h2 className="font-semibold text-gray-900">3. Оноо хасах (Хөнгөлөлт ашиглах)</h2>
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
                  className="input-premium"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-sm text-gray-700">Юу авсан бэ? (заавал биш)</span>
                <input
                  value={redeemReason}
                  onChange={(e) => setRedeemReason(e.target.value)}
                  placeholder="Жишээ нь: 10% хямдрал / Кофе үнэгүй"
                  className="input-premium"
                />
              </label>
              {member && redeemPoints && Number(redeemPoints) > member.totalPoints && (
                <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm font-medium text-rose-600">Оноо хүрэхгүй байна ({formatPoints(member.totalPoints)} л бий)</p>
              )}
              {redeemResult && (
                <p className="flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-600">
                  <CheckCircle2 className="h-4 w-4" /> {redeemResult}
                </p>
              )}
              <Button
                type="submit"
                className="w-full !bg-rose-50 !text-rose-600 !shadow-none hover:!bg-rose-100 hover:!translate-y-0"
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
