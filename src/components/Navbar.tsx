import Link from "next/link";
import Image from "next/image";
import { Gift, Settings, UserCircle, Users } from "lucide-react";
import { LogoutButton } from "@/components/LogoutButton";

export function Navbar({ userName, role, loading }: { userName?: string; role?: string; loading?: boolean }) {
  return (
    <header className="border-b border-gray-200 bg-white shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-4 py-3 sm:px-6">
        <Link href="/" className="flex shrink-0 items-center">
          <Image src="/abico-logo-dark.png" alt="Abico" width={157} height={44} priority className="h-8 w-auto sm:h-11" />
        </Link>

        <nav className="flex flex-nowrap items-center gap-1 overflow-x-auto text-sm sm:gap-2">
          {loading ? (
            <span className="h-5 w-24 animate-pulse rounded-lg bg-gray-200" />
          ) : userName ? (
            <>
              <span className="hidden whitespace-nowrap text-gray-600 sm:inline">{userName}</span>
              {role === "EMPLOYEE" || role === "STORE_ADMIN" ? (
                <Link href="/employee" className="nav-link whitespace-nowrap" title="Ажилтан">
                  <Users className="inline h-4 w-4 sm:mr-1" />
                  <span className="hidden sm:inline">Ажилтан</span>
                </Link>
              ) : null}
              {(role === "STORE_ADMIN" || role === "PLATFORM_ADMIN") && (
                <Link href="/admin" className="nav-link whitespace-nowrap" title="Удирдлага">
                  <Settings className="inline h-4 w-4 sm:mr-1" />
                  <span className="hidden sm:inline">Удирдлага</span>
                </Link>
              )}
              <Link href="/dashboard" className="nav-link whitespace-nowrap" title="Миний оноо">
                <Gift className="inline h-4 w-4 sm:mr-1" />
                <span className="hidden sm:inline">Миний оноо</span>
              </Link>
              <Link href="/profile" className="nav-link shrink-0" title="Профайл">
                <UserCircle className="h-5 w-5" />
              </Link>
              <LogoutButton className="!px-2 !py-2 sm:!px-4 sm:!py-2.5" />
            </>
          ) : (
            <>
              <Link href="/login" className="nav-link whitespace-nowrap">Нэвтрэх</Link>
              <Link href="/register" className="btn-primary whitespace-nowrap">Бүртгүүлэх</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
