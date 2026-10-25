import { AdminVerifyCertificate } from "@/components/admin-verify-certificate";
import { PageHeader } from "@/components/ui/page-header";
import { requireRole } from "@/lib/auth/guards";

export default async function AdminVerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  await requireRole("admin");
  const query = await searchParams;
  const initialCode =
    typeof query.codigo === "string" ? query.codigo.trim().toUpperCase() : "";

  return (
    <>
      <PageHeader
        icon="verified"
        eyebrow="Verificación"
        title="Consultar certificado"
        description="Comprueba si un código de 8 caracteres corresponde a un diploma emitido. Esta consulta no emite ni modifica nada."
      />
      <AdminVerifyCertificate initialCode={initialCode} />
    </>
  );
}
