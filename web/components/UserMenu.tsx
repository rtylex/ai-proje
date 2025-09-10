"use client";

import { useEffect, useState } from "react";
import { getFirebaseAuth } from "../lib/firebase";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";

export function UserMenu() {
  const auth = getFirebaseAuth();
  const [user, setUser] = useState<User | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, [auth]);

  if (user) {
    const name = user.displayName || user.email || user.uid;
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-700 dark:text-slate-200 truncate max-w-[14rem]" title={name || undefined}>
          {name}
        </span>
        <button
          className="rounded-md border border-gray-200 dark:border-slate-700 px-3 py-1.5 text-sm text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-800"
          onClick={async () => {
            setBusy(true);
            try { await signOut(auth); } finally { setBusy(false); }
          }}
          disabled={busy}
        >
          Çıkış Yap
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <a href="/auth/signin" className="rounded-md border border-gray-200 dark:border-slate-700 px-3 py-1.5 text-sm text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-800">Giriş Yap</a>
      <a href="/auth/signup" className="inline-flex items-center justify-center h-9 px-3 rounded-md bg-brand-600 text-white hover:bg-brand-700">Kayıt Ol</a>
    </div>
  );
}

