import Link from "next/link";
import { Gift } from "lucide-react";
import { LogoutButton } from "@/components/LogoutButton";

export function Navbar({ userName, role }: { userName?: string; role?: string }) {
  return (
    <header className="border-b border-white/10 bg-abico-navy/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="flex items-center gap-2 text-white">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-abico-gold text-sm font-bold text-abico-navy">
            A
          </span>
          <div>
            <p className="text-sm font-semibold tracking-wide">ABICO</p>
            <p className="text-xs text-blue-100/70">Гишүүнчлэлийн бонус</p>
          </div>
        </Link>

        <nav className="flex items-center gap-3 text-sm">
          {userName ? (
            <>
              <span className="hidden text-blue-100/80 sm:inline">{userName}</span>
              {role === "EMPLOYEE" || role === "STORE_ADMIN" ? (
                <Link href="/employee" className="nav-link">
                  Ажилтан
                </Link>
              ) : null}
              {(role === "STORE_ADMIN" || role === "PLATFORM_ADMIN") && (
                <Link href="/admin" className="nav-link">
                  Удирдлага
                </Link>
              )}
              <Link href="/dashboard" className="nav-link">
                <Gift className="mr-1 inline h-4 w-4" />
                Миний оноо
              </Link>
              <LogoutButton />
            </>
          ) : (
            <>
              <Link href="/login" className="nav-link">
                Нэвтрэх
              </Link>
              <Link href="/register" className="btn-primary">
                Бүртгүүлэх
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
