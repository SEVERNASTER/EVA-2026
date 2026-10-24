import Link from "next/link";
import { Icon } from "@/components/ui/icon";

export default function CertificateNotFound() {
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-12 sm:py-16">
      <p className="inline-flex items-center gap-2 rounded-full bg-warning px-3 py-1 text-sm font-medium text-warning-foreground">
        <Icon name="gpp_maybe" size={18} />
        Sin coincidencia
      </p>
      <h1 className="mt-5 text-2xl font-semibold tracking-tight text-foreground">
        No existe un certificado con ese código
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Revisa que el código tenga 8 caracteres (números y letras de la A a la
        F). Si el problema continúa, el documento no fue emitido por EVA 2026.
      </p>
      <Link
        className="auth-submit mt-8 inline-flex h-10 items-center rounded-2xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm"
        href="/"
      >
        Ir a EVA 2026
      </Link>
    </main>
  );
}
