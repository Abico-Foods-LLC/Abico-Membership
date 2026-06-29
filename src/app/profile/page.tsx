"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, KeyRound, User } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";

type Me = { name: string; phone: string; email: string | null; role: string };

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
  const [loading, setLoading] = useState(false);

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
    setLoading(true);
    setNameErr("");
    setNameMsg("");
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setNameErr(data.error ?? "Алдаа"); return; }
    setNameMsg("Амжилттай хадгалагдлаа");
    setMe((m) => m && { ...m, name: data.name, email: data.email });
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setPwdErr("");
    setPwdMsg("");
    const res = await fetch("/api/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ current: curPwd, next: newPwd }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setPwdErr(data.error ?? "Алдаа"); return; }
    setPwdMsg("Нууц үг амжилттай солигдлоо");
    setCurPwd("");
    setNewPwd("");
  }

  if (!me) return (
    <div className="min-h-screen"><Navbar />
      <p className="mx-auto mt-20 text-center text-blue-100/60">Ачааллаж байна...</p>
    </div>
  );

  return (
    <div className="min-h-screen">
      <Navbar userName={me.name} role={me.role} />
      <main className="mx-auto max-w-lg px-4 py-10">
        <div className="mb-8">
          <p className="text-sm uppercase tracking-wider text-abico-gold">Гишүүн</p>
          <h1 className="text-3xl font-bold">Профайл</h1>
        </div>

        {/* Account info */}
        <Card>
          <div className="mb-4 flex items-center gap-2">
            <User className="h-5 w-5 text-abico-gold" />
            <h2 className="font-semibold">Хувийн мэдээлэл</h2>
          </div>

          <p className="mb-4 rounded-xl bg-white/5 px-4 py-3 font-mono text-sm text-blue-100/70">
            📱 {me.phone}
          </p>

          <form onSubmit={saveName} className="space-y-4">
            <label className="block">
              <span className="mb-1 block text-sm text-blue-100/70">Нэр</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                minLength={2}
                className="w-full rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 outline-none focus:ring-2 focus:ring-abico-gold"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm text-blue-100/70">Имэйл (заавал биш)</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@mail.com"
                className="w-full rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 outline-none focus:ring-2 focus:ring-abico-gold"
              />
            </label>
            {nameErr && <p className="text-sm text-red-300">{nameErr}</p>}
            {nameMsg && (
              <p className="flex items-center gap-2 text-sm text-emerald-300">
                <CheckCircle2 className="h-4 w-4" /> {nameMsg}
              </p>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              Хадгалах
            </Button>
          </form>
        </Card>

        {/* Password change */}
        <Card className="mt-6">
          <div className="mb-4 flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-abico-gold" />
            <h2 className="font-semibold">Нууц үг солих</h2>
          </div>
          <form onSubmit={changePassword} className="space-y-4">
            <label className="block">
              <span className="mb-1 block text-sm text-blue-100/70">Одоогийн нууц үг</span>
              <input
                type="password"
                value={curPwd}
                onChange={(e) => setCurPwd(e.target.value)}
                required
                className="w-full rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 outline-none focus:ring-2 focus:ring-abico-gold"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm text-blue-100/70">Шинэ нууц үг</span>
              <input
                type="password"
                value={newPwd}
                onChange={(e) => setNewPwd(e.target.value)}
                required
                minLength={6}
                className="w-full rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 outline-none focus:ring-2 focus:ring-abico-gold"
              />
            </label>
            {pwdErr && <p className="text-sm text-red-300">{pwdErr}</p>}
            {pwdMsg && (
              <p className="flex items-center gap-2 text-sm text-emerald-300">
                <CheckCircle2 className="h-4 w-4" /> {pwdMsg}
              </p>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              Нууц үг солих
            </Button>
          </form>
        </Card>
      </main>
    </div>
  );
}
