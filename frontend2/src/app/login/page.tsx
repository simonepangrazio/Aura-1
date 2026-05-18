"use client";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, LogIn } from "lucide-react";

import { login } from "@/lib/api";
import { readToken, readUser, routeForRole, saveAuth } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@platform.local");
  const [password, setPassword] = useState("Admin123!");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const user = readUser();
    const token = readToken();
    if (user && token) {
      saveAuth({ access_token: token, token_type: "bearer", user });
      router.replace(routeForRole(user.role));
    }
  }, [router]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const auth = await login(email, password);
      saveAuth(auth);
      router.replace(routeForRole(auth.user.role));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login non riuscito");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-black p-4 text-zinc-100">
      <section className="w-full max-w-md rounded-lg border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
        <div className="mb-6">
          <p className="text-sm font-medium text-cyan-300">Beyond Platform</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-normal">Accedi alla console</h1>
          <p className="mt-2 text-sm text-zinc-500">Login unico per admin globale e dashboard tenant.</p>
        </div>

        {error ? (
          <div className="mb-4 flex gap-2 rounded-md border border-red-400/25 bg-red-400/10 p-3 text-sm text-red-100">
            <AlertCircle size={16} />
            {error}
          </div>
        ) : null}

        <form onSubmit={submit} className="space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium uppercase tracking-normal text-zinc-500">Email</span>
            <input
              className="h-10 w-full rounded-md border border-zinc-800 bg-black px-3 text-sm text-zinc-100 outline-none transition focus:border-cyan-500"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium uppercase tracking-normal text-zinc-500">Password</span>
            <input
              className="h-10 w-full rounded-md border border-zinc-800 bg-black px-3 text-sm text-zinc-100 outline-none transition focus:border-cyan-500"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-zinc-50 px-3 text-sm font-medium text-zinc-950 transition hover:bg-cyan-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <LogIn size={16} />
            {loading ? "Accesso..." : "Accedi"}
          </button>
        </form>

        <div className="mt-5 rounded-md border border-zinc-900 bg-black p-3 text-xs text-zinc-500">
          Default super admin: admin@platform.local / Admin123!
        </div>
      </section>
    </main>
  );
}
