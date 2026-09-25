# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- Admin (departamento): publica la oferta de formación continua y, más adelante, registra pagos y emisiones.
- Instructor: dicta el curso; en este incremento solo entra a su panel.
- Estudiante: se registra e inicia sesión para ver la oferta (catálogo en HU-02).
- Público: verifica certificados sin cuenta (HU-06; fuera de este incremento).

## Product Purpose

EVA 2026 es la plataforma de formación continua del departamento. Permite gestionar cursos y emitir un certificado digital verificable por URL. El éxito de este incremento es entrar con un rol y no cruzar a paneles ajenos.

## Positioning

El certificado lleva un código público comprobablesin login (`/certificado/[codigo]`). Eso aún no se construye; el modelo de roles existe para que, al emitirlo, cada actor ya esté separado.

## Operating Context

Proyecto universitario (no producción). Auth local con Supabase en Docker. Cuentas de demostración ya confirmadas para la defensa. Confirmación de correo desactivada en desarrollo.

## Capabilities and Constraints

- Login y registro con correo y contraseña (sin OAuth en este incremento).
- El registro público crea solo el rol estudiante. Admin e instructor salen del seeder.
- HU-02 (ABM de cursos) no está en este incremento; los paneles muestran un contenedor de cursos.
- Fuera de alcance aquí: pasarela de pago, LinkedIn, PDF.

## Brand Commitments

- Nombre: EVA 2026.
- Interfaz siempre oscura, sin tema claro, en la línea de Vercel (dashboard).
- Voz: castellano, directa, sin jerga de producto interno.

## Evidence on Hand

- `criterios.md`: flujo académico y ejemplo de certificado.
- `product-backlog.md`: HUs y roles.
- No hay logo institucional ni fotografías oficiales; no inventar sellos UMSS.

## Product Principles

- El certificado es el destino; cada HU deja datos que no haya que rehacer.
- Un rol, un panel; el estudiante no administra.
- Demo al docente sin correo: seed confirmado.
- Oscuro fijo; la tarea manda sobre la ornamentación.

## Accessibility & Inclusion

Contraste usable en oscuro, foco de teclado visible, respetar `prefers-reduced-motion`.
