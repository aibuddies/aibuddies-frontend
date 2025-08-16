"use client";
import Link from "next/link";
import Cookies from "js-cookie";
import { useAuth } from "./Providers";

export function Navbar() {
  const { user, refreshUser } = useAuth();

  const logout = async () => {
    Cookies.remove("aib_token");
    await refreshUser();
    window.location.href = "/";
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/40 backdrop-blur">
      <nav className="container flex items-center justify-between h-14">
        <Link href="/" className="font-bold">AIBuddies</Link>
        <div className="flex items-center gap-3 text-sm">
          <Link href="/tools/repurpose" className="hidden sm:inline">Tools</Link>
          <Link href="/pricing" className="hidden sm:inline">Pricing</Link>
          {user ? (
            <>
              <Link href="/dashboard" className="btn btn-outline">Credits: {user.credits ?? 0}</Link>
              <button onClick={logout} className="btn btn-primary">Logout</button>
            </>
          ) : (
            <>
              <Link href="/login" className="btn btn-outline">Login</Link>
              <Link href="/signup" className="btn btn-primary">Sign up</Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
