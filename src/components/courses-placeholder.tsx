export function CoursesPlaceholder({
  title,
  body,
}: {
  title: string;
  body: string;
}) {
  return (
    <section>
      <h1 className="text-xl font-semibold tracking-tight text-white">{title}</h1>
      <p className="mt-2 max-w-xl text-sm leading-6 text-zinc-500">{body}</p>
      <div className="mt-8 rounded-lg border border-dashed border-line px-5 py-10 text-sm text-zinc-500">
        Todavía no hay cursos. La gestión de la oferta se implementa en el
        siguiente incremento.
      </div>
    </section>
  );
}
