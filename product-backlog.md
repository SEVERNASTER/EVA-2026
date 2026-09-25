# Product backlog — EVA 2026

Plataforma de formación continua con certificación digital verificable. El certificado es la capacidad principal; cursos, inscripción, asistencia y evaluación son el recorrido que permite emitirlo con datos consistentes.

Documento de trabajo: historias de usuario ordenadas para implementación y seguimiento.

## Roles

| Rol | Responsabilidad |
| --- | --- |
| Admin (departamento) | Gestión de cursos, inscripción, registro de pago en caja y becas. Puede cubrir funciones de instructor cuando el curso lo requiera. |
| Instructor | Sesiones, control de asistencia del estudiante y evaluación. |
| Estudiante | Consulta de cursos, preinscripción, inscripción y consulta de elegibilidad o certificado. |
| Público | Verificación de un certificado en `/certificado/[codigo]`, sin autenticación. |

## Fuera de alcance

- Pasarela de pago externa (el pago se registra en el sistema, en representación de caja facultativa).
- Control de asistencia del instructor.
- Certificado físico como artefacto distinto (el PDF es el documento oficial descargable).

## Historias de usuario

---

### HU-01 — Autenticación y roles

**Sprint 1**

Como usuario del sistema, quiero registrarme e iniciar sesión con un rol asignado, para acceder únicamente a las funciones que me corresponden.

**Criterios de aceptación**
- Registro e inicio de sesión con correo y contraseña.
- Roles: admin, instructor y estudiante. El público no requiere cuenta.
- Tras el login, el usuario entra a un panel según su rol, con la navegación y las acciones de ese perfil.
- Un estudiante no accede a rutas de administración.
- Existen cuentas de prueba para admin, instructor y estudiante.

---

### HU-02 — Gestión y publicación de cursos

**Sprint 2**

Como admin, quiero registrar y publicar cursos (nombre, contenido, horas, horario, instructor y criterios de aprobación), para que los estudiantes consulten la oferta vigente.

**Criterios de aceptación**
- El admin crea, edita, publica y despublica un curso.
- El estudiante consulta únicamente cursos publicados.
- El curso incluye: nombre, contenido, horas, horario, instructor, nota mínima y porcentaje mínimo de asistencia.

---

### HU-03 — Preinscripción e inscripción

**Sprint 2 o 3**

Como estudiante, quiero preinscribirme a un curso e inscribirme con el precio que me corresponde, para quedar registrado como participante.

**Criterios de aceptación**
- Preinscripción con estado pendiente de pago.
- Precios diferenciados según categoría del participante (por ejemplo regular, auxiliar ad-honorem u otra beca).
- El admin registra el pago en caja o aplica la beca y confirma la inscripción.
- El participante inscrito queda asociado al curso.

---

### HU-04 — Sesiones, asistencia y evaluación

**Sprint 3**

Como instructor, quiero registrar las sesiones, la asistencia de los estudiantes y la nota, para contar con los datos de aprobación del curso.

**Criterios de aceptación**
- Alta de sesiones por curso.
- Registro de asistencia del estudiante por sesión.
- Una nota por inscripción (escala 0–100).

---

### HU-05 — Elegibilidad para certificación

**Sprint 3 o 4**

Como estudiante o admin, quiero conocer si el participante cumple los criterios de aprobación, para saber si corresponde emitir el certificado.

**Criterios de aceptación**
- Apto si la nota es mayor o igual al umbral del curso (por ejemplo 70/100) y la asistencia alcanza el porcentaje mínimo.
- Si no es apto, el sistema indica el criterio que no se cumplió (nota o asistencia).
- La emisión del certificado y el PDF corresponden a HU-06.

---

### HU-06 — Certificado digital verificable

**Sprint 4**

Como titular del certificado o como tercero, quiero un documento con código de verificación y una URL pública, para comprobar su validez sin iniciar sesión. Como titular, quiero poder compartir esa URL en LinkedIn de forma que la publicación muestre los datos del certificado.

**Criterios de aceptación**
- Solo se emite si el participante es apto (HU-05).
- Código único de verificación (por ejemplo `8F72A91C`).
- Página pública `/certificado/[codigo]` con participante, curso, duración, tipo, fecha de emisión y código.
- Descarga del certificado en PDF.
- Metadatos Open Graph en la página pública (título, descripción e imagen) para que, al compartir el enlace en LinkedIn, se vea una vista previa del certificado.

---

## Plan de sprints

| Sprint | Entregable | Objetivo |
| --- | --- | --- |
| **1** | **HU-01** | Identidad, roles y control de acceso. Demo: tres perfiles y restricción de rutas. |
| 2 | HU-02 y, si el incremento cierra, HU-03 | Oferta de cursos e inscripción. |
| 3 | HU-04 y HU-05 | Desarrollo del curso y criterio de aprobación. |
| 4 | HU-06 | Emisión, verificación pública y compartir en LinkedIn. |
