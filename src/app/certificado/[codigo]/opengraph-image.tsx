import { ImageResponse } from "next/og";
import { getPublicCertificate } from "@/lib/certificates/public";
import { formatIssuedDate } from "@/lib/certificates/types";

export const alt = "Certificado verificable EVA 2026";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ codigo: string }>;
}) {
  const { codigo } = await params;
  const certificate = await getPublicCertificate(codigo);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "linear-gradient(160deg, #1e3a8a 0%, #0b1a4a 100%)",
          color: "#ffffff",
          borderTop: "16px solid #c8a24a",
        }}
      >
        <div style={{ display: "flex", fontSize: 30, color: "#e2c47a" }}>
          EVA 2026 · Certificado verificable
        </div>
        {certificate ? (
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", fontSize: 34, color: "#c7d2fe" }}>
              {`Certificado de ${certificate.kind.toLowerCase()} otorgado a`}
            </div>
            <div
              style={{ display: "flex", fontSize: 68, fontWeight: 700, marginTop: 12 }}
            >
              {certificate.participant_name}
            </div>
            <div style={{ display: "flex", fontSize: 44, marginTop: 20 }}>
              {certificate.course_name}
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", fontSize: 60, fontWeight: 700 }}>
            Certificado no encontrado
          </div>
        )}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 28,
            color: "#c7d2fe",
          }}
        >
          <span>
            {certificate
              ? `${certificate.hours} h · ${formatIssuedDate(certificate.issued_at)}`
              : ""}
          </span>
          <span style={{ letterSpacing: 6, color: "#e2c47a" }}>
            {certificate ? certificate.code : ""}
          </span>
        </div>
      </div>
    ),
    size,
  );
}
