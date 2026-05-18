import { TenantDetailPage } from "@/components/admin-pages";

export default async function TenantDetailRoute({
  params,
}: {
  params: Promise<{ tenantId: string }>;
}) {
  const { tenantId } = await params;
  return <TenantDetailPage tenantId={tenantId} />;
}
