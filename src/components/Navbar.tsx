import Link from "next/link";
import Image from "next/image";
import { Gift, UserCircle } from "lucide-react";
import { LogoutButton } from "@/components/LogoutButton";

export function Navbar({ userName, role, loading }: { userName?: string; role?: string; loading?: boolean }) {
  return (
    <header className="border-b border-gray-200 bg-white shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
        <Link href="/" className="flex items-center">
          <Image src="/abico-logo-dark.png" alt="Abico" width={157} height={44} priority />
        </Link>

        <nav className="flex items-center gap-2 text-sm">
          {loading ? (
            <span className="h-5 w-24 animate-pulse rounded-lg bg-gray-200" />
          ) : userName ? (
            <>
              <span className="hidden text-gray-600 sm:inline">{userName}</span>
              {role === "EMPLOYEE" || role === "STORE_ADMIN" ? (
                <Link href="/employee" className="nav-link">Ажилтан</Link>
              ) : null}
              {(role === "STORE_ADMIN" || role === "PLATFORM_ADMIN") && (
                <Link href="/admin" className="nav-link">Удирдлага</Link>
              )}
              <Link href="/dashboard" className="nav-link">
                <Gift className="mr-1 inline h-4 w-4" />
                Миний оноо
              </Link>
              <Link href="/profile" className="nav-link" title="Профайл">
                <UserCircle className="h-5 w-5" />
              </Link>
              <LogoutButton />
            </>
          ) : (
            <>
              <Link href="/login" className="nav-link">Нэвтрэх</Link>
              <Link href="/register" className="btn-primary">Бүртгүүлэх</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
