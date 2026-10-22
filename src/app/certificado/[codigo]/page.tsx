import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BrandMark } from "@/components/brand-mark";
import { Icon } from "@/components/ui/icon";
import { getPublicCertificate } from "@/lib/certificates/public";
import {
  certificatePath,
  formatIssuedDate,
  siteUrl,
} from "@/lib/certificates/types";

export async function generateMetadata({
  params,
}: PageProps<"/certificado/[codigo]">): Promise<Metadata> {
  const { codigo } = await params;
  const certificate = await getPublicCertificate(codigo);

  if (!certificate) {
    return { title: "Certificado no encontrado · EVA 2026" };
  }

  const title = `${certificate.participant_name} · ${certificate.course_name}`;
  const description = `Certificado de ${certificate.kind.toLowerCase()} de ${certificate.course_name} (${certificate.hours} h), emitido el ${formatIssuedDate(certificate.issued_at)}. Código de verificación ${certificate.code}.`;

  return {
    title: `${title} · EVA 2026`,
    description,
    openGraph: {
      type: "website",
      siteName: "EVA 2026",
      title,
      description,
      url: `${siteUrl()}${certificatePath(certificate.code)}`,
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function CertificatePage({
  params,
}: PageProps<"/certificado/[codigo]">) {
  const { codigo } = await params;
  const certificate = await getPublicCertificate(codigo);

  if (!certificate) {
    notFound();
  }

  const publicUrl = `${siteUrl()}${certificatePath(certificate.code)}`;
  const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(publicUrl)}`;
  const issued = formatIssuedDate(certificate.issued_at);

  return (
    <main className="flex min-h-dvh flex-1 flex-col bg-background">
      <header className="brand-panel relative overflow-hidden">
        <div className="brand-grid pointer-events-none absolute inset-0" aria-hidden />
        <div className="relative mx-auto flex w-full max-w-3xl flex-wrap items-center justify-between gap-4 px-4 py-6">
          <Link href="/" aria-label="EVA 2026">
            <BrandMark tone="inverse" />
          </Link>
          <p className="inline-flex items-center gap-2 rounded-full bg-white/12 px-3 py-1.5 text-sm font-medium ring-1 ring-inset ring-white/20">
            <Icon name="verified" filled size={18} className="text-[#86efac]" />
            Certificado válido
          </p>
        </div>
        <div className="h-24" aria-hidden />
      </header>

      <div className="mx-auto -mt-20 w-full max-w-3xl px-4 pb-16">
        <article className="diploma relative rounded-[1.6rem] px-6 py-10 text-center sm:px-14 sm:py-14">
          <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-gold-soft text-gold ring-4 ring-gold/25">
            <Icon name="workspace_premium" filled size={34} />
          </span>
          <p className="mt-5 text-xs font-semibold uppercase tracking-[0.24em] text-gold-foreground">
            Certificado de {certificate.kind.toLowerCase()}
          </p>
          <p className="mt-6 text-sm text-muted-foreground">Se otorga a</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {certificate.participant_name}
          </h1>
          <p className="mt-6 text-sm text-muted-foreground">por haber aprobado el curso</p>
          <p className="mt-2 text-xl font-semibold tracking-tight text-primary-soft-foreground sm:text-2xl">
            {certificate.course_name}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            con una duración de {certificate.hours} horas académicas
          </p>

          <dl className="mt-10 grid gap-px overflow-hidden rounded-2xl border border-border bg-border text-left sm:grid-cols-3">
            {[
              { label: "Fecha de emisión", value: issued },
              { label: "Duración", value: `${certificate.hours} h` },
              { label: "Código de verificación", value: certificate.code, mono: true },
            ].map((field) => (
              <div key={field.label} className="bg-card px-4 py-3">
                <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  {field.label}
                </dt>
                <dd
                  className={
                    field.mono
                      ? "mt-1 font-mono text-base font-semibold tracking-[0.2em] text-foreground"
                      : "mt-1 text-sm font-medium text-foreground"
                  }
                >
                  {field.value}
                </dd>
              </div>
            ))}
          </dl>
        </article>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <a
            className="auth-submit inline-flex h-11 items-center gap-2 rounded-2xl bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-sm"
            href={`${certificatePath(certificate.code)}/pdf`}
          >
            <Icon name="download" size={18} />
            Descargar PDF
          </a>
          <a
            className="inline-flex h-11 items-center gap-2 rounded-2xl border border-border bg-card px-5 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
            href={linkedInUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Icon name="share" size={18} />
            Compartir en LinkedIn
          </a>
        </div>
        <p className="mx-auto mt-6 max-w-lg text-center text-xs leading-5 text-muted-foreground">
          EVA 2026 confirma que este certificado fue emitido por la plataforma y
          que sus datos coinciden con el registro original.
        </p>
      </div>
    </main>
  );
}
