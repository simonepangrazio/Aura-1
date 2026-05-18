"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import type { UserInfo } from "@/lib/api";
import { clearAuth, readToken, readUser, routeForRole } from "@/lib/auth";

export function useAuth(requiredRole?: "super_admin" | "tenant_admin") {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      const storedToken = readToken();
      const storedUser = readUser();
      if (!storedToken || !storedUser) {
        clearAuth();
        router.replace("/login");
        return;
      }
      if (requiredRole && storedUser.role !== requiredRole) {
        router.replace(routeForRole(storedUser.role));
        return;
      }
      setToken(storedToken);
      setUser(storedUser);
      setReady(true);
    });
  }, [requiredRole, router]);

  const logout = () => {
    clearAuth();
    router.replace("/login");
  };

  return { token, user, ready, logout };
}
