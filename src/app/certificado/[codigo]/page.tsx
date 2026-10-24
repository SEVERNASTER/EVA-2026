import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import QRCode from "qrcode";
import { BrandMark } from "@/components/brand-mark";
import { Icon } from "@/components/ui/icon";
import { getSessionProfile } from "@/lib/auth/profile";
import { getPublicCertificate } from "@/lib/certificates/public";
import {
  certificatePath,
  formatIssuedDate,
  siteUrl,
} from "@/lib/certificates/types";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export async function generateMetadata({
  params,
}: PageProps<"/certificado/[codigo]">): Promise<Metadata> {
  const { codigo } = await params;
  const certificate = await getPublicCertificate(codigo);

  if (!certificate) {
    return { title: "Certificado no encontrado · EVA 2026" };
  }

  const title = `${certificate.participant_name} · ${certificate.course_name}`;
  const description = `Certificado de ${certificate.kind.toLowerCase()} de ${certificate.course_name} (${certificate.hours} h), emitido el ${formatIssuedDate(certificate.issued_at)}. Código de verificación ${certificate.code}. Validado oficialmente por la UMSS.`;

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

  const profile = await getSessionProfile();
  const isAdmin = profile?.role === "admin";

  // Si no está validado por el administrador y el visitante no es admin, bloquear visualización
  if (!certificate.is_validated && !isAdmin) {
    return (
      <main className="flex min-h-dvh flex-1 flex-col bg-background">
        <header className="brand-panel relative overflow-hidden">
          <div className="brand-grid pointer-events-none absolute inset-0" aria-hidden />
          <div className="relative mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-4 py-6">
            <Link href="/" aria-label="EVA 2026">
              <BrandMark tone="inverse" />
            </Link>
          </div>
        </header>

        <div className="mx-auto flex flex-1 max-w-md items-center justify-center px-4 py-16">
          <div className="w-full rounded-[1.4rem] border border-amber-500/30 bg-card p-6 text-center shadow-sm">
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-amber-500/10 text-amber-600">
              <Icon name="pending" size={28} />
            </div>
            <h1 className="mt-4 text-lg font-bold text-foreground">
              Certificado Pendiente de Aprobación
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Este certificado fue emitido con código{" "}
              <span className="font-mono font-semibold text-foreground">
                {certificate.code}
              </span>
              , pero aún se encuentra en proceso de aprobación por la administración de la facultad.
            </p>
            <div className="mt-6 flex justify-center">
              <Link
                href="/estudiante"
                className="auth-submit inline-flex h-10 items-center gap-1.5 rounded-2xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm"
              >
                <Icon name="arrow_back" size={16} />
                Volver a mis cursos
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const publicUrl = `${siteUrl()}${certificatePath(certificate.code)}`;
  const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(publicUrl)}`;
  const issued = formatIssuedDate(certificate.issued_at);

  // Generar código QR en Base64 para el recuadro designado en la esquina inferior derecha
  const qrDataUrl = await QRCode.toDataURL(publicUrl, {
    width: 160,
    margin: 0,
    color: { dark: "#0f172a", light: "#ffffff" },
  });

  return (
    <main className="flex min-h-dvh flex-1 flex-col bg-background">
      <header className="brand-panel relative overflow-hidden">
        <div className="brand-grid pointer-events-none absolute inset-0" aria-hidden />
        <div className="relative mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-4 px-4 py-6">
          <Link href="/" aria-label="EVA 2026">
            <BrandMark tone="inverse" />
          </Link>
          <div className="flex flex-wrap items-center gap-2">
            {isAdmin ? (
              <Link
                href={`/admin/verificar?codigo=${certificate.code}`}
                className="inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-3 py-1.5 text-xs font-semibold text-primary-soft-foreground transition-colors hover:bg-primary-soft/80"
              >
                <Icon name="verified_user" filled size={16} />
                {certificate.is_validated
                  ? `Validado por Admin (${profile?.full_name})`
                  : "Pendiente: Validar ahora en panel"}
              </Link>
            ) : null}
            <p className="inline-flex items-center gap-2 rounded-full bg-white/12 px-3.5 py-1.5 text-sm font-medium text-white ring-1 ring-inset ring-white/20">
              <Icon name="verified" filled size={18} className="text-[#86efac]" />
              Certificado oficial UMSS
            </p>
          </div>
        </div>
        <div className="h-12" aria-hidden />
      </header>

      {isAdmin && !certificate.is_validated ? (
        <div className="border-b border-amber-500/30 bg-amber-500/10 px-4 py-2.5 text-center text-xs font-semibold text-amber-900 dark:text-amber-200">
          ⚠️ Vista preliminar de Administrador: Este certificado aún no ha sido aprobado formalmente para visualización del estudiante.
        </div>
      ) : null}

      <div className="mx-auto -mt-10 w-full max-w-5xl px-4 pb-20">
        {/* Lienzo del Certificado Oficial con tipografía Montserrat integrada y contenedor responsivo escalable */}
        <section
          aria-label="Documento de Certificado Digital"
          className="relative mx-auto w-full max-w-4xl overflow-hidden rounded-2xl border border-border/80 bg-white shadow-2xl"
        >
          <div
            className={`@container relative aspect-[1024/608] w-full select-none ${montserrat.className}`}
            style={{ containerType: "inline-size" }}
          >
            {/* Imagen de fondo limpia oficial */}
            <Image
              src="/certificado-template.png"
              alt="Plantilla oficial de Certificado UMSS - FCyT"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 896px"
              className="pointer-events-none object-contain object-center"
            />

            {/* 1. Nombre del Estudiante: mayúsculas centradas justo sobre la primera línea, debajo de OTORGADO A: */}
            <div
              className="absolute left-[59.2%] top-[43%] -translate-x-1/2 -translate-y-1/2 text-center"
              style={{ width: "65%" }}
            >
              <h1
                className="truncate font-bold uppercase tracking-wide text-slate-900 drop-shadow-xs"
                style={{
                  fontSize: "clamp(10px, 2.35cqw, 24px)",
                  lineHeight: 1.2,
                }}
              >
                {certificate.participant_name}
              </h1>
            </div>

            {/* 2 y 3. Bloque Central en Flujo: Nombre del curso y descripción dinámica con separación vertical garantizada */}
            <div
              className="absolute left-[59.2%] top-[55%] -translate-x-1/2 flex flex-col items-center justify-start text-center"
              style={{
                width: "76%",
                maxWidth: "76%",
                rowGap: "clamp(1.5px, 0.4cqw, 5px)",
              }}
            >
              <p
                className="line-clamp-2 font-bold text-[#1e3a8a]"
                style={{
                  fontSize: "clamp(7px, 1.65cqw, 17.5px)",
                  lineHeight: 1.2,
                }}
              >
                {certificate.course_name}
              </p>
              <p
                className="font-semibold text-slate-800"
                style={{
                  fontSize: "clamp(5px, 1.05cqw, 11px)",
                  lineHeight: 1.28,
                }}
              >
                Realizado en los ambientes del Departamento de Informática y Sistemas de la Facultad de Ciencias y Tecnología, emitido el {issued}, con una duración de{" "}
                <span className="font-bold text-slate-900">{certificate.hours} horas académicas</span>.
              </p>
            </div>

            {/* 4. Fecha de Emisión: parche blanco centrado solo sobre el texto de la fecha */}
            <div className="absolute left-1/2 top-[69.5%] -translate-x-1/2 -translate-y-1/2 text-center whitespace-nowrap">
              <span
                className="inline-block bg-white font-medium text-slate-800"
                style={{
                  fontSize: "clamp(5.5px, 1.08cqw, 11.5px)",
                  lineHeight: 1,
                  whiteSpace: "nowrap",
                  paddingTop: "clamp(4px, 1.1cqw, 12px)",
                  paddingBottom: "clamp(4px, 1.1cqw, 12px)",
                  paddingLeft: "clamp(4px, 0.8cqw, 9px)",
                  paddingRight: "clamp(4px, 0.8cqw, 9px)",
                }}
              >
                Cochabamba, {issued}
              </span>
            </div>

            {/* 5. Código de verificación: arriba del recuadro del QR con margen claro */}
            <div className="absolute right-[2.6%] top-[69%] z-10 w-[9.8%] text-center">
              <p
                className="font-mono font-bold tracking-widest text-[#1e3a8a]"
                style={{
                  fontSize: "clamp(5px, 0.85cqw, 9.5px)",
                  lineHeight: 1,
                }}
              >
                CÓDIGO: {certificate.code}
              </p>
            </div>

            {/* 6. Contenedor con fondo blanco sólido (bg-white z-10) que enmascara y cubre por completo el QR viejo y CERTIFICADO del fondo */}
            <div
              className="absolute right-[2.6%] bottom-[4.2%] z-10 flex items-center justify-center rounded-sm bg-white p-[0.3cqw] shadow-xs"
              style={{ width: "9.8%", height: "18.5%" }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qrDataUrl}
                alt={`Código QR de verificación para ${certificate.code}`}
                className="size-full object-contain"
              />
            </div>
          </div>
        </section>

        <p className="mt-2.5 text-center text-xs text-muted-foreground sm:hidden">
          Rota tu dispositivo horizontalmente para una vista ampliada del certificado.
        </p>

        {/* Acciones de descarga y compartir */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <a
            className="auth-submit inline-flex h-11 items-center gap-2 rounded-2xl bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-md transition-transform hover:-translate-y-0.5 active:translate-y-0"
            href={`${certificatePath(certificate.code)}/pdf`}
            download={`certificado-${certificate.code}.pdf`}
          >
            <Icon name="download" size={18} />
            Descargar PDF Oficial
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

        {/* Panel de metadatos y confirmación de validación */}
        <div className="mt-8 rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
            <div>
              <h2 className="text-base font-semibold text-foreground">
                Información de Autenticidad del Certificado
              </h2>
              <p className="text-xs text-muted-foreground">
                Registro criptográfico inmutable emitido por el sistema EVA 2026
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <Icon name="verified" size={16} />
              Validado por Administración FCyT
            </span>
          </div>

          <dl className="mt-4 grid gap-4 sm:grid-cols-2 md:grid-cols-4">
            <div className="rounded-xl bg-muted/40 p-3">
              <dt className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Participante
              </dt>
              <dd className="mt-1 text-sm font-semibold text-foreground">
                {certificate.participant_name}
              </dd>
            </div>

            <div className="rounded-xl bg-muted/40 p-3">
              <dt className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Curso Aprobado
              </dt>
              <dd className="mt-1 text-sm font-semibold text-foreground">
                {certificate.course_name}
              </dd>
            </div>

            <div className="rounded-xl bg-muted/40 p-3">
              <dt className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Fecha de Emisión
              </dt>
              <dd className="mt-1 text-sm font-semibold text-foreground">
                {issued}
              </dd>
            </div>

            <div className="rounded-xl bg-muted/40 p-3">
              <dt className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Código de Verificación
              </dt>
              <dd className="mt-1 font-mono text-sm font-extrabold tracking-widest text-primary">
                {certificate.code}
              </dd>
            </div>
          </dl>

          <p className="mt-4 text-center text-xs text-muted-foreground">
            Cualquier tercero o institución puede comprobar la autenticidad de este documento accediendo a{" "}
            <span className="font-mono text-foreground">{publicUrl}</span> o escaneando el código QR impreso en el certificado.
          </p>
        </div>
      </div>
    </main>
  );
}

