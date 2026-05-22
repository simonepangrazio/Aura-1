"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { Bot, CalendarClock, Code, Edit3, MonitorSmartphone, RefreshCcw, Settings, Wifi } from "lucide-react";

import { TenantShell } from "@/components/admin-shell";
import {
  ActionButton,
  DataTable,
  EmptyState,
  ErrorBanner,
  Field,
  LoadingState,
  MetricCard,
  Modal,
  PageHeader,
  StatusBadge,
  formatDate,
  inputClass,
  textareaClass,
} from "@/components/admin-ui";
import { ProviderSettings } from "@/components/provider-settings";
import {
  API_BASE_URL,
  type Agent,
  type AgentPayload,
  type ApiKeyConfig,
  type Device,
  type RealtimeSession,
  type Widget,
  getAgents,
  getApiKeys,
  getDevices,
  getSessions,
  getWidgets,
  updateAgent,
} from "@/lib/api";
import { useAuth } from "@/lib/use-auth";

type ActiveTab = "agents" | "devices" | "sessions" | "embed" | "config";

export function TenantDashboard() {
  const { token, user, ready, logout } = useAuth("tenant_admin");
  const [activeTab, setActiveTab] = useState<ActiveTab>("agents");
  const [agents, setAgents] = useState<Agent[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [sessions, setSessions] = useState<RealtimeSession[]>([]);
  const [apiKeys, setApiKeys] = useState<ApiKeyConfig[]>([]);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const tenantId = user?.tenant_id;

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const [nextAgents, nextDevices, nextWidgets, nextSessions] = await Promise.all([
        getAgents(token),
        getDevices(token),
        getWidgets(token),
        getSessions(token),
      ]);
      const nextApiKeys = await getApiKeys(token, tenantId);
      setAgents(nextAgents);
      setDevices(nextDevices);
      setWidgets(nextWidgets);
      setSessions(nextSessions);
      setApiKeys(nextApiKeys);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore nel caricamento dati");
    } finally {
      setLoading(false);
    }
  }, [tenantId, token]);

  useEffect(() => {
    queueMicrotask(() => void load());
  }, [load]);

  const agentById = useMemo(() => new Map(agents.map((agent) => [agent.id, agent])), [agents]);
  const apiKeyByProvider = useMemo(() => new Map(apiKeys.map((apiKey) => [apiKey.provider, apiKey])), [apiKeys]);
  const primaryWidget = widgets[0];
  const primaryAgent = primaryWidget ? agentById.get(primaryWidget.agent_id) : agents[0];
  const embedSnippet =
    primaryWidget && primaryAgent
      ? `<!-- Beyond UI Widget -->
<script>
  window.BeyondUIConfig = {
    apiBaseUrl: "${API_BASE_URL}",
    tenantId: "${primaryWidget.tenant_id}",
    widgetId: "${primaryWidget.id}",
    publicToken: "${primaryWidget.public_token ?? ""}",
    agentId: "${primaryAgent.id}"
  };
</script>
<script src="https://cdn.beyondui.com/widget/v1/bundle.js" async></script>`
      : "";

  if (!ready || !token) {
    return <div className="min-h-screen bg-black p-6 text-zinc-500">Caricamento sessione...</div>;
  }

  const tabs = [
    { id: "agents", label: "Agenti", icon: Bot },
    { id: "devices", label: "Kiosk", icon: MonitorSmartphone },
    { id: "sessions", label: "Sessioni", icon: CalendarClock },
    { id: "embed", label: "Widget", icon: Code },
    { id: "config", label: "Config", icon: Settings },
  ] as const;

  return (
    <TenantShell user={user} onLogout={logout}>
      <PageHeader
        title="Dashboard tenant"
        description={`Dati operativi tenant ${user?.tenant_id || ""}`}
        action={<ActionButton variant="secondary" onClick={load}><RefreshCcw size={15} />Aggiorna</ActionButton>}
      />
      {error ? <ErrorBanner message={error} /> : null}
      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <MetricCard label="Agenti" value={agents.length} />
        <MetricCard label="Kiosk" value={devices.length} />
        <MetricCard label="Widget" value={widgets.length} />
        <MetricCard label="Sessioni" value={sessions.length} />
      </div>
      <div className="mb-6 flex gap-2 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex h-9 items-center gap-2 rounded-md px-3 text-sm transition ${
                activeTab === tab.id ? "bg-zinc-50 text-zinc-950" : "border border-zinc-800 text-zinc-300 hover:bg-zinc-900"
              }`}
            >
              <Icon size={15} />
              {tab.label}
            </button>
          );
        })}
      </div>
      {loading ? <LoadingState /> : null}
      {!loading && activeTab === "agents" ? (
        <DataTable
          headers={["Nome", "Avatar", "N8N", "Runtime", "Status", "Actions"]}
          empty="Nessun agente."
          rows={agents.map((agent) => [
            agent.name,
            agent.beyond_avatar_id || "-",
            agent.n8n_webhook_url || "-",
            <RuntimeBadges key="runtime" agent={agent} apiKeyByProvider={apiKeyByProvider} />,
            <StatusBadge key="status" status={agent.is_active ? "active" : "disabled"} />,
            <ActionButton key="actions" variant="secondary" onClick={() => setEditingAgent(agent)}>
              <Edit3 size={14} />Edit
            </ActionButton>,
          ])}
        />
      ) : null}
      {!loading && activeTab === "devices" ? (
        <DataTable
          headers={["Nome", "Location", "Agente", "Status", "Last Seen"]}
          empty="Nessun device."
          rows={devices.map((device) => [
            device.name,
            device.location || "-",
            agentById.get(device.agent_id)?.name || device.agent_id,
            <StatusBadge key="status" status={device.status} />,
            formatDate(device.last_seen),
          ])}
        />
      ) : null}
      {!loading && activeTab === "sessions" ? (
        <DataTable
          headers={["Session", "Agent", "Type", "Status", "Started", "Ended"]}
          empty="Nessuna sessione."
          rows={sessions.map((session) => [
            session.id,
            agentById.get(session.agent_id)?.name || session.agent_id,
            session.session_type,
            <StatusBadge key="status" status={session.status} />,
            formatDate(session.started_at),
            formatDate(session.ended_at),
          ])}
        />
      ) : null}
      {!loading && activeTab === "embed" ? (
        primaryWidget && primaryAgent ? (
          <pre className="overflow-x-auto rounded-lg border border-zinc-800 bg-zinc-950 p-4 text-sm text-cyan-100">{embedSnippet}</pre>
        ) : (
          <EmptyState text="Crea un widget per generare lo snippet embed." />
        )
      ) : null}
      {!loading && activeTab === "config" ? (
        <div className="grid gap-4">
          <div className="grid gap-4 md:grid-cols-3">
            <MetricCard label="LiveKit" value="Ready" icon={<Wifi size={16} />} />
            <MetricCard label="Beyond Presence" value={agents.some((agent) => agent.beyond_avatar_id) ? "Configured" : "Missing"} />
            <MetricCard label="N8N" value={agents.some((agent) => agent.n8n_webhook_url) ? "Configured" : "Missing"} />
          </div>
          <ProviderSettings token={token} tenantId={user?.tenant_id} />
        </div>
      ) : null}
      {editingAgent ? (
        <TenantAgentForm
          agent={editingAgent}
          token={token}
          onClose={() => setEditingAgent(null)}
          onSaved={load}
        />
      ) : null}
    </TenantShell>
  );
}

function RuntimeBadges({
  agent,
  apiKeyByProvider,
}: {
  agent: Agent;
  apiKeyByProvider: Map<string, ApiKeyConfig>;
}) {
  const ttsProvider = (agent.voice_provider || "").toLowerCase();
  const needsTtsKey = ttsProvider === "openai" || ttsProvider === "gemini";
  const ttsConfigured = !needsTtsKey || Boolean(apiKeyByProvider.get(ttsProvider)?.is_configured);
  const checks = [
    ["Avatar ID", Boolean(agent.beyond_avatar_id)],
    ["Beyond key", Boolean(apiKeyByProvider.get("beyond_presence")?.is_configured)],
    ["N8N", Boolean(agent.n8n_webhook_url)],
    ["TTS key", ttsConfigured],
  ] as const;

  return (
    <div className="flex flex-wrap gap-2">
      {checks.map(([label, ok]) => (
        <span
          key={label}
          className={`inline-flex h-6 items-center rounded-md border px-2 text-xs ${
            ok
              ? "border-emerald-400/25 bg-emerald-400/10 text-emerald-200"
              : "border-red-400/25 bg-red-400/10 text-red-200"
          }`}
        >
          {label}
        </span>
      ))}
    </div>
  );
}

function TenantAgentForm({
  agent,
  token,
  onClose,
  onSaved,
}: {
  agent: Agent;
  token: string;
  onClose: () => void;
  onSaved: () => Promise<void>;
}) {
  const [form, setForm] = useState<AgentPayload>({
    name: agent.name,
    description: agent.description || "",
    beyond_avatar_id: agent.beyond_avatar_id || "",
    system_prompt: agent.system_prompt || "",
    n8n_webhook_url: agent.n8n_webhook_url || "",
    stt_provider: agent.stt_provider || "browser",
    stt_model: agent.stt_model || "",
    voice_provider: agent.voice_provider || "openai",
    voice_id: agent.voice_id || "",
    tts_model: agent.tts_model || "gpt-4o-mini-tts",
    language: agent.language || "it-IT",
    is_active: agent.is_active,
  });
  const [saving, setSaving] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    try {
      await updateAgent(token, agent.id, {
        ...form,
        beyond_avatar_id: form.beyond_avatar_id?.trim() || null,
        n8n_webhook_url: form.n8n_webhook_url?.trim() || null,
        stt_model: form.stt_model?.trim() || null,
        voice_id: form.voice_id?.trim() || null,
        tts_model: form.tts_model?.trim() || null,
      });
      await onSaved();
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title="Configura agente kiosk" onClose={onClose}>
      <form onSubmit={(event) => void submit(event)} className="grid gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Agent Name" value={form.name} onChange={(name) => setForm({ ...form, name })} required />
          <TextField label="Beyond Avatar ID" value={form.beyond_avatar_id || ""} onChange={(beyond_avatar_id) => setForm({ ...form, beyond_avatar_id })} />
          <TextField label="Language" value={form.language} onChange={(language) => setForm({ ...form, language })} required />
          <SelectField
            label="STT Provider"
            value={form.stt_provider || "browser"}
            onChange={(stt_provider) => setForm({
              ...form,
              stt_provider,
              stt_model: stt_provider === "openai" ? "whisper-1" : stt_provider === "gemini" ? "gemini-2.5-flash" : "default"
            })}
            options={["browser", "openai", "gemini"]}
          />
          <SelectField
            label="STT Model"
            value={form.stt_model || (form.stt_provider === "openai" ? "whisper-1" : form.stt_provider === "gemini" ? "gemini-2.5-flash" : "default")}
            onChange={(stt_model) => setForm({ ...form, stt_model })}
            options={
              form.stt_provider === "openai"
                ? ["whisper-1"]
                : form.stt_provider === "gemini"
                ? ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash", "default"]
                : ["default"]
            }
          />
          <SelectField
            label="TTS Provider"
            value={form.voice_provider || "openai"}
            onChange={(voice_provider) => setForm({
              ...form,
              voice_provider,
              tts_model: voice_provider === "gemini" ? "gemini-2.5-flash-preview-tts" : "gpt-4o-mini-tts",
              voice_id: voice_provider === "gemini" ? "Kore" : "alloy"
            })}
            options={["openai", "gemini"]}
          />
          <SelectField
            label="TTS Model"
            value={form.tts_model || (form.voice_provider === "gemini" ? "gemini-2.5-flash-preview-tts" : "gpt-4o-mini-tts")}
            onChange={(tts_model) => setForm({ ...form, tts_model })}
            options={form.voice_provider === "gemini" ? ["gemini-2.5-flash-preview-tts", "gemini-2.0-flash-exp", "gemini-1.5-flash"] : ["gpt-4o-mini-tts", "tts-1", "tts-1-hd"]}
          />
          <SelectField
            label="Voice ID"
            value={form.voice_id || (form.voice_provider === "gemini" ? "Kore" : "alloy")}
            onChange={(voice_id) => setForm({ ...form, voice_id })}
            options={form.voice_provider === "gemini" ? ["Kore", "Puck", "Charon", "Fenrir", "Aoede"] : ["alloy", "echo", "fable", "onyx", "nova", "shimmer", "coral"]}
          />
        </div>
        <TextAreaField label="Description" value={form.description || ""} onChange={(description) => setForm({ ...form, description })} />
        <TextAreaField label="System Prompt" value={form.system_prompt || ""} onChange={(system_prompt) => setForm({ ...form, system_prompt })} />
        <TextField label="N8N Webhook URL" type="url" value={form.n8n_webhook_url || ""} onChange={(n8n_webhook_url) => setForm({ ...form, n8n_webhook_url })} />
        <label className="flex items-center gap-2 text-sm text-zinc-300">
          <input type="checkbox" checked={form.is_active} onChange={(event) => setForm({ ...form, is_active: event.target.checked })} />
          Agent attivo
        </label>
        <div className="flex justify-end gap-2">
          <ActionButton type="button" variant="secondary" onClick={onClose}>Annulla</ActionButton>
          <ActionButton type="submit" disabled={saving}>Salva</ActionButton>
        </div>
      </form>
    </Modal>
  );
}

function TextField({
  label,
  value,
  onChange,
  type = "text",
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <Field label={label}>
      <input className={inputClass} type={type} value={value} onChange={(event) => onChange(event.target.value)} required={required} />
    </Field>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <Field label={label}>
      <textarea className={textareaClass} value={value} onChange={(event) => onChange(event.target.value)} />
    </Field>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <Field label={label}>
      <select className={inputClass} value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
    </Field>
  );
}
