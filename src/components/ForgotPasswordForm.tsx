"use client";

import { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";

export function ForgotPasswordForm() {
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
    <Card className="mx-auto max-w-md animate-fade-up p-8">
      {sent ? (
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-abico-blue/10">
            <span className="text-2xl">✉️</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900">Имэйл илгээгдлээ</h1>
          <p className="mt-2 text-sm text-gray-600">
            <span className="font-semibold text-gray-900">{email}</span> хаяг руу нууц үг сэргээх линк илгээгдлээ.
            Спам хавтсыг шалгана уу.
          </p>
          <Link href="/login" className="mt-6 inline-block text-sm font-medium text-abico-blue hover:text-abico-dark hover:underline">
            Нэвтрэх хуудас руу буцах
          </Link>
        </div>
      ) : (
        <>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-abico-blue">ABICO.MN</p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-gray-900">Нууц үг мартсан?</h1>
          <p className="mt-2 text-sm text-gray-600">
            Бүртгэлтэй имэйлээ оруулна уу — нууц үг сэргээх линк илгээнэ.
          </p>
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <label className="block">
              <span className="mb-1 block text-sm text-gray-700">Имэйл хаяг</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@mail.com"
                required
                className="input-premium"
              />
            </label>
            {error && (
              <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm font-medium text-rose-600">{error}</p>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Илгээж байна..." : "Линк илгээх"}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-gray-600">
            <Link href="/login" className="font-medium text-abico-blue hover:text-abico-dark hover:underline">
              Нэвтрэх хуудас руу буцах
            </Link>
          </p>
        </>
      )}
    </Card>
  );
}
