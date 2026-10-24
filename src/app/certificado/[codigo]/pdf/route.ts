import fs from "fs";
import path from "path";
import { PDFDocument, StandardFonts, rgb, type PDFFont } from "pdf-lib";
import QRCode from "qrcode";
import { getSessionProfile } from "@/lib/auth/profile";
import { getPublicCertificate } from "@/lib/certificates/public";
import {
  certificatePath,
  formatIssuedDate,
  siteUrl,
} from "@/lib/certificates/types";

const NAVY = rgb(0.118, 0.227, 0.541); // #1e3a8a (azul institucional UMSS)
const INK_DARK = rgb(0.06, 0.09, 0.16); // #0f172a
const PARAGRAPH_COLOR = rgb(0.18, 0.24, 0.32); // #1e293b (tono oscuro institucional nítido)

export async function GET(
  _request: Request,
  { params }: RouteContext<"/certificado/[codigo]/pdf">,
) {
  const { codigo } = await params;
  const certificate = await getPublicCertificate(codigo);

  if (!certificate) {
    return new Response("Certificado no encontrado", { status: 404 });
  }

  const profile = await getSessionProfile();
  const isAdmin = profile?.role === "admin";

  if (!certificate.is_validated && !isAdmin) {
    return new Response(
      "Certificado pendiente de aprobación por administración",
      { status: 403 },
    );
  }

  const pdf = await PDFDocument.create();
  pdf.setTitle(`Certificado ${certificate.code} - ${certificate.participant_name}`);
  pdf.setAuthor("Universidad Mayor de San Simón - FCyT");
  pdf.setSubject(certificate.course_name);

  // A4 Apaisado: 841.89 x 595.28 puntos
  const page = pdf.addPage([841.89, 595.28]);
  const { width, height } = page.getSize();
  const fontRegular = await pdf.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold);

  // 1. Fondo de la plantilla oficial limpia (dibujo directo, 100% transparente)
  const imagePath = path.join(process.cwd(), "public", "certificado-template.png");
  if (fs.existsSync(imagePath)) {
    const imageBytes = fs.readFileSync(imagePath);
    const bgImage = await pdf.embedPng(imageBytes);
    page.drawImage(bgImage, { x: 0, y: 0, width, height });
  }

  // Centro horizontal de la línea de contenido
  const centerContentX = 498;

  // 2. Nombre del estudiante (en mayúsculas centradas justo sobre la primera línea, debajo de OTORGADO A:)
  const student = certificate.participant_name.toUpperCase();
  const studentSize = fitSize(student, fontBold, 22, 14, 530);
  const studentWidth = fontBold.widthOfTextAtSize(student, studentSize);
  page.drawText(student, {
    x: centerContentX - studentWidth / 2,
    y: 332,
    size: studentSize,
    font: fontBold,
    color: INK_DARK,
  });

  // 3. Nombre del curso (en negrita y color azul institucional)
  const course = certificate.course_name;
  const courseSize = fitSize(course, fontBold, 18, 12, 540);
  const courseWidth = fontBold.widthOfTextAtSize(course, courseSize);
  page.drawText(course, {
    x: centerContentX - courseWidth / 2,
    y: 254,
    size: courseSize,
    font: fontBold,
    color: NAVY,
  });

  // 4. Párrafo descriptivo dinámico: tamaño 10.5 pt, color oscuro institucional rgb(0.18, 0.24, 0.32), interlineado 14 pt
  const issuedDateFormatted = formatIssuedDate(certificate.issued_at);
  const descLine1 =
    "Realizado en los ambientes del Departamento de Informática y Sistemas de la";
  const descLine2 = `Facultad de Ciencias y Tecnología, emitido el ${issuedDateFormatted}, con una duración de ${certificate.hours} horas académicas.`;

  const descSize = 10.5;
  page.drawText(descLine1, {
    x: centerContentX - fontRegular.widthOfTextAtSize(descLine1, descSize) / 2,
    y: 225,
    size: descSize,
    font: fontRegular,
    color: PARAGRAPH_COLOR,
  });

  page.drawText(descLine2, {
    x: centerContentX - fontRegular.widthOfTextAtSize(descLine2, descSize) / 2,
    y: 211, // Interlineado de 14 pt exacto (225 - 14)
    size: descSize,
    font: fontRegular,
    color: PARAGRAPH_COLOR,
  });

  // 5. Fecha y Ubicación: x: 485 para empezar exactamente después de la coma de "Cochabamba," sin solapamiento
  page.drawText(issuedDateFormatted, {
    x: 485,
    y: 179,
    size: 11,
    font: fontRegular,
    color: INK_DARK,
  });

  // 6. Parche blanco sólido para cubrir completamente el QR viejo y el texto "CERTIFICADO" de la plantilla
  const patchX = 744;
  const patchY = 32;
  const patchWidth = 74;
  const patchHeight = 88;

  page.drawRectangle({
    x: patchX,
    y: patchY,
    width: patchWidth,
    height: patchHeight,
    color: rgb(1, 1, 1),
  });

  // Renderizar el código QR dinámico centrado directamente sobre el parche blanco
  const publicUrl = `${siteUrl()}${certificatePath(certificate.code)}`;
  const qrBuffer = await QRCode.toBuffer(publicUrl, {
    width: 140,
    margin: 0,
    color: { dark: "#0f172a", light: "#ffffff" },
  });
  const qrImage = await pdf.embedPng(qrBuffer);

  const qrSize = 58;
  const qrX = patchX + (patchWidth - qrSize) / 2;
  const qrY = patchY + (patchHeight - qrSize) / 2;
  page.drawImage(qrImage, {
    x: qrX,
    y: qrY,
    width: qrSize,
    height: qrSize,
  });

  // 7. Código de verificación: arriba del parche blanco con margen limpio
  const codeLabel = `CÓDIGO: ${certificate.code}`;
  const codeWidth = fontBold.widthOfTextAtSize(codeLabel, 8.5);
  page.drawText(codeLabel, {
    x: patchX + (patchWidth - codeWidth) / 2,
    y: patchY + patchHeight + 10,
    size: 8.5,
    font: fontBold,
    color: NAVY,
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

function fitSize(
  text: string,
  font: PDFFont,
  startSize: number,
  minSize: number,
  maxWidth: number,
) {
  let size = startSize;
  while (size > minSize && font.widthOfTextAtSize(text, size) > maxWidth) {
    size -= 0.5;
  }
  return size;
}