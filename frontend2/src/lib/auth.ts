"use client";

import type { AuthResponse, UserInfo } from "@/lib/api";

export const TOKEN_KEY = "dashboard_token";
export const USER_KEY = "dashboard_user";
export const ROLE_COOKIE = "dashboard_role";

export function readToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function readUser() {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as UserInfo;
  } catch {
    return null;
  }
}

export function routeForRole(role?: string | null) {
  return role === "super_admin" ? "/dashboard" : "/tenant/dashboard";
}

export function saveAuth(auth: AuthResponse) {
  window.localStorage.setItem(TOKEN_KEY, auth.access_token);
  window.localStorage.setItem(USER_KEY, JSON.stringify(auth.user));
  document.cookie = `${ROLE_COOKIE}=${encodeURIComponent(auth.user.role)}; path=/; max-age=28800; SameSite=Lax`;
}

export function clearAuth() {
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(USER_KEY);
  document.cookie = `${ROLE_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
}
