import { PDFDocument, StandardFonts, rgb, type PDFFont } from "pdf-lib";
import { getPublicCertificate } from "@/lib/certificates/public";
import {
  certificatePath,
  formatIssuedDate,
  siteUrl,
} from "@/lib/certificates/types";

const ACCENT = rgb(0.118, 0.227, 0.541); // #1e3a8a
const GOLD = rgb(0.784, 0.635, 0.29); // #c8a24a
const MUTED = rgb(0.333, 0.376, 0.475);
const INK = rgb(0.059, 0.09, 0.165);

export async function GET(
  _request: Request,
  { params }: RouteContext<"/certificado/[codigo]/pdf">,
) {
  const { codigo } = await params;
  const certificate = await getPublicCertificate(codigo);

  if (!certificate) {
    return new Response("Certificado no encontrado", { status: 404 });
  }

  const pdf = await PDFDocument.create();
  pdf.setTitle(`Certificado ${certificate.code}`);
  pdf.setAuthor("EVA 2026");
  pdf.setSubject(certificate.course_name);

  // A4 apaisado
  const page = pdf.addPage([841.89, 595.28]);
  const { width, height } = page.getSize();
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);

  page.drawRectangle({
    x: 24,
    y: 24,
    width: width - 48,
    height: height - 48,
    borderColor: ACCENT,
    borderWidth: 2,
  });
  page.drawRectangle({
    x: 34,
    y: 34,
    width: width - 68,
    height: height - 68,
    borderColor: GOLD,
    borderWidth: 0.75,
  });
  page.drawRectangle({ x: 24, y: height - 36, width: width - 48, height: 12, color: ACCENT });

  const center = (text: string, y: number, font: PDFFont, size: number, color = INK) => {
    const fitted = fit(text, font, size, width - 140);
    page.drawText(fitted.text, {
      x: (width - font.widthOfTextAtSize(fitted.text, fitted.size)) / 2,
      y,
      size: fitted.size,
      font,
      color,
    });
  };

  center("EVA 2026 · FORMACIÓN CONTINUA", height - 90, bold, 13, GOLD);
  center("CERTIFICADO", height - 150, bold, 40);
  center(`de ${certificate.kind.toLowerCase()}`, height - 178, regular, 16, MUTED);
  center("Se otorga a", height - 235, regular, 14, MUTED);
  center(certificate.participant_name, height - 278, bold, 32);
  center("por haber aprobado el curso", height - 318, regular, 14, MUTED);
  center(certificate.course_name, height - 352, bold, 22, ACCENT);
  center(
    `con una duración de ${certificate.hours} horas académicas`,
    height - 382,
    regular,
    14,
    MUTED,
  );

  const publicUrl = `${siteUrl()}${certificatePath(certificate.code)}`;
  page.drawText(`Emitido el ${formatIssuedDate(certificate.issued_at)}`, {
    x: 70,
    y: 96,
    size: 12,
    font: regular,
    color: INK,
  });
  page.drawText(`Verificación: ${publicUrl}`, {
    x: 70,
    y: 76,
    size: 10,
    font: regular,
    color: MUTED,
  });
  const codeLabel = "CÓDIGO";
  page.drawText(codeLabel, {
    x: width - 70 - regular.widthOfTextAtSize(codeLabel, 10),
    y: 112,
    size: 10,
    font: regular,
    color: MUTED,
  });
  page.drawText(certificate.code, {
    x: width - 70 - bold.widthOfTextAtSize(certificate.code, 22),
    y: 84,
    size: 22,
    font: bold,
    color: ACCENT,
  });

  const bytes = await pdf.save();
  return new Response(new Uint8Array(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="certificado-${certificate.code}.pdf"`,
      "Cache-Control": "public, max-age=3600",
    },
  });
}

function fit(text: string, font: PDFFont, size: number, maxWidth: number) {
  let current = size;
  while (current > 10 && font.widthOfTextAtSize(text, current) > maxWidth) {
    current -= 1;
  }
  return { text, size: current };
}
