"use client";

import { ReactNode, useEffect, useState } from "react";
import { getFirebaseAuth } from "../lib/firebase";
import { onAuthStateChanged, type User } from "firebase/auth";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "./ui/Button";

export function AuthGuard({ children, redirect = true }: { children: ReactNode; redirect?: boolean }) {
  const auth = getFirebaseAuth();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsub();
  }, [auth]);

  useEffect(() => {
    if (!loading && !user && redirect) {
      const next = encodeURIComponent(pathname || "/");
      router.replace(`/auth/signin?next=${next}`);
    }
  }, [loading, user, redirect, router, pathname]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-sm text-gray-600 dark:text-slate-300">
        Yükleniyor...
      </div>
    );
  }

  if (!user) {
    const next = encodeURIComponent(pathname || "/");
    return (
      <div className="max-w-md mx-auto text-center py-20">
        <p className="text-gray-700 dark:text-slate-200 mb-4">Bu sayfaya erişmek için giriş yapmalısın.</p>
        <div className="flex items-center justify-center gap-2">
          <a href={`/auth/signin?next=${next}`} className="rounded-md border border-gray-200 dark:border-slate-700 px-4 py-2 text-sm text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-800">Giriş Yap</a>
          <a href={`/auth/signup?next=${next}`} className="inline-flex items-center justify-center h-10 px-4 rounded-md bg-brand-600 text-white hover:bg-brand-700">Kayıt Ol</a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
