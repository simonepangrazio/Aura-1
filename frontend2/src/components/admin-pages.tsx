"use client";

import type { FormEvent, ReactNode } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Activity,
  Bot,
  CheckCircle2,
  KeyRound,
  MonitorSmartphone,
  Plus,
  QrCode,
  RefreshCcw,
  Users,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

import { AdminShell } from "@/components/admin-shell";
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
  shortId,
  textareaClass,
} from "@/components/admin-ui";
import { ProviderSettings } from "@/components/provider-settings";
import {
  API_BASE_URL,
  type AdminOverview,
  type Agent,
  type AgentPayload,
  type Device,
  type DevicePayload,
  type RealtimeSession,
  type SessionDetail,
  type Tenant,
  type TenantCreatePayload,
  type TenantCreateResponse,
  type UserInfo,
  type Workflow,
  createAgent,
  createDevice,
  createTenant,
  createUser,
  deleteAgent,
  deleteDevice,
  deleteTenant,
  deleteUser,
  deleteWorkflow,
  getAdminOverview,
  getAgents,
  getDevices,
  getTenant,
  getSession,
  getSessions,
  getTenants,
  getUsers,
  getWorkflows,
  regenerateDeviceToken,
  resetUserPassword,
  testWorkflow,
  updateAgent,
  updateDevice,
  updateTenant,
  updateUser,
  updateWorkflow,
} from "@/lib/api";
import { useAuth } from "@/lib/use-auth";

type LoadState = "idle" | "loading" | "loaded";

function AdminFrame({ children }: { children: (token: string) => ReactNode }) {
  const { token, user, ready, logout } = useAuth("super_admin");
  if (!ready || !token) {
    return <div className="min-h-screen bg-black p-6 text-zinc-500">Caricamento sessione...</div>;
  }
  return (
    <AdminShell user={user} onLogout={logout}>
      {children(token)}
    </AdminShell>
  );
}

function tenantName(tenants: Tenant[], id?: string | null) {
  return tenants.find((tenant) => tenant.id === id)?.name || shortId(id);
}

function agentName(agents: Agent[], id?: string | null) {
  return agents.find((agent) => agent.id === id)?.name || shortId(id);
}

function deviceName(devices: Device[], id?: string | null) {
  return devices.find((device) => device.id === id)?.name || shortId(id);
}

export function AdminDashboardPage() {
  return (
    <AdminFrame>
      {(token) => <DashboardContent token={token} />}
    </AdminFrame>
  );
}

function DashboardContent({ token }: { token: string }) {
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [state, setState] = useState<LoadState>("idle");

  const load = useCallback(async () => {
    setState("loading");
    setError(null);
    try {
      setOverview(await getAdminOverview(token));
      setState("loaded");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore nel caricamento dashboard");
      setState("loaded");
    }
  }, [token]);

  useEffect(() => {
    queueMicrotask(() => void load());
  }, [load]);

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Vista operativa globale della piattaforma AI Avatar SaaS."
        action={
          <ActionButton onClick={load} variant="secondary">
            <RefreshCcw size={15} />
            Aggiorna
          </ActionButton>
        }
      />
      {error ? <ErrorBanner message={error} /> : null}
      {state === "loading" || !overview ? (
        <LoadingState />
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <MetricCard label="Tenant totali" value={overview.tenant_total} icon={<Users size={16} />} />
            <MetricCard label="Device online" value={overview.device_online} icon={<MonitorSmartphone size={16} />} />
            <MetricCard label="Sessioni attive" value={overview.active_sessions} icon={<Activity size={16} />} />
            <MetricCard label="Sessioni oggi" value={overview.sessions_today} icon={<CheckCircle2 size={16} />} />
            <MetricCard label="Utenti registrati" value={overview.registered_users} icon={<Users size={16} />} />
            <MetricCard label="Agents attivi" value={overview.active_agents} icon={<Bot size={16} />} />
          </div>

          <section className="grid gap-4 xl:grid-cols-3">
            <RecentPanel title="Ultimi tenant">
              {overview.recent_tenants.map((tenant) => (
                <RecentRow key={tenant.id} title={tenant.name} meta={tenant.slug} status={tenant.status} />
              ))}
            </RecentPanel>
            <RecentPanel title="Ultime sessioni">
              {overview.recent_sessions.map((session) => (
                <RecentRow key={session.id} title={shortId(session.id)} meta={session.session_type} status={session.status} />
              ))}
            </RecentPanel>
            <RecentPanel title="Ultimi device online">
              {overview.recent_devices.map((device) => (
                <RecentRow key={device.id} title={device.name} meta={formatDate(device.last_seen)} status={device.status} />
              ))}
            </RecentPanel>
          </section>
        </div>
      )}
    </>
  );
}

function RecentPanel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
      <h2 className="mb-3 text-sm font-medium text-zinc-200">{title}</h2>
      <div className="space-y-2">{children || <EmptyState text="Nessun dato disponibile." />}</div>
    </div>
  );
}

function RecentRow({ title, meta, status }: { title: string; meta: string; status: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-md border border-zinc-900 bg-black px-3 py-2">
      <div className="min-w-0">
        <p className="truncate text-sm text-zinc-100">{title}</p>
        <p className="truncate text-xs text-zinc-500">{meta}</p>
      </div>
      <StatusBadge status={status} />
    </div>
  );
}

export function TenantsPage() {
  return (
    <AdminFrame>
      {(token) => <TenantsContent token={token} />}
    </AdminFrame>
  );
}

function TenantsContent({ token }: { token: string }) {
  const router = useRouter();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [editing, setEditing] = useState<Tenant | null>(null);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setTenants(await getTenants(token));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore tenant");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    queueMicrotask(() => void load());
  }, [load]);

  const removeTenant = async (tenant: Tenant) => {
    if (!window.confirm(`Eliminare definitivamente ${tenant.name}?`)) return;
    await deleteTenant(token, tenant.id);
    await load();
  };

  const tenantCreated = async (response: TenantCreateResponse) => {
    window.sessionStorage.setItem(`tenant_created_${response.tenant.id}`, JSON.stringify(response));
    await load();
    setCreating(false);
    router.push(`/tenants/${response.tenant.id}`);
  };

  return (
    <>
      <PageHeader
        title="Tenants"
        description="Clienti della piattaforma, stato operativo e provisioning iniziale."
        action={
          <ActionButton onClick={() => setCreating(true)}>
            <Plus size={15} />
            Create Tenant
          </ActionButton>
        }
      />
      {error ? <ErrorBanner message={error} /> : null}
      {loading ? (
        <LoadingState />
      ) : (
        <DataTable
          headers={["Nome", "Slug", "Email", "Status", "Created At", "Actions"]}
          empty="Nessun tenant presente."
          rows={tenants.map((tenant) => [
            tenant.name,
            tenant.slug,
            tenant.email || "-",
            <StatusBadge key="status" status={tenant.status} />,
            formatDate(tenant.created_at),
            <div key="actions" className="flex flex-wrap gap-2">
              <ActionButton variant="secondary" onClick={() => router.push(`/tenants/${tenant.id}`)}>Dettagli</ActionButton>
              <ActionButton variant="secondary" onClick={() => setEditing(tenant)}>Edit</ActionButton>
              <ActionButton variant="ghost" onClick={() => void updateTenant(token, tenant.id, { status: "suspended" }).then(load)}>Disable</ActionButton>
              <ActionButton variant="danger" onClick={() => void removeTenant(tenant)}>Delete</ActionButton>
            </div>,
          ])}
        />
      )}
      {creating ? <TenantForm token={token} onClose={() => setCreating(false)} onSaved={load} onCreated={tenantCreated} /> : null}
      {editing ? <TenantForm token={token} tenant={editing} onClose={() => setEditing(null)} onSaved={load} /> : null}
    </>
  );
}

function TenantForm({
  token,
  tenant,
  onClose,
  onSaved,
  onCreated,
}: {
  token: string;
  tenant?: Tenant;
  onClose: () => void;
  onSaved: () => Promise<void>;
  onCreated?: (response: TenantCreateResponse) => Promise<void>;
}) {
  const [form, setForm] = useState<TenantCreatePayload>({
    name: tenant?.name || "",
    slug: tenant?.slug || "",
    email: tenant?.email || "",
    status: tenant?.status || "active",
    admin_email: "",
    admin_password: "Tenant123!",
    admin_first_name: "",
    admin_last_name: "",
    create_default_agent: true,
  });
  const [saving, setSaving] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      if (tenant) {
        await updateTenant(token, tenant.id, {
          name: form.name,
          slug: form.slug,
          email: form.email,
          status: form.status || "active",
        });
        await onSaved();
        onClose();
      } else {
        const created = await createTenant(token, form);
        if (onCreated) {
          await onCreated(created);
        } else {
          await onSaved();
          onClose();
        }
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title={tenant ? "Modifica tenant" : "Crea tenant"} onClose={onClose}>
      <form onSubmit={submit} className="grid gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextInput label="Company Name" value={form.name} onChange={(name) => setForm({ ...form, name })} required />
          <TextInput label="Company Slug" value={form.slug} onChange={(slug) => setForm({ ...form, slug })} required />
          <TextInput label="Company Email" type="email" value={form.email || ""} onChange={(email) => setForm({ ...form, email })} required />
          <SelectInput label="Status" value={form.status || "active"} onChange={(status) => setForm({ ...form, status })} options={["active", "suspended"]} />
        </div>
        {!tenant ? (
          <>
            <div className="h-px bg-zinc-900" />
            <div className="grid gap-4 sm:grid-cols-2">
              <TextInput label="Admin First Name" value={form.admin_first_name || ""} onChange={(admin_first_name) => setForm({ ...form, admin_first_name })} required />
              <TextInput label="Admin Last Name" value={form.admin_last_name || ""} onChange={(admin_last_name) => setForm({ ...form, admin_last_name })} required />
              <TextInput label="Admin Email" type="email" value={form.admin_email} onChange={(admin_email) => setForm({ ...form, admin_email })} required />
              <TextInput label="Admin Password" type="password" value={form.admin_password} onChange={(admin_password) => setForm({ ...form, admin_password })} required />
            </div>
            <label className="flex items-center gap-2 text-sm text-zinc-300">
              <input
                type="checkbox"
                checked={form.create_default_agent}
                onChange={(event) => setForm({ ...form, create_default_agent: event.target.checked })}
              />
              Crea agent default
            </label>
          </>
        ) : null}
        <div className="flex justify-end gap-2">
          <ActionButton type="button" variant="secondary" onClick={onClose}>Annulla</ActionButton>
          <ActionButton type="submit" disabled={saving}>{saving ? "Salvataggio..." : "Salva"}</ActionButton>
        </div>
      </form>
    </Modal>
  );
}

export function TenantDetailPage({ tenantId }: { tenantId: string }) {
  return (
    <AdminFrame>
      {(token) => <TenantDetailContent token={token} tenantId={tenantId} />}
    </AdminFrame>
  );
}

function TenantDetailContent({ token, tenantId }: { token: string; tenantId: string }) {
  const router = useRouter();
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [admins, setAdmins] = useState<UserInfo[]>([]);
  const [agentCount, setAgentCount] = useState(0);
  const [deviceCount, setDeviceCount] = useState(0);
  const [sessionCount, setSessionCount] = useState(0);
  const [createdNotice, setCreatedNotice] = useState<TenantCreateResponse | null>(() => {
    if (typeof window === "undefined") return null;
    const raw = window.sessionStorage.getItem(`tenant_created_${tenantId}`);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as TenantCreateResponse;
    } catch {
      return null;
    }
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [nextTenant, users, agents, devices, sessions] = await Promise.all([
        getTenant(token, tenantId),
        getUsers(token),
        getAgents(token),
        getDevices(token),
        getSessions(token),
      ]);
      setTenant(nextTenant);
      setAdmins(users.filter((user) => user.tenant_id === tenantId && user.role === "tenant_admin"));
      setAgentCount(agents.filter((agent) => agent.tenant_id === tenantId).length);
      setDeviceCount(devices.filter((device) => device.tenant_id === tenantId).length);
      setSessionCount(sessions.filter((session) => session.tenant_id === tenantId).length);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore dettaglio tenant");
    } finally {
      setLoading(false);
    }
  }, [tenantId, token]);

  useEffect(() => {
    queueMicrotask(() => void load());
  }, [load]);

  useEffect(() => {
    window.sessionStorage.removeItem(`tenant_created_${tenantId}`);
  }, [tenantId]);

  return (
    <>
      <PageHeader
        title={tenant?.name || "Tenant detail"}
        description="Dettaglio cliente, admin collegati e provisioning iniziale."
        action={
          <ActionButton variant="secondary" onClick={() => router.push("/tenants")}>
            Torna ai tenant
          </ActionButton>
        }
      />
      {error ? <ErrorBanner message={error} /> : null}
      {loading || !tenant ? (
        <LoadingState />
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            <MetricCard label="Agents" value={agentCount} />
            <MetricCard label="Devices" value={deviceCount} />
            <MetricCard label="Sessions" value={sessionCount} />
            <MetricCard label="Status" value={tenant.status} />
          </div>
          <section className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-5">
              <h2 className="mb-4 text-sm font-medium text-zinc-200">Company</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                <Info label="ID" value={tenant.id} mono />
                <Info label="Company Slug" value={tenant.slug} />
                <Info label="Company Email" value={tenant.email || "-"} />
                <Info label="Created At" value={formatDate(tenant.created_at)} />
              </div>
            </div>
            <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-5">
              <h2 className="mb-4 text-sm font-medium text-zinc-200">Tenant Admins</h2>
              <div className="space-y-3">
                {admins.map((admin) => (
                  <div key={admin.id} className="rounded-md border border-zinc-900 bg-black p-3">
                    <p className="text-sm text-zinc-100">{[admin.first_name, admin.last_name].filter(Boolean).join(" ") || admin.email}</p>
                    <p className="mt-1 text-xs text-zinc-500">{admin.email}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <StatusBadge status={admin.role} />
                      <StatusBadge status={admin.is_active ? "active" : "disabled"} />
                    </div>
                  </div>
                ))}
                {admins.length === 0 ? <EmptyState text="Nessun tenant_admin collegato." /> : null}
              </div>
            </div>
          </section>
        </div>
      )}
      {createdNotice ? (
        <Modal title="Tenant creato" onClose={() => setCreatedNotice(null)}>
          <div className="space-y-4 text-sm">
            <div className="rounded-lg border border-emerald-400/25 bg-emerald-400/10 p-3 text-emerald-100">
              Provisioning completato. Conserva queste credenziali: la password e visibile solo ora.
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Info label="Company" value={createdNotice.tenant.name} />
              <Info label="Admin Email" value={createdNotice.admin_credentials.email} mono />
              <Info label="Admin Password" value={createdNotice.admin_credentials.password} mono />
              <Info label="Role" value={createdNotice.admin_credentials.role} />
            </div>
          </div>
        </Modal>
      ) : null}
    </>
  );
}

export function UsersPage() {
  return (
    <AdminFrame>
      {(token) => <UsersContent token={token} />}
    </AdminFrame>
  );
}

function UsersContent({ token }: { token: string }) {
  const [users, setUsers] = useState<UserInfo[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [editing, setEditing] = useState<UserInfo | null>(null);
  const [creating, setCreating] = useState(false);
  const [resetting, setResetting] = useState<UserInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [nextUsers, nextTenants] = await Promise.all([getUsers(token), getTenants(token)]);
      setUsers(nextUsers);
      setTenants(nextTenants);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore utenti");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    queueMicrotask(() => void load());
  }, [load]);

  return (
    <>
      <PageHeader
        title="Users"
        description="Utenti piattaforma, assegnazione tenant e reset credenziali."
        action={<ActionButton onClick={() => setCreating(true)}><Plus size={15} />Crea user</ActionButton>}
      />
      {error ? <ErrorBanner message={error} /> : null}
      {loading ? <LoadingState /> : (
        <DataTable
          headers={["Nome", "Email", "Role", "Tenant", "Status", "Created At", "Actions"]}
          empty="Nessun utente presente."
          rows={users.map((user) => [
            [user.first_name, user.last_name].filter(Boolean).join(" ") || "-",
            user.email,
            user.role,
            tenantName(tenants, user.tenant_id),
            <StatusBadge key="status" status={user.is_active ? "active" : "disabled"} />,
            formatDate(user.created_at),
            <div key="actions" className="flex flex-wrap gap-2">
              <ActionButton variant="secondary" onClick={() => setEditing(user)}>Edit</ActionButton>
              <ActionButton variant="ghost" onClick={() => setResetting(user)}><KeyRound size={14} />Reset</ActionButton>
              <ActionButton variant="ghost" onClick={() => void updateUser(token, user.id, { is_active: false }).then(load)}>Disable</ActionButton>
              <ActionButton variant="danger" onClick={() => window.confirm(`Eliminare ${user.email}?`) && void deleteUser(token, user.id).then(load)}>Delete</ActionButton>
            </div>,
          ])}
        />
      )}
      {creating ? <UserForm token={token} tenants={tenants} onClose={() => setCreating(false)} onSaved={load} /> : null}
      {editing ? <UserForm token={token} tenants={tenants} user={editing} onClose={() => setEditing(null)} onSaved={load} /> : null}
      {resetting ? <ResetPasswordForm token={token} user={resetting} onClose={() => setResetting(null)} onSaved={load} /> : null}
    </>
  );
}

function UserForm({
  token,
  tenants,
  user,
  onClose,
  onSaved,
}: {
  token: string;
  tenants: Tenant[];
  user?: UserInfo;
  onClose: () => void;
  onSaved: () => Promise<void>;
}) {
  const [form, setForm] = useState({
    email: user?.email || "",
    password: "User12345!",
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
    role: user?.role || "tenant_admin",
    tenant_id: user?.tenant_id || tenants[0]?.id || "",
    is_active: user?.is_active ?? true,
  });
  const [saving, setSaving] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      if (user) {
        await updateUser(token, user.id, form);
      } else {
        await createUser(token, form);
      }
      await onSaved();
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title={user ? "Modifica user" : "Crea user"} onClose={onClose}>
      <form onSubmit={submit} className="grid gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextInput label="Email" value={form.email} onChange={(email) => setForm({ ...form, email })} required />
          {!user ? <TextInput label="Password" type="password" value={form.password} onChange={(password) => setForm({ ...form, password })} required /> : null}
          <TextInput label="Nome" value={form.first_name} onChange={(first_name) => setForm({ ...form, first_name })} />
          <TextInput label="Cognome" value={form.last_name} onChange={(last_name) => setForm({ ...form, last_name })} />
          <SelectInput label="Role" value={form.role} onChange={(role) => setForm({ ...form, role })} options={["tenant_admin", "super_admin"]} />
          <SelectInput label="Tenant" value={form.tenant_id} onChange={(tenant_id) => setForm({ ...form, tenant_id })} options={tenants.map((tenant) => tenant.id)} labels={Object.fromEntries(tenants.map((tenant) => [tenant.id, tenant.name]))} />
        </div>
        <label className="flex items-center gap-2 text-sm text-zinc-300">
          <input type="checkbox" checked={form.is_active} onChange={(event) => setForm({ ...form, is_active: event.target.checked })} />
          Utente attivo
        </label>
        <div className="flex justify-end gap-2">
          <ActionButton type="button" variant="secondary" onClick={onClose}>Annulla</ActionButton>
          <ActionButton type="submit" disabled={saving}>{saving ? "Salvataggio..." : "Salva"}</ActionButton>
        </div>
      </form>
    </Modal>
  );
}

function ResetPasswordForm({
  token,
  user,
  onClose,
  onSaved,
}: {
  token: string;
  user: UserInfo;
  onClose: () => void;
  onSaved: () => Promise<void>;
}) {
  const [password, setPassword] = useState("User12345!");
  const [saving, setSaving] = useState(false);
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      await resetUserPassword(token, user.id, password);
      await onSaved();
      onClose();
    } finally {
      setSaving(false);
    }
  };
  return (
    <Modal title={`Reset password ${user.email}`} onClose={onClose}>
      <form onSubmit={submit} className="grid gap-4">
        <TextInput label="Nuova password" type="password" value={password} onChange={setPassword} required />
        <div className="flex justify-end gap-2">
          <ActionButton type="button" variant="secondary" onClick={onClose}>Annulla</ActionButton>
          <ActionButton type="submit" disabled={saving}>Reset</ActionButton>
        </div>
      </form>
    </Modal>
  );
}

export function AgentsPage() {
  return (
    <AdminFrame>
      {(token) => <AgentsContent token={token} />}
    </AdminFrame>
  );
}

function AgentsContent({ token }: { token: string }) {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [editing, setEditing] = useState<Agent | null>(null);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [nextAgents, nextTenants] = await Promise.all([getAgents(token), getTenants(token)]);
      setAgents(nextAgents);
      setTenants(nextTenants);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore agents");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    queueMicrotask(() => void load());
  }, [load]);

  return (
    <>
      <PageHeader
        title="Agents"
        description="Avatar AI, prompt, voce, Beyond Avatar ID e webhook N8N."
        action={<ActionButton onClick={() => setCreating(true)}><Plus size={15} />Crea agent</ActionButton>}
      />
      {error ? <ErrorBanner message={error} /> : null}
      {loading ? <LoadingState /> : (
        <DataTable
          headers={["Agent Name", "Tenant", "Beyond Avatar ID", "Language", "Status", "Actions"]}
          empty="Nessun agent presente."
          rows={agents.map((agent) => [
            agent.name,
            tenantName(tenants, agent.tenant_id),
            agent.beyond_avatar_id || "-",
            agent.language,
            <StatusBadge key="status" status={agent.is_active ? "active" : "disabled"} />,
            <div key="actions" className="flex flex-wrap gap-2">
              <ActionButton variant="secondary" onClick={() => setEditing(agent)}>Edit</ActionButton>
              <ActionButton variant="ghost" onClick={() => void updateAgent(token, agent.id, { is_active: !agent.is_active }).then(load)}>
                {agent.is_active ? "Deactivate" : "Activate"}
              </ActionButton>
              <ActionButton variant="danger" onClick={() => window.confirm(`Eliminare ${agent.name}?`) && void deleteAgent(token, agent.id).then(load)}>Delete</ActionButton>
            </div>,
          ])}
        />
      )}
      {creating ? <AgentForm token={token} tenants={tenants} onClose={() => setCreating(false)} onSaved={load} /> : null}
      {editing ? <AgentForm token={token} tenants={tenants} agent={editing} onClose={() => setEditing(null)} onSaved={load} /> : null}
    </>
  );
}

function AgentForm({
  token,
  tenants,
  agent,
  onClose,
  onSaved,
}: {
  token: string;
  tenants: Tenant[];
  agent?: Agent;
  onClose: () => void;
  onSaved: () => Promise<void>;
}) {
  const [form, setForm] = useState<AgentPayload>({
    tenant_id: agent?.tenant_id || tenants[0]?.id || "",
    name: agent?.name || "",
    description: agent?.description || "",
    beyond_avatar_id: agent?.beyond_avatar_id || "",
    system_prompt: agent?.system_prompt || "",
    stt_provider: agent?.stt_provider || "browser",
    stt_model: agent?.stt_model || "",
    voice_provider: agent?.voice_provider || "openai",
    voice_id: agent?.voice_id || "",
    tts_model: agent?.tts_model || "gpt-4o-mini-tts",
    language: agent?.language || "it-IT",
    n8n_webhook_url: agent?.n8n_webhook_url || "",
    is_active: agent?.is_active ?? true,
  });
  const [saving, setSaving] = useState(false);
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      if (agent) {
        const payload: Partial<AgentPayload> = { ...form };
        delete payload.tenant_id;
        await updateAgent(token, agent.id, payload);
      } else {
        await createAgent(token, form);
      }
      await onSaved();
      onClose();
    } finally {
      setSaving(false);
    }
  };
  return (
    <Modal title={agent ? "Configura agent" : "Crea agent"} onClose={onClose}>
      <form onSubmit={submit} className="grid gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          {!agent ? <SelectInput label="Tenant" value={form.tenant_id || ""} onChange={(tenant_id) => setForm({ ...form, tenant_id })} options={tenants.map((tenant) => tenant.id)} labels={Object.fromEntries(tenants.map((tenant) => [tenant.id, tenant.name]))} /> : null}
          <TextInput label="Agent Name" value={form.name} onChange={(name) => setForm({ ...form, name })} required />
          <TextInput label="Beyond Avatar ID" value={form.beyond_avatar_id || ""} onChange={(beyond_avatar_id) => setForm({ ...form, beyond_avatar_id })} />
          <TextInput label="Language" value={form.language} onChange={(language) => setForm({ ...form, language })} required />
          <SelectInput
            label="STT Provider"
            value={form.stt_provider || "browser"}
            onChange={(stt_provider) => setForm({
              ...form,
              stt_provider,
              stt_model: stt_provider === "openai" ? "whisper-1" : stt_provider === "gemini" ? "gemini-2.5-flash" : "default"
            })}
            options={["browser", "openai", "gemini"]}
          />
          <SelectInput
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
          <SelectInput
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
          <SelectInput
            label="TTS Model"
            value={form.tts_model || (form.voice_provider === "gemini" ? "gemini-2.5-flash-preview-tts" : "gpt-4o-mini-tts")}
            onChange={(tts_model) => setForm({ ...form, tts_model })}
            options={form.voice_provider === "gemini" ? ["gemini-2.5-flash-preview-tts", "gemini-2.0-flash-exp", "gemini-1.5-flash"] : ["gpt-4o-mini-tts", "tts-1", "tts-1-hd"]}
          />
          <SelectInput
            label="Voice ID"
            value={form.voice_id || (form.voice_provider === "gemini" ? "Kore" : "alloy")}
            onChange={(voice_id) => setForm({ ...form, voice_id })}
            options={form.voice_provider === "gemini" ? ["Kore", "Puck", "Charon", "Fenrir", "Aoede"] : ["alloy", "echo", "fable", "onyx", "nova", "shimmer", "coral"]}
          />
        </div>
        <TextareaInput label="Description" value={form.description || ""} onChange={(description) => setForm({ ...form, description })} />
        <TextareaInput label="System Prompt" value={form.system_prompt || ""} onChange={(system_prompt) => setForm({ ...form, system_prompt })} />
        <TextInput label="N8N Webhook URL" value={form.n8n_webhook_url || ""} onChange={(n8n_webhook_url) => setForm({ ...form, n8n_webhook_url })} />
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

export function DevicesPage() {
  return (
    <AdminFrame>
      {(token) => <DevicesContent token={token} />}
    </AdminFrame>
  );
}

function DevicesContent({ token }: { token: string }) {
  const [devices, setDevices] = useState<Device[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [editing, setEditing] = useState<Device | null>(null);
  const [creating, setCreating] = useState(false);
  const [tokenDevice, setTokenDevice] = useState<Device | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [nextDevices, nextAgents, nextTenants] = await Promise.all([getDevices(token), getAgents(token), getTenants(token)]);
      setDevices(nextDevices);
      setAgents(nextAgents);
      setTenants(nextTenants);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore devices");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    queueMicrotask(() => void load());
  }, [load]);

  const regen = async (device: Device) => {
    const updated = await regenerateDeviceToken(token, device.id);
    setTokenDevice(updated);
    await load();
  };

  return (
    <>
      <PageHeader
        title="Devices"
        description="Kiosk e totem fisici con device ID, token runtime e stato presenza."
        action={<ActionButton onClick={() => setCreating(true)}><Plus size={15} />Crea device</ActionButton>}
      />
      {error ? <ErrorBanner message={error} /> : null}
      {loading ? <LoadingState /> : (
        <DataTable
          headers={["Device Name", "Tenant", "Location", "Status", "Last Seen", "Actions"]}
          empty="Nessun device presente."
          rows={devices.map((device) => [
            device.name,
            tenantName(tenants, device.tenant_id),
            device.location || "-",
            <StatusBadge key="status" status={device.status} />,
            formatDate(device.last_seen),
            <div key="actions" className="flex flex-wrap gap-2">
              <ActionButton variant="secondary" onClick={() => setEditing(device)}>Edit</ActionButton>
              <ActionButton variant="secondary" onClick={() => setTokenDevice(device)}><QrCode size={14} />QR setup</ActionButton>
              <ActionButton variant="ghost" onClick={() => void updateDevice(token, device.id, { status: "disabled" }).then(load)}>Disable</ActionButton>
              <ActionButton variant="ghost" onClick={() => void regen(device)}>Regenerate token</ActionButton>
              <ActionButton variant="danger" onClick={() => window.confirm(`Eliminare ${device.name}?`) && void deleteDevice(token, device.id).then(load)}>Delete</ActionButton>
            </div>,
          ])}
        />
      )}
      {creating ? <DeviceForm token={token} tenants={tenants} agents={agents} onClose={() => setCreating(false)} onSaved={load} onCreated={setTokenDevice} /> : null}
      {editing ? <DeviceForm token={token} tenants={tenants} agents={agents} device={editing} onClose={() => setEditing(null)} onSaved={load} onCreated={setTokenDevice} /> : null}
      {tokenDevice ? (
        <Modal title="Credenziali device" onClose={() => setTokenDevice(null)}>
          <div className="space-y-3 text-sm">
            <KioskSetupQr device={tokenDevice} />
            <Info label="device_id" value={tokenDevice.id} mono />
            <Info label="device_token" value={tokenDevice.device_token || "-"} mono />
            <p className="text-zinc-500">Usa questi valori nel setup fullscreen del kiosk.</p>
          </div>
        </Modal>
      ) : null}
    </>
  );
}

function kioskSetupPayload(device: Device) {
  return JSON.stringify({
    type: "beyond.kiosk.setup",
    version: 1,
    device_id: device.id,
    device_token: device.device_token || "",
  });
}

function KioskSetupQr({ device }: { device: Device }) {
  if (!device.device_token) {
    return <ErrorBanner message="Token device mancante: rigenera il token prima di usare il QR setup." />;
  }
  return (
    <div className="flex flex-col gap-4 rounded-lg border border-zinc-800 bg-black p-4 sm:flex-row sm:items-center">
      <div className="inline-flex rounded-md bg-white p-3">
        <QRCodeSVG value={kioskSetupPayload(device)} size={168} level="M" includeMargin />
      </div>
      <div>
        <p className="text-sm font-medium text-zinc-100">QR setup kiosk</p>
        <p className="mt-1 text-sm leading-6 text-zinc-500">
          Inquadralo dalla schermata setup del kiosk per compilare e validare automaticamente le credenziali.
        </p>
      </div>
    </div>
  );
}

function DeviceForm({
  token,
  tenants,
  agents,
  device,
  onClose,
  onSaved,
  onCreated,
}: {
  token: string;
  tenants: Tenant[];
  agents: Agent[];
  device?: Device;
  onClose: () => void;
  onSaved: () => Promise<void>;
  onCreated: (device: Device) => void;
}) {
  const [form, setForm] = useState<DevicePayload>({
    tenant_id: device?.tenant_id || tenants[0]?.id || "",
    agent_id: device?.agent_id || agents[0]?.id || "",
    name: device?.name || "",
    location: device?.location || "",
    status: device?.status || "offline",
    settings: device?.settings || {},
  });
  const visibleAgents = agents.filter((agent) => !form.tenant_id || agent.tenant_id === form.tenant_id);
  const [saving, setSaving] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      if (device) {
        const payload: Partial<DevicePayload> = { ...form };
        delete payload.tenant_id;
        const updated = await updateDevice(token, device.id, payload);
        onCreated(updated);
      } else {
        const created = await createDevice(token, form);
        onCreated(created);
      }
      await onSaved();
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title={device ? "Modifica device" : "Crea device"} onClose={onClose}>
      <form onSubmit={submit} className="grid gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          {!device ? (
            <SelectInput
              label="Tenant"
              value={form.tenant_id || ""}
              onChange={(tenant_id) => setForm({ ...form, tenant_id, agent_id: agents.find((agent) => agent.tenant_id === tenant_id)?.id || "" })}
              options={tenants.map((tenant) => tenant.id)}
              labels={Object.fromEntries(tenants.map((tenant) => [tenant.id, tenant.name]))}
            />
          ) : null}
          <SelectInput label="Agent" value={form.agent_id} onChange={(agent_id) => setForm({ ...form, agent_id })} options={visibleAgents.map((agent) => agent.id)} labels={Object.fromEntries(visibleAgents.map((agent) => [agent.id, agent.name]))} />
          <TextInput label="Device Name" value={form.name} onChange={(name) => setForm({ ...form, name })} required />
          <TextInput label="Location" value={form.location || ""} onChange={(location) => setForm({ ...form, location })} />
          <SelectInput label="Status" value={form.status} onChange={(status) => setForm({ ...form, status })} options={["online", "offline", "busy", "disabled"]} />
        </div>
        <div className="flex justify-end gap-2">
          <ActionButton type="button" variant="secondary" onClick={onClose}>Annulla</ActionButton>
          <ActionButton type="submit" disabled={saving || !form.agent_id}>Salva</ActionButton>
        </div>
      </form>
    </Modal>
  );
}

export function SessionsPage() {
  return (
    <AdminFrame>
      {(token) => <SessionsContent token={token} />}
    </AdminFrame>
  );
}

function SessionsContent({ token }: { token: string }) {
  const [sessions, setSessions] = useState<RealtimeSession[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [detail, setDetail] = useState<SessionDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [nextSessions, nextTenants, nextDevices, nextAgents] = await Promise.all([
        getSessions(token),
        getTenants(token),
        getDevices(token),
        getAgents(token),
      ]);
      setSessions(nextSessions);
      setTenants(nextTenants);
      setDevices(nextDevices);
      setAgents(nextAgents);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore sessioni");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    queueMicrotask(() => void load());
  }, [load]);

  const openDetail = async (session: RealtimeSession) => {
    setDetail(await getSession(token, session.id));
  };

  return (
    <>
      <PageHeader title="Sessions" description="Sessioni realtime, durata, agent utilizzato, eventi e messaggi." />
      {error ? <ErrorBanner message={error} /> : null}
      {loading ? <LoadingState /> : (
        <DataTable
          headers={["Session ID", "Tenant", "Device", "Type", "Status", "Started At", "Ended At", "Actions"]}
          empty="Nessuna sessione presente."
          rows={sessions.map((session) => [
            shortId(session.id),
            tenantName(tenants, session.tenant_id),
            deviceName(devices, session.device_id),
            session.session_type,
            <StatusBadge key="status" status={session.status} />,
            formatDate(session.started_at),
            formatDate(session.ended_at),
            <ActionButton key="actions" variant="secondary" onClick={() => void openDetail(session)}>Dettagli</ActionButton>,
          ])}
        />
      )}
      {detail ? (
        <Modal title={`Session ${shortId(detail.id)}`} onClose={() => setDetail(null)}>
          <div className="space-y-5">
            <div className="grid gap-3 text-sm sm:grid-cols-2">
              <Info label="Tenant" value={detail.tenant?.name || tenantName(tenants, detail.tenant_id)} />
              <Info label="Agent" value={detail.agent?.name || agentName(agents, detail.agent_id)} />
              <Info label="Device" value={detail.device?.name || deviceName(devices, detail.device_id)} />
              <Info label="Durata" value={`${detail.duration_seconds ?? 0}s`} />
            </div>
            <div>
              <h3 className="mb-2 text-sm font-medium text-zinc-200">Messaggi</h3>
              <div className="space-y-2">
                {detail.messages.map((message) => (
                  <div key={message.id} className="rounded-md border border-zinc-900 bg-black p-3">
                    <p className="text-xs uppercase text-zinc-500">{message.role}</p>
                    <p className="mt-1 text-sm text-zinc-200">{message.message}</p>
                  </div>
                ))}
                {detail.messages.length === 0 ? <EmptyState text="Nessun messaggio registrato." /> : null}
              </div>
            </div>
            <div>
              <h3 className="mb-2 text-sm font-medium text-zinc-200">Eventi</h3>
              <div className="space-y-2">
                {detail.events.map((event) => (
                  <div key={event.id} className="rounded-md border border-zinc-900 bg-black p-3">
                    <p className="text-sm text-zinc-200">{event.event_type}</p>
                    <pre className="mt-2 overflow-x-auto text-xs text-zinc-500">{JSON.stringify(event.payload, null, 2)}</pre>
                  </div>
                ))}
                {detail.events.length === 0 ? <EmptyState text="Nessun evento registrato." /> : null}
              </div>
            </div>
          </div>
        </Modal>
      ) : null}
    </>
  );
}

export function WorkflowsPage() {
  return (
    <AdminFrame>
      {(token) => <WorkflowsContent token={token} />}
    </AdminFrame>
  );
}

function WorkflowsContent({ token }: { token: string }) {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Workflow | null>(null);
  const [testing, setTesting] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setWorkflows(await getWorkflows(token));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore workflows");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    queueMicrotask(() => void load());
  }, [load]);

  const test = async (workflow: Workflow) => {
    setTesting(workflow.agent_id);
    setResult(null);
    try {
      const response = await testWorkflow(token, workflow.agent_id);
      setResult(`${workflow.agent_name}: ${response.ok ? "OK" : "KO"} ${response.message}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore test workflow");
    } finally {
      setTesting(null);
    }
  };

  const clear = async (workflow: Workflow) => {
    if (!window.confirm(`Rimuovere il webhook N8N da ${workflow.agent_name}?`)) return;
    setError(null);
    try {
      await deleteWorkflow(token, workflow.agent_id);
      setResult(`${workflow.agent_name}: webhook N8N rimosso`);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore rimozione webhook");
    }
  };

  const configuredCount = workflows.filter((workflow) => workflow.webhook_url).length;
  const missingCount = workflows.length - configuredCount;

  return (
    <>
      <PageHeader
        title="Workflows"
        description="Gestione globale webhook N8N collegati agli agenti dei tenant."
        action={
          <ActionButton onClick={() => setCreating(true)}>
            <Plus size={15} />
            Add Workflow
          </ActionButton>
        }
      />
      {error ? <ErrorBanner message={error} /> : null}
      {result ? <div className="mb-5 rounded-lg border border-cyan-400/25 bg-cyan-400/10 p-3 text-sm text-cyan-100">{result}</div> : null}
      {loading ? <LoadingState /> : (
        <div className="space-y-5">
          <div className="grid gap-4 md:grid-cols-3">
            <MetricCard label="Agents" value={workflows.length} />
            <MetricCard label="Webhook configurati" value={configuredCount} />
            <MetricCard label="Da configurare" value={missingCount} />
          </div>
          <DataTable
            headers={["Agent", "Tenant", "Webhook", "Status", "Actions"]}
            empty="Nessun agent disponibile per i workflow."
            rows={workflows.map((workflow) => [
              workflow.agent_name,
              workflow.tenant_name || shortId(workflow.tenant_id),
              workflow.webhook_url ? <span key="url" className="break-all font-mono text-xs">{workflow.webhook_url}</span> : "-",
              <StatusBadge key="status" status={workflow.status} />,
              <div key="actions" className="flex flex-wrap gap-2">
                <ActionButton variant="secondary" onClick={() => setEditing(workflow)}>
                  {workflow.webhook_url ? "Edit" : "Configura"}
                </ActionButton>
                <ActionButton variant="ghost" disabled={!workflow.webhook_url || testing === workflow.agent_id} onClick={() => void test(workflow)}>
                  {testing === workflow.agent_id ? "Testing..." : "Test connection"}
                </ActionButton>
                <ActionButton variant="danger" disabled={!workflow.webhook_url} onClick={() => void clear(workflow)}>
                  Rimuovi
                </ActionButton>
              </div>,
            ])}
          />
        </div>
      )}
      {editing ? (
        <WorkflowForm
          token={token}
          workflow={editing}
          onClose={() => setEditing(null)}
          onSaved={async (updated) => {
            setResult(`${updated.agent_name}: webhook N8N salvato`);
            await load();
          }}
        />
      ) : null}
      {creating ? (
        <WorkflowCreateForm
          token={token}
          workflows={workflows}
          onClose={() => setCreating(false)}
          onSaved={async (updated) => {
            setResult(`${updated.agent_name}: webhook N8N aggiunto`);
            await load();
          }}
        />
      ) : null}
    </>
  );
}

function WorkflowCreateForm({
  token,
  workflows,
  onClose,
  onSaved,
}: {
  token: string;
  workflows: Workflow[];
  onClose: () => void;
  onSaved: (workflow: Workflow) => Promise<void>;
}) {
  const defaultWorkflow = workflows.find((workflow) => !workflow.webhook_url) || workflows[0];
  const [tenantId, setTenantId] = useState(defaultWorkflow?.tenant_id || "");
  const visibleWorkflows = workflows.filter((workflow) => workflow.tenant_id === tenantId);
  const defaultAgentId = visibleWorkflows.find((workflow) => !workflow.webhook_url)?.agent_id || visibleWorkflows[0]?.agent_id || "";
  const [agentId, setAgentId] = useState(defaultAgentId);
  const [webhookUrl, setWebhookUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const tenantLabels = Object.fromEntries(
    workflows.map((workflow) => [workflow.tenant_id, workflow.tenant_name || shortId(workflow.tenant_id)]),
  );
  const tenantOptions = Object.keys(tenantLabels);
  const agentLabels = Object.fromEntries(
    visibleWorkflows.map((workflow) => [
      workflow.agent_id,
      workflow.webhook_url ? `${workflow.agent_name} (configured)` : workflow.agent_name,
    ]),
  );

  const changeTenant = (nextTenantId: string) => {
    const nextAgents = workflows.filter((workflow) => workflow.tenant_id === nextTenantId);
    setTenantId(nextTenantId);
    setAgentId(nextAgents.find((workflow) => !workflow.webhook_url)?.agent_id || nextAgents[0]?.agent_id || "");
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!agentId) {
      setError("Seleziona un agent prima di salvare il webhook");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const updated = await updateWorkflow(token, agentId, { webhook_url: webhookUrl });
      await onSaved(updated);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore aggiunta workflow");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title="Add Workflow N8N" onClose={onClose}>
      <form onSubmit={submit} className="grid gap-4">
        {error ? <ErrorBanner message={error} /> : null}
        {workflows.length === 0 ? (
          <EmptyState text="Crea almeno un agent prima di aggiungere un workflow N8N." />
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <SelectInput label="Tenant" value={tenantId} onChange={changeTenant} options={tenantOptions} labels={tenantLabels} />
              <SelectInput label="Agent" value={agentId} onChange={setAgentId} options={visibleWorkflows.map((workflow) => workflow.agent_id)} labels={agentLabels} />
            </div>
            <TextInput label="N8N Webhook URL" type="url" value={webhookUrl} onChange={setWebhookUrl} required />
          </>
        )}
        <div className="flex justify-end gap-2">
          <ActionButton type="button" variant="secondary" onClick={onClose}>Annulla</ActionButton>
          <ActionButton type="submit" disabled={saving || workflows.length === 0}>{saving ? "Salvataggio..." : "Aggiungi workflow"}</ActionButton>
        </div>
      </form>
    </Modal>
  );
}

function WorkflowForm({
  token,
  workflow,
  onClose,
  onSaved,
}: {
  token: string;
  workflow: Workflow;
  onClose: () => void;
  onSaved: (workflow: Workflow) => Promise<void>;
}) {
  const [webhookUrl, setWebhookUrl] = useState(workflow.webhook_url || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const updated = await updateWorkflow(token, workflow.agent_id, { webhook_url: webhookUrl });
      await onSaved(updated);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore salvataggio webhook");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title={`Webhook N8N - ${workflow.agent_name}`} onClose={onClose}>
      <form onSubmit={submit} className="grid gap-4">
        {error ? <ErrorBanner message={error} /> : null}
        <div className="grid gap-3 text-sm sm:grid-cols-2">
          <Info label="Tenant" value={workflow.tenant_name || shortId(workflow.tenant_id)} />
          <Info label="Agent" value={workflow.agent_name} />
        </div>
        <TextInput label="N8N Webhook URL" type="url" value={webhookUrl} onChange={setWebhookUrl} required />
        <div className="flex justify-end gap-2">
          <ActionButton type="button" variant="secondary" onClick={onClose}>Annulla</ActionButton>
          <ActionButton type="submit" disabled={saving}>{saving ? "Salvataggio..." : "Salva webhook"}</ActionButton>
        </div>
      </form>
    </Modal>
  );
}

export function AnalyticsPage() {
  return (
    <AdminFrame>
      {(token) => <AnalyticsContent token={token} />}
    </AdminFrame>
  );
}

function AnalyticsContent({ token }: { token: string }) {
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [sessions, setSessions] = useState<RealtimeSession[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [nextOverview, nextSessions, nextDevices, nextTenants] = await Promise.all([
          getAdminOverview(token),
          getSessions(token),
          getDevices(token),
          getTenants(token),
        ]);
        setOverview(nextOverview);
        setSessions(nextSessions);
        setDevices(nextDevices);
        setTenants(nextTenants);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Errore analytics");
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [token]);

  const sessionsByTenant = useMemo(() => {
    return tenants.map((tenant) => ({
      tenant,
      count: sessions.filter((session) => session.tenant_id === tenant.id).length,
    }));
  }, [sessions, tenants]);
  const maxSessions = Math.max(1, ...sessionsByTenant.map((row) => row.count));

  return (
    <>
      <PageHeader title="Analytics" description="MVP semplice per sessioni, device online, utilizzo tenant e uptime." />
      {error ? <ErrorBanner message={error} /> : null}
      {loading || !overview ? <LoadingState /> : (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            <MetricCard label="Sessioni giornaliere" value={overview.sessions_today} />
            <MetricCard label="Device online" value={overview.device_online} />
            <MetricCard label="Uptime" value={overview.uptime_status.toUpperCase()} />
            <MetricCard label="Device totali" value={devices.length} />
          </div>
          <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
            <h2 className="mb-4 text-sm font-medium text-zinc-200">Utilizzo tenant</h2>
            <div className="space-y-3">
              {sessionsByTenant.map(({ tenant, count }) => (
                <div key={tenant.id}>
                  <div className="mb-1 flex justify-between text-xs text-zinc-500">
                    <span>{tenant.name}</span>
                    <span>{count} sessioni</span>
                  </div>
                  <div className="h-2 rounded-full bg-zinc-900">
                    <div className="h-2 rounded-full bg-cyan-400" style={{ width: `${(count / maxSessions) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function SettingsPage() {
  return (
    <AdminFrame>
      {(token) => <SettingsContent token={token} />}
    </AdminFrame>
  );
}

function SettingsContent({ token }: { token: string }) {
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  useEffect(() => {
    void Promise.all([getAdminOverview(token), getTenants(token)]).then(([nextOverview, nextTenants]) => {
      setOverview(nextOverview);
      setTenants(nextTenants);
    });
  }, [token]);

  return (
    <>
      <PageHeader title="Settings" description="Configurazioni piattaforma MVP, branding e stato sistema." />
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="lg:col-span-2">
          <ProviderSettings token={token} tenants={tenants} allowTenantSelect />
        </div>
        <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-5">
          <h2 className="mb-4 text-sm font-medium text-zinc-200">Branding</h2>
          <div className="grid gap-3">
            <Info label="Platform name" value="Beyond Platform" />
            <Info label="Console" value="Global Admin" />
          </div>
        </div>
        <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-5">
          <h2 className="mb-4 text-sm font-medium text-zinc-200">API settings</h2>
          <div className="grid gap-3">
            <Info label="API Base URL" value={API_BASE_URL} mono />
            <Info label="Auth" value="JWT bearer" />
          </div>
        </div>
        <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-5">
          <h2 className="mb-4 text-sm font-medium text-zinc-200">Environment info</h2>
          <div className="grid gap-3">
            <Info label="Frontend" value="Next.js App Router" />
            <Info label="Backend" value="FastAPI / PostgreSQL" />
          </div>
        </div>
        <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-5">
          <h2 className="mb-4 text-sm font-medium text-zinc-200">System status</h2>
          <div className="grid gap-3">
            <Info label="Uptime" value={overview?.uptime_status || "loading"} />
            <Info label="Active sessions" value={String(overview?.active_sessions ?? "-")} />
          </div>
        </div>
      </div>
    </>
  );
}

function TextInput({
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

function TextareaInput({
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

function SelectInput({
  label,
  value,
  onChange,
  options,
  labels = {},
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  labels?: Record<string, string>;
}) {
  return (
    <Field label={label}>
      <select className={inputClass} value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => (
          <option key={option} value={option}>
            {labels[option] || option}
          </option>
        ))}
      </select>
    </Field>
  );
}

function Info({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="rounded-md border border-zinc-900 bg-black p-3">
      <p className="mb-1 text-xs uppercase text-zinc-500">{label}</p>
      <p className={mono ? "break-all font-mono text-xs text-zinc-200" : "break-words text-sm text-zinc-200"}>{value}</p>
    </div>
  );
}
