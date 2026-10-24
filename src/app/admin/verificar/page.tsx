import { AdminVerifyCertificate } from "@/components/admin-verify-certificate";
import { requireRole } from "@/lib/auth/guards";

export default async function AdminVerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const admin = await requireRole("admin");
  const query = await searchParams;
  const initialCode =
    typeof query.codigo === "string" ? query.codigo.trim().toUpperCase() : "";

  return (
    <>
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          Validación Oficial de Certificados
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Consulta y valida la autenticidad de cualquier código de certificación emitido por el departamento.
        </p>
      </div>

      <AdminVerifyCertificate
        initialCode={initialCode}
        adminName={admin.full_name}
      />
    </>
  );
}

