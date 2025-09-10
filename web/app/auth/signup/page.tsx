"use client";

import { FormEvent, useState } from "react";
import { getFirebaseAuth, getFirestoreDb, verifyAuthEmulator } from "../../../lib/firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { useRouter, useSearchParams } from "next/navigation";

export default function SignUpPage() {
  const auth = getFirebaseAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
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
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
      if (name.trim()) {
        await updateProfile(cred.user, { displayName: name.trim() });
      }
      
      // Create user document in Firestore
      const db = getFirestoreDb();
      const userRef = doc(db, "users", cred.user.uid);
      await setDoc(userRef, {
        userId: cred.user.uid,
        email: email.trim(),
        name: name.trim() || "",
        createdAt: Date.now(),
        lastLogin: Date.now()
      });
      
      setOk("Kayıt başarılı. Oturum açıldı.");
      const next = searchParams?.get('next') || '/editor';
      router.replace(next);
    } catch (err: any) {
      setError(err?.message || "Kayıt başarısız");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <Card header={<span>Hesap Oluştur</span>}>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Ad</label>
            <input
              type="text"
              className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-950"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
            />
          </div>
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
              autoComplete="new-password"
            />
          </div>
          {emuError && <div className="text-sm text-amber-600 dark:text-amber-400">{emuError}</div>}
          {error && <div className="text-sm text-red-600 dark:text-red-400">{error}</div>}
          {ok && <div className="text-sm text-green-600 dark:text-green-300">{ok}</div>}
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Oluşturuluyor..." : "Kayıt Ol"}
          </Button>
        </form>
        <div className="mt-4 text-sm">
          Zaten hesabın var mı? <a className="text-brand-600 hover:underline" href="/auth/signin">Giriş Yap</a>
        </div>
      </Card>
    </div>
  );
}
