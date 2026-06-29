"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";

function ResetForm() {
  const router = useRouter();
  const token = useSearchParams().get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) { setError("Нууц үг таарахгүй байна"); return; }
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    const d = await res.json();
    setLoading(false);
    if (!res.ok) { setError(d.error ?? "Алдаа гарлаа"); return; }
    setDone(true);
    setTimeout(() => router.push("/login"), 2500);
  }

  if (!token) return (
    <Card className="mx-auto max-w-md text-center">
      <p className="text-red-300">Линк буруу байна. Дахин оролдоно уу.</p>
      <Link href="/forgot-password" className="mt-4 inline-block text-sm text-abico-light hover:underline">
        Буцах
      </Link>
    </Card>
  );

  return (
    <Card className="mx-auto max-w-md">
      {done ? (
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-400/20">
            <span className="text-2xl">✓</span>
          </div>
          <h1 className="text-xl font-bold text-emerald-300">Амжилттай!</h1>
          <p className="mt-2 text-sm text-gray-600">Нууц үг шинэчлэгдлээ. Нэвтрэх хуудас руу чиглүүлж байна...</p>
        </div>
      ) : (
        <>
          <h1 className="text-2xl font-bold">Шинэ нууц үг</h1>
          <p className="mt-2 text-sm text-gray-600">Хамгийн багадаа 6 тэмдэгт оруулна уу.</p>
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <label className="block">
              <span className="mb-1 block text-sm text-gray-700">Шинэ нууц үг</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full rounded-xl border border-gray-200 bg-gray-100 px-4 py-2.5 text-white outline-none focus:ring-2 focus:ring-abico-blue"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm text-gray-700">Нууц үг давтах</span>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                minLength={6}
                className="w-full rounded-xl border border-gray-200 bg-gray-100 px-4 py-2.5 text-white outline-none focus:ring-2 focus:ring-abico-blue"
              />
            </label>
            {error && <p className="text-sm text-red-300">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Хадгалж байна..." : "Нууц үг сэргээх"}
            </Button>
          </form>
        </>
      )}
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-16">
        <Suspense fallback={<Card className="mx-auto max-w-md text-center text-gray-500">Ачааллаж байна...</Card>}>
          <ResetForm />
        </Suspense>
      </main>
    </div>
  );
}
