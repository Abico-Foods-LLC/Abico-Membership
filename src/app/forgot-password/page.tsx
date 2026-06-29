"use client";

import { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setLoading(false);
    if (!res.ok) {
      const d = await res.json();
      setError(d.error ?? "Алдаа гарлаа");
      return;
    }
    setSent(true);
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-16">
        <Card className="mx-auto max-w-md">
          {sent ? (
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-abico-blue/20">
                <span className="text-2xl">✉️</span>
              </div>
              <h1 className="text-xl font-bold">Имэйл илгээгдлээ</h1>
              <p className="mt-2 text-sm text-blue-100/70">
                <span className="font-semibold text-white">{email}</span> хаяг руу нууц үг сэргээх линк илгээгдлээ.
                Спам хавтсыг шалгана уу.
              </p>
              <Link href="/login" className="mt-6 inline-block text-sm text-abico-light hover:underline">
                Нэвтрэх хуудас руу буцах
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold">Нууц үг мартсан?</h1>
              <p className="mt-2 text-sm text-blue-100/70">
                Бүртгэлтэй имэйлээ оруулна уу — нууц үг сэргээх линк илгээнэ.
              </p>
              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <label className="block">
                  <span className="mb-1 block text-sm text-blue-100/80">Имэйл хаяг</span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@mail.com"
                    required
                    className="w-full rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 text-white outline-none focus:ring-2 focus:ring-abico-blue"
                  />
                </label>
                {error && <p className="text-sm text-red-300">{error}</p>}
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Илгээж байна..." : "Линк илгээх"}
                </Button>
              </form>
              <p className="mt-4 text-center text-sm text-blue-100/70">
                <Link href="/login" className="text-abico-light hover:underline">
                  Нэвтрэх хуудас руу буцах
                </Link>
              </p>
            </>
          )}
        </Card>
      </main>
    </div>
  );
}
