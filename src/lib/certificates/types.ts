export type PublicCertificate = {
  code: string;
  participant_name: string;
  course_name: string;
  hours: number;
  kind: string;
  issued_at: string;
};

export const CERTIFICATE_CODE_PATTERN = /^[0-9A-F]{8}$/;

export function normalizeCertificateCode(value: string) {
  const code = value.trim().toUpperCase();
  return CERTIFICATE_CODE_PATTERN.test(code) ? code : null;
}

export function certificatePath(code: string) {
  return `/certificado/${code}`;
}

export function formatIssuedDate(value: string) {
  return new Intl.DateTimeFormat("es-BO", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "America/La_Paz",
  }).format(new Date(value));
}

export function siteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(
    /\/$/,
    "",
  );
}
