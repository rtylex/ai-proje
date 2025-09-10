"use client";

import { FormEvent, useState } from "react";
import { getFirebaseAuth, getFirestoreDb, verifyAuthEmulator } from "../../../lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { useRouter, useSearchParams } from "next/navigation";

export default function SignInPage() {
  const auth = getFirebaseAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [emuError, setEmuError] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setOk(null);
    setEmuError(null);
    setLoading(true);
    try {
      const useEmu =
        process.env.NEXT_PUBLIC_USE_EMULATORS === "1" ||
        process.env.NEXT_PUBLIC_USE_EMULATORS === "true";
      if (useEmu) {
        const reachable = await verifyAuthEmulator();
        if (!reachable) {
          setEmuError("Auth emülatörüne bağlanılamadı (9099). Lütfen emülatörleri başlatın veya firewall/VPN’i kapatıp tekrar deneyin.");
          return;
        }
      }
      const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
      
      // Update lastLogin in user document
      const db = getFirestoreDb();
      const userRef = doc(db, "users", cred.user.uid);
      await updateDoc(userRef, {
        lastLogin: Date.now()
      });
      
      const next = searchParams?.get('next') || '/editor';
      setOk("Giriş başarılı");
      router.replace(next);
    } catch (err: any) {
      setError(err?.message || "Giriş başarısız");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <Card header={<span>Giriş Yap</span>}>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1">E-posta</label>
            <input
              type="email"
              className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-950"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Şifre</label>
            <input
              type="password"
              className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-950"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete="current-password"
            />
          </div>
          {emuError && <div className="text-sm text-amber-600 dark:text-amber-400">{emuError}</div>}
          {error && <div className="text-sm text-red-600 dark:text-red-400">{error}</div>}
          {ok && <div className="text-sm text-green-600 dark:text-green-300">{ok}</div>}
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
          </Button>
        </form>
        <div className="mt-4 text-sm">
          Hesabın yok mu? <a className="text-brand-600 hover:underline" href="/auth/signup">Kayıt Ol</a>
        </div>
      </Card>
    </div>
  );
}
