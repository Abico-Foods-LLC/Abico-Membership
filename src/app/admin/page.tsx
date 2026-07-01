"use client";

import { useCallback, useEffect, useState } from "react";
import { BarChart3, Plus, Store, Users, Wallet, X } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { formatPoints } from "@/lib/loyalty";

type StoreItem = { id: string; name: string; slug: string; address: string | null };
type EmployeeItem = { id: string; name: string; role: string; store: { name: string } | null };
type AdminData = {
  me: { name: string; role: string };
  stats: {
    totalMembers: number;
    activePoints: number;
    monthlyEarned: number;
    storeCount: number;
    employeeCount: number;
  };
  stores: StoreItem[];
  employees: EmployeeItem[];
  recentTransactions: Array<{
    id: string;
    points: number;
    type: string;
    createdAt: string;
    user: { name: string };
    store: { name: string } | null;
  }>;
};

export default function AdminPage() {
  const [data, setData] = useState<AdminData | null>(null);
  const [error, setError] = useState("");

  const fetchData = useCallback(() => {
    setError("");
    fetch("/api/admin")
      .then(async (res) => {
        if (!res.ok) throw new Error("Ачаалах амжилтгүй");
        return res.json();
      })
      .then(setData)
      .catch(() => setError("Тайлан ачаалахад алдаа гарлаа"));
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  return (
    <div className="min-h-screen">
      <Navbar userName={data?.me.name} role={data?.me.role} loading={!data && !error} />
      <main className="mx-auto max-w-6xl px-4 py-10">
        <div className="mb-8">
          <p className="text-sm uppercase tracking-wider text-abico-gold">Удирдлага</p>
          <h1 className="text-3xl font-bold">Хяналтын самбар</h1>
        </div>

        {error && <p className="text-red-300">{error}</p>}
        {!data && !error && <p className="text-gray-600">Ачааллаж байна...</p>}

        {data && (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard icon={<Users className="h-5 w-5" />} label="Нийт гишүүд" value={formatPoints(data.stats.totalMembers)} />
              <StatCard icon={<Wallet className="h-5 w-5" />} label="Идэвхтэй оноо" value={formatPoints(data.stats.activePoints)} />
              <StatCard icon={<BarChart3 className="h-5 w-5" />} label="Сарын оноо олголт" value={formatPoints(data.stats.monthlyEarned)} />
              <StatCard icon={<Store className="h-5 w-5" />} label="Дэлгүүр / Ажилтан" value={`${data.stats.storeCount} / ${data.stats.employeeCount}`} />
            </div>

            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              <StoresSection stores={data.stores} onRefresh={fetchData} />
              <Card>
                <h2 className="mb-3 text-lg font-semibold">Сүүлийн гүйлгээ</h2>
                <div className="space-y-2">
                  {data.recentTransactions.map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between rounded-xl border border-gray-200 px-3 py-2">
                      <div>
                        <p className="font-medium">{tx.user.name}</p>
                        <p className="text-xs text-gray-500">
                          {tx.store?.name ?? "—"} · {new Date(tx.createdAt).toLocaleString("mn-MN")}
                        </p>
                      </div>
                      <p className="font-bold text-emerald-300">+{formatPoints(tx.points)}</p>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            <div className="mt-4">
              <EmployeesSection stores={data.stores} employees={data.employees} onRefresh={fetchData} />
            </div>

            <div className="mt-4">
              <MembersSection />
            </div>
          </>
        )}
      </main>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <Card>
      <div className="flex items-center gap-2 text-abico-blue">{icon}</div>
      <p className="stat-label mt-3">{label}</p>
      <p className="stat-value mt-1">{value}</p>
    </Card>
  );
}

function StoresSection({ stores, onRefresh }: { stores: StoreItem[]; onRefresh: () => void }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", address: "", phone: "" });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErr("");
    const res = await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, slug: form.name }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setErr(data.error ?? "Алдаа"); return; }
    setOpen(false);
    setForm({ name: "", address: "", phone: "" });
    onRefresh();
  }

  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Партнер дэлгүүрүүд</h2>
        <button type="button" onClick={() => setOpen(!open)} className="flex items-center gap-1 text-sm text-abico-blue hover:text-abico-dark">
          {open ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {open ? "Болих" : "Нэмэх"}
        </button>
      </div>

      {open && (
        <form onSubmit={submit} className="mb-4 space-y-3 rounded-xl border border-gray-200 p-4">
          <Input label="Нэр" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
          <Input label="Хаяг" value={form.address} onChange={(v) => setForm({ ...form, address: v })} />
          <Input label="Утас" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
          {err && <p className="text-sm text-red-300">{err}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Нэмж байна..." : "Дэлгүүр нэмэх"}
          </Button>
        </form>
      )}

      <div className="space-y-3">
        {stores.map((store) => (
          <div key={store.id} className="rounded-xl border border-gray-200 px-4 py-3">
            <p className="font-medium">{store.name}</p>
            <p className="text-sm text-gray-500">{store.address ?? store.slug}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}

function EmployeesSection({
  stores,
  employees,
  onRefresh,
}: {
  stores: StoreItem[];
  employees: EmployeeItem[];
  onRefresh: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", password: "", role: "EMPLOYEE", storeId: "" });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErr("");
    const res = await fetch("/api/admin/employees", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, storeId: form.storeId }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setErr(data.error ?? "Алдаа"); return; }
    setOpen(false);
    setForm({ name: "", phone: "", password: "", role: "EMPLOYEE", storeId: "" });
    onRefresh();
  }

  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Ажилтнууд</h2>
        <button type="button" onClick={() => setOpen(!open)} className="flex items-center gap-1 text-sm text-abico-blue hover:text-abico-dark">
          {open ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {open ? "Болих" : "Нэмэх"}
        </button>
      </div>

      {open && (
        <form onSubmit={submit} className="mb-4 space-y-3 rounded-xl border border-gray-200 p-4">
          <Input label="Нэр" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
          <Input label="Утасны дугаар" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} required />
          <Input label="Нууц үг" type="password" value={form.password} onChange={(v) => setForm({ ...form, password: v })} required />
          <div>
            <label className="mb-1 block text-sm text-gray-700">Дэлгүүр</label>
            <select
              required
              value={form.storeId}
              onChange={(e) => setForm({ ...form, storeId: e.target.value })}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-gray-900 outline-none focus:ring-2 focus:ring-abico-blue"
            >
              <option value="">— Сонгох —</option>
              {stores.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm text-gray-700">Эрх</label>
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-gray-900 outline-none focus:ring-2 focus:ring-abico-blue"
            >
              <option value="EMPLOYEE">Ажилтан (Кассчин)</option>
              <option value="STORE_ADMIN">Дэлгүүрийн Админ</option>
            </select>
          </div>
          {err && <p className="text-sm text-red-300">{err}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Нэмж байна..." : "Ажилтан нэмэх"}
          </Button>
        </form>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {employees.map((emp) => (
          <div key={emp.id} className="rounded-xl border border-gray-200 px-4 py-3">
            <p className="font-medium">{emp.name}</p>
            <p className="text-sm text-gray-500">{emp.store?.name ?? "—"} · {emp.role === "EMPLOYEE" ? "Кассчин" : "Дэлгүүр Админ"}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}

type MemberItem = {
  id: string;
  name: string;
  phone: string;
  qrCode: string;
  points: number;
  tier: string;
  createdAt: string;
};

function MembersSection() {
  const [members, setMembers] = useState<MemberItem[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchMembers = useCallback(
    async (q: string) => {
      setLoading(true);
      const res = await fetch(`/api/admin/members?search=${encodeURIComponent(q)}`);
      const data = await res.json();
      setLoading(false);
      if (res.ok) setMembers(data);
    },
    [],
  );

  useEffect(() => { fetchMembers(""); }, [fetchMembers]);

  useEffect(() => {
    const t = setTimeout(() => fetchMembers(search), 300);
    return () => clearTimeout(t);
  }, [search, fetchMembers]);

  return (
    <Card>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-abico-gold" />
          <h2 className="text-lg font-semibold">Гишүүд</h2>
          {!loading && <span className="text-sm text-gray-400">({members.length})</span>}
        </div>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Нэр эсвэл утасны дугаараар хайх..."
          className="w-64 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-abico-blue"
        />
      </div>

      {loading && <p className="text-sm text-gray-500">Ачааллаж байна...</p>}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-left text-xs uppercase tracking-wider text-gray-400">
              <th className="pb-3 pr-4">Нэр</th>
              <th className="pb-3 pr-4">Утас</th>
              <th className="pb-3 pr-4">Оноо</th>
              <th className="pb-3 pr-4">Тиер</th>
              <th className="pb-3">Бүртгэл</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {members.map((m) => (
              <tr key={m.id}>
                <td className="py-3 pr-4 font-medium">{m.name}</td>
                <td className="py-3 pr-4 font-mono text-gray-600">{m.phone}</td>
                <td className="py-3 pr-4 font-bold text-abico-gold">{formatPoints(m.points)}</td>
                <td className="py-3 pr-4">
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs">{m.tier}</span>
                </td>
                <td className="py-3 text-gray-400">{new Date(m.createdAt).toLocaleDateString("mn-MN")}</td>
              </tr>
            ))}
            {!loading && members.length === 0 && (
              <tr><td colSpan={5} className="py-6 text-center text-gray-300">Гишүүн олдсонгүй</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function Input({
  label,
  value,
  onChange,
  required,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm text-gray-700">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-gray-900 outline-none focus:ring-2 focus:ring-abico-blue"
      />
    </label>
  );
}
