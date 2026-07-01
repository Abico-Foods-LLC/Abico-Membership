import { redirect } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { ForgotPasswordForm } from "@/components/ForgotPasswordForm";
import { getSession } from "@/lib/auth";

export default async function ForgotPasswordPage() {
  const session = await getSession();
  if (session) redirect("/dashboard");

  return (
    <div className="relative min-h-screen overflow-hidden bg-gray-50">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-40 -z-10 h-[560px]"
        style={{ background: "radial-gradient(60% 60% at 50% 0%, rgba(21,114,190,0.08) 0%, rgba(21,114,190,0) 70%)" }}
      />
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-16">
        <ForgotPasswordForm />
      </main>
    </div>
  );
}
