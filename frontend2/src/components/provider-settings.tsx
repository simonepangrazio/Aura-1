"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CheckCircle2, KeyRound, Trash2 } from "lucide-react";

import {
  ActionButton,
  EmptyState,
  ErrorBanner,
  Field,
  LoadingState,
  StatusBadge,
  inputClass,
} from "@/components/admin-ui";
import {
  type ApiKeyConfig,
  type Tenant,
  deleteApiKey,
  getApiKeys,
  upsertApiKey,
} from "@/lib/api";

const PROVIDERS = [
  { id: "beyond_presence", label: "Beyond Presence", hint: "API key per avviare avatar speech-to-video." },
  { id: "openai", label: "OpenAI", hint: "Usata per TTS backend e futura STT server-side." },
  { id: "gemini", label: "Gemini", hint: "Alternativa TTS backend e futura STT server-side." },
];

const EMPTY_TENANTS: Tenant[] = [];

export function ProviderSettings({
  token,
  tenants = EMPTY_TENANTS,
  tenantId,
  allowTenantSelect = false,
}: {
  token: string;
  tenants?: Tenant[];
  tenantId?: string | null;
  allowTenantSelect?: boolean;
}) {
  const [selectedTenantId, setSelectedTenantId] = useState("");
  const [apiKeys, setApiKeys] = useState<ApiKeyConfig[]>([]);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [savingProvider, setSavingProvider] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const effectiveTenantId = allowTenantSelect
    ? selectedTenantId || tenantId || tenants[0]?.id || ""
    : tenantId || "";

  const apiKeyByProvider = useMemo(
    () => new Map(apiKeys.map((apiKey) => [apiKey.provider, apiKey])),
    [apiKeys],
  );

  const load = useCallback(async () => {
    if (allowTenantSelect && !effectiveTenantId) {
      setApiKeys([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      setApiKeys(await getApiKeys(token, allowTenantSelect ? effectiveTenantId : tenantId));
      setDrafts({});
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore configurazione provider");
    } finally {
      setLoading(false);
    }
  }, [allowTenantSelect, effectiveTenantId, tenantId, token]);

  useEffect(() => {
    queueMicrotask(() => void load());
  }, [load]);

  const saveProvider = async (provider: string) => {
    const apiKey = drafts[provider]?.trim();
    if (!apiKey) return;
    setSavingProvider(provider);
    setError(null);
    try {
      await upsertApiKey(token, provider, {
        tenant_id: allowTenantSelect ? effectiveTenantId : tenantId,
        api_key: apiKey,
        settings: {},
      });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Salvataggio provider non riuscito");
    } finally {
      setSavingProvider(null);
    }
  };

  const removeProvider = async (provider: string) => {
    setSavingProvider(provider);
    setError(null);
    try {
      await deleteApiKey(token, provider, allowTenantSelect ? effectiveTenantId : tenantId);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Eliminazione provider non riuscita");
    } finally {
      setSavingProvider(null);
    }
  };

  if (allowTenantSelect && tenants.length === 0) {
    return <EmptyState text="Nessun tenant disponibile per configurare provider." />;
  }

  return (
    <div className="space-y-4">
      {allowTenantSelect ? (
        <Field label="Tenant">
          <select className={inputClass} value={effectiveTenantId} onChange={(event) => setSelectedTenantId(event.target.value)}>
            {tenants.map((tenant) => (
              <option key={tenant.id} value={tenant.id}>{tenant.name}</option>
            ))}
          </select>
        </Field>
      ) : null}
      {error ? <ErrorBanner message={error} /> : null}
      {loading ? <LoadingState /> : (
        <div className="grid gap-4">
          {PROVIDERS.map((provider) => {
            const existing = apiKeyByProvider.get(provider.id);
            const configured = Boolean(existing?.is_configured);
            return (
              <div key={provider.id} className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <KeyRound size={16} className="text-zinc-500" />
                      <h2 className="text-sm font-medium text-zinc-100">{provider.label}</h2>
                      <StatusBadge status={configured ? "configured" : "missing"} />
                    </div>
                    <p className="mt-1 text-sm text-zinc-500">{provider.hint}</p>
                    <p className="mt-2 font-mono text-xs text-zinc-400">{existing?.key_preview || "Nessuna chiave salvata"}</p>
                  </div>
                  {configured ? (
                    <ActionButton
                      type="button"
                      variant="ghost"
                      disabled={savingProvider === provider.id}
                      onClick={() => void removeProvider(provider.id)}
                    >
                      <Trash2 size={14} />Rimuovi
                    </ActionButton>
                  ) : null}
                </div>
                <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                  <input
                    className={inputClass}
                    type="password"
                    value={drafts[provider.id] || ""}
                    placeholder={configured ? "Inserisci una nuova chiave per sostituirla" : "Inserisci API key"}
                    onChange={(event) => setDrafts({ ...drafts, [provider.id]: event.target.value })}
                  />
                  <ActionButton
                    type="button"
                    disabled={!drafts[provider.id]?.trim() || savingProvider === provider.id}
                    onClick={() => void saveProvider(provider.id)}
                  >
                    <CheckCircle2 size={14} />Salva
                  </ActionButton>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
