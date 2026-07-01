"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, KeyRound, Phone, User } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";

type Me = { name: string; phone: string; email: string | null; role: string };

const ROLE_LABEL: Record<string, string> = {
  MEMBER: "Гишүүн",
  EMPLOYEE: "Ажилтан",
  STORE_ADMIN: "Дэлгүүрийн админ",
  PLATFORM_ADMIN: "Удирдлага",
};

export default function ProfilePage() {
  const [me, setMe] = useState<Me | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [nameMsg, setNameMsg] = useState("");
  const [nameErr, setNameErr] = useState("");

  const [curPwd, setCurPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [pwdMsg, setPwdMsg] = useState("");
  const [pwdErr, setPwdErr] = useState("");
  const [saving, setSaving] = useState(false);
  const [changingPwd, setChangingPwd] = useState(false);

  useEffect(() => {
    fetch("/api/me")
      .then(async (r) => { if (!r.ok) throw new Error(String(r.status)); return r.json(); })
      .then((d) => {
        setMe({ name: d.user.name, phone: d.user.phone, email: d.user.email, role: d.user.role });
        setName(d.user.name);
        setEmail(d.user.email ?? "");
      })
      .catch((e) => {
        if (e.message === "401") window.location.href = "/login";
        else setNameErr("Мэдээлэл ачаалахад алдаа гарлаа");
      });
  }, []);

  async function saveName(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setNameErr("");
    setNameMsg("");
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) { setNameErr(data.error ?? "Алдаа"); return; }
    setNameMsg("Амжилттай хадгалагдлаа");
    setMe((m) => m && { ...m, name: data.name, email: data.email });
    setEmail(data.email ?? "");
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    setChangingPwd(true);
    setPwdErr("");
    setPwdMsg("");
    const res = await fetch("/api/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ current: curPwd, next: newPwd }),
    });
    const data = await res.json();
    setChangingPwd(false);
    if (!res.ok) { setPwdErr(data.error ?? "Алдаа"); return; }
    setPwdMsg("Нууц үг амжилттай солигдлоо");
    setCurPwd("");
    setNewPwd("");
  }

  if (!me) return (
    <div className="min-h-screen"><Navbar loading />
      <p className="mx-auto mt-20 text-center text-gray-500">Ачааллаж байна...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar userName={me.name} role={me.role} />
      <main className="mx-auto max-w-5xl px-4 py-10">
        <div className="mb-6 animate-fade-up">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-abico-blue">{ROLE_LABEL[me.role] ?? "Гишүүн"}</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-gray-900">Профайл</h1>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Account info */}
          <Card className="animate-fade-up">
            <div className="mb-4 flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-abico-blue/10 text-abico-blue">
                <User className="h-4.5 w-4.5" />
              </span>
              <h2 className="font-semibold text-gray-900">Хувийн мэдээлэл</h2>
            </div>

            <p className="mb-4 flex items-center gap-2 rounded-xl bg-gray-50 px-4 py-3 font-mono text-sm text-gray-600">
              <Phone className="h-4 w-4 text-gray-400" /> {me.phone}
            </p>

            <form onSubmit={saveName} className="space-y-4">
              <label className="block">
                <span className="mb-1 block text-sm text-gray-600">Нэр</span>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  minLength={2}
                  className="input-premium"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-sm text-gray-600">Имэйл (заавал биш)</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@mail.com"
                  className="input-premium"
                />
              </label>
              {nameErr && (
                <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm font-medium text-rose-600">{nameErr}</p>
              )}
              {nameMsg && (
                <p className="flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-600">
                  <CheckCircle2 className="h-4 w-4" /> {nameMsg}
                </p>
              )}
              <Button type="submit" className="w-full" disabled={saving}>
                {saving ? "Хадгалж байна..." : "Хадгалах"}
              </Button>
            </form>
          </Card>

          {/* Password change */}
          <Card className="animate-fade-up [animation-delay:80ms]">
            <div className="mb-4 flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-abico-blue/10 text-abico-blue">
                <KeyRound className="h-4.5 w-4.5" />
              </span>
              <h2 className="font-semibold text-gray-900">Нууц үг солих</h2>
            </div>
            <form onSubmit={changePassword} className="space-y-4">
              <label className="block">
                <span className="mb-1 block text-sm text-gray-600">Одоогийн нууц үг</span>
                <input
                  type="password"
                  value={curPwd}
                  onChange={(e) => setCurPwd(e.target.value)}
                  required
                  className="input-premium"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-sm text-gray-600">Шинэ нууц үг</span>
                <input
                  type="password"
                  value={newPwd}
                  onChange={(e) => setNewPwd(e.target.value)}
                  required
                  minLength={6}
                  className="input-premium"
                />
              </label>
              {pwdErr && (
                <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm font-medium text-rose-600">{pwdErr}</p>
              )}
              {pwdMsg && (
                <p className="flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-600">
                  <CheckCircle2 className="h-4 w-4" /> {pwdMsg}
                </p>
              )}
              <Button type="submit" className="w-full" disabled={changingPwd}>
                {changingPwd ? "Солиж байна..." : "Нууц үг солих"}
              </Button>
            </form>
          </Card>
        </div>
      </main>
    </div>
  );
}
