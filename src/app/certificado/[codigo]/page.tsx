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
                Validado como Admin ({profile.full_name})
              </Link>
            ) : null}
            <p className="inline-flex items-center gap-2 rounded-full bg-white/12 px-3.5 py-1.5 text-sm font-medium text-white ring-1 ring-inset ring-white/20">
              <Icon name="verified" filled size={18} className="text-[#86efac]" />
              Certificado válido y verificado
            </p>
          </div>
        </div>
        <div className="h-12" aria-hidden />
      </header>

      <div className="mx-auto -mt-10 w-full max-w-5xl px-4 pb-20">
        {/* Lienzo del Certificado Oficial con tipografía Montserrat integrada */}
        <section
          aria-label="Documento de Certificado Digital"
          className="relative mx-auto w-full max-w-4xl overflow-hidden rounded-2xl border border-border/80 bg-white shadow-2xl"
        >
          <div className={`relative aspect-[1024/608] w-full select-none ${montserrat.className}`}>
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
              <h1 className="truncate text-[clamp(14px,2.4vw,26px)] font-bold uppercase tracking-wide text-slate-900 drop-shadow-xs">
                {certificate.participant_name}
              </h1>
            </div>

            {/* 2. Nombre del Curso: en negrita y color azul institucional debajo de 'Por haber completado...' */}
            <div
              className="absolute left-[59.2%] top-[57.5%] -translate-x-1/2 -translate-y-1/2 text-center"
              style={{ width: "70%" }}
            >
              <p className="line-clamp-2 text-[clamp(11px,1.9vw,21px)] font-bold text-[#1e3a8a]">
                {certificate.course_name}
              </p>
            </div>

            {/* 3. Párrafo descriptivo dinámico: tono gris/azul slate oscuro text-slate-800 (#1e293b), tamaño text-[12.5px], font-semibold */}
            <div
              className="absolute left-[59.2%] top-[63.8%] -translate-x-1/2 -translate-y-1/2 text-center"
              style={{ width: "74%", maxWidth: "74%" }}
            >
              <p className="text-[clamp(9.5px,1.2vw,12.5px)] font-semibold leading-[1.38] text-slate-800">
                Realizado en los ambientes del Departamento de Informática y Sistemas de la Facultad de Ciencias y Tecnología, emitido el {issued}, con una duración de{" "}
                <span className="font-bold text-slate-900">{certificate.hours} horas académicas</span>.
              </p>
            </div>

            {/* 4. Fecha de Emisión: alineada a la izquierda partiendo desde la derecha de la coma de 'Cochabamba,' con espacio limpio */}
            <div className="absolute left-[58%] top-[69.2%] -translate-y-1/2 whitespace-nowrap text-left">
              <span className="text-[clamp(9px,1.15vw,12px)] font-medium text-slate-800">
                {issued}
              </span>
            </div>

            {/* 5. Código de verificación: arriba del recuadro del QR con margen claro */}
            <div className="absolute right-[2.6%] top-[69%] z-10 w-[9.8%] text-center">
              <p className="font-mono text-[clamp(7px,0.85vw,10.5px)] font-bold tracking-widest text-[#1e3a8a]">
                CÓDIGO: {certificate.code}
              </p>
            </div>

            {/* 6. Contenedor con fondo blanco sólido (bg-white z-10) que enmascara y cubre por completo el QR viejo y CERTIFICADO del fondo */}
            <div
              className="absolute right-[2.6%] bottom-[4.2%] z-10 flex items-center justify-center rounded-md bg-white p-1.5 shadow-xs"
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