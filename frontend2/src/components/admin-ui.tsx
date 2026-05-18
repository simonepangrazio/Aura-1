"use client";

import type { ReactNode } from "react";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

export function formatDate(value?: string | null) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("it-IT", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function shortId(value?: string | null) {
  if (!value) return "-";
  return `${value.slice(0, 8)}...${value.slice(-4)}`;
}

export function statusTone(status: string) {
  switch (status) {
    case "active":
    case "online":
    case "configured":
    case "ok":
      return "border-emerald-400/25 bg-emerald-400/10 text-emerald-200";
    case "busy":
    case "starting":
      return "border-cyan-400/25 bg-cyan-400/10 text-cyan-200";
    case "suspended":
    case "disabled":
    case "offline":
    case "missing":
      return "border-zinc-500/30 bg-zinc-500/10 text-zinc-300";
    case "error":
      return "border-red-400/25 bg-red-400/10 text-red-200";
    default:
      return "border-zinc-600 bg-zinc-900 text-zinc-300";
  }
}

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={cn("inline-flex h-6 items-center rounded-md border px-2 text-xs", statusTone(status))}>
      {status}
    </span>
  );
}

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 border-b border-zinc-800 pb-5 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-normal text-zinc-50">{title}</h1>
        <p className="mt-1 max-w-2xl text-sm text-zinc-400">{description}</p>
      </div>
      {action}
    </div>
  );
}

export function MetricCard({
  label,
  value,
  hint,
  icon,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon?: ReactNode;
}) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
      <div className="mb-3 flex items-center justify-between text-zinc-500">
        <p className="text-xs font-medium uppercase tracking-normal">{label}</p>
        {icon}
      </div>
      <p className="text-3xl font-semibold text-zinc-50">{value}</p>
      {hint ? <p className="mt-2 text-xs text-zinc-500">{hint}</p> : null}
    </div>
  );
}

export function DataTable({
  headers,
  rows,
  empty,
}: {
  headers: string[];
  rows: ReactNode[][];
  empty: string;
}) {
  if (rows.length === 0) {
    return <EmptyState text={empty} />;
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-zinc-800 bg-zinc-950">
      <table className="w-full min-w-[880px] border-collapse text-left">
        <thead>
          <tr className="border-b border-zinc-800 bg-zinc-900/70">
            {headers.map((header) => (
              <th key={header} className="px-4 py-3 text-xs font-medium uppercase tracking-normal text-zinc-400">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex} className="border-b border-zinc-900 last:border-0">
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className="px-4 py-3 align-middle text-sm text-zinc-300">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-lg border border-dashed border-zinc-800 bg-zinc-950 p-8 text-center text-sm text-zinc-500">
      {text}
    </div>
  );
}

export function LoadingState() {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-8 text-center text-sm text-zinc-500">
      Caricamento dati...
    </div>
  );
}

export function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="mb-5 rounded-lg border border-red-400/25 bg-red-400/10 p-3 text-sm text-red-100">
      {message}
    </div>
  );
}

export function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg border border-zinc-800 bg-zinc-950 p-5 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-zinc-50">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex size-8 items-center justify-center rounded-md text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100"
            aria-label="Chiudi"
          >
            <X size={16} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium uppercase tracking-normal text-zinc-500">{label}</span>
      {children}
    </label>
  );
}

export const inputClass =
  "h-9 w-full rounded-md border border-zinc-800 bg-black px-3 text-sm text-zinc-100 outline-none transition focus:border-cyan-500 disabled:cursor-not-allowed disabled:opacity-60";

export const textareaClass =
  "min-h-24 w-full rounded-md border border-zinc-800 bg-black px-3 py-2 text-sm text-zinc-100 outline-none transition focus:border-cyan-500 disabled:cursor-not-allowed disabled:opacity-60";

export function ActionButton({
  children,
  variant = "primary",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger" | "ghost";
}) {
  return (
    <button
      className={cn(
        "inline-flex h-8 items-center justify-center gap-2 rounded-md px-3 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60",
        variant === "primary" && "bg-zinc-50 text-zinc-950 hover:bg-cyan-100",
        variant === "secondary" && "border border-zinc-800 bg-zinc-900 text-zinc-100 hover:bg-zinc-800",
        variant === "danger" && "border border-red-400/25 bg-red-400/10 text-red-200 hover:bg-red-400/20",
        variant === "ghost" && "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100",
      )}
      {...props}
    >
      {children}
    </button>
  );
}
