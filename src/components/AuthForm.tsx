"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    phone: "",
    password: "",
    referralCode: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";
    const payload =
      mode === "login"
        ? { phone: form.phone, password: form.password }
        : form;

    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Алдаа гарлаа");
      return;
    }

    const role = data.user.role;
    if (role === "PLATFORM_ADMIN" || role === "STORE_ADMIN") {
      router.push("/admin");
    } else if (role === "EMPLOYEE") {
      router.push("/employee");
    } else {
      router.push("/dashboard");
    }
    router.refresh();
  }

  return (
    <Card className="mx-auto max-w-md animate-fade-up p-8">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-abico-blue">ABICO.MN</p>
      <h1 className="mt-2 text-2xl font-bold tracking-tight text-gray-900">
        {mode === "login" ? "Нэвтрэх" : "Гишүүнчлэлд бүртгүүлэх"}
      </h1>
      <p className="mt-2 text-sm text-gray-600">
        {mode === "login"
          ? "Утасны дугаар, нууц үгээр нэвтэрнэ үү"
          : "Нэг карт — олон дэлгүүрт оноо цуглуулна"}
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        {mode === "register" && (
          <Field
            label="Нэр"
            value={form.name}
            onChange={(v) => setForm({ ...form, name: v })}
            required
          />
        )}
        <Field
          label="Утасны дугаар"
          value={form.phone}
          onChange={(v) => setForm({ ...form, phone: v })}
          placeholder="99112233"
          required
        />
        <Field
          label="Нууц үг"
          type="password"
          value={form.password}
          onChange={(v) => setForm({ ...form, password: v })}
          required
        />
        {mode === "register" && (
          <Field
            label="Урилгын код (заавал биш)"
            value={form.referralCode}
            onChange={(v) => setForm({ ...form, referralCode: v })}
          />
        )}
        {error && (
          <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm font-medium text-rose-600">{error}</p>
        )}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Түр хүлээнэ үү..." : mode === "login" ? "Нэвтрэх" : "Бүртгүүлэх"}
        </Button>
      </form>

      <p className="mt-4 text-center text-sm text-gray-600">
        {mode === "login" ? (
          <>
            Бүртгэл байхгүй юу?{" "}
            <Link href="/register" className="text-abico-blue hover:underline">
              Бүртгүүлэх
            </Link>
            <span className="mx-2">·</span>
            <Link href="/forgot-password" className="text-abico-blue hover:underline">
              Нууц үг мартсан?
            </Link>
          </>
        ) : (
          <>
            Аль хэдийн бүртгэлтэй юу?{" "}
            <Link href="/login" className="text-abico-blue hover:underline">
              Нэвтрэх
            </Link>
          </>
        )}
      </p>
    </Card>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm text-gray-700">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="input-premium"
      />
    </label>
  );
}
