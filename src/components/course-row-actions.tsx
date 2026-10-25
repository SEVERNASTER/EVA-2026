"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { setCoursePublished } from "@/app/actions/courses";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Icon } from "@/components/ui/icon";

export function CourseRowActions({
  id,
  name,
  published,
}: {
  id: string;
  name: string;
  published: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [ask, setAsk] = useState(false);
  const [pending, setPending] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onPointer(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  async function togglePublished() {
    setPending(true);
    await setCoursePublished(id, !published);
    setPending(false);
    setAsk(false);
    setOpen(false);
  }

  return (
    <div ref={rootRef} className="relative flex justify-end">
      <button
        type="button"
        className="inline-flex size-9 items-center justify-center rounded-2xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Acciones de ${name}`}
        onClick={() => setOpen((value) => !value)}
      >
        <Icon name="more_horiz" size={20} />
      </button>
      {open ? (
        <div
          role="menu"
          className="absolute right-0 top-10 z-20 min-w-44 rounded-2xl border border-border bg-popover p-1 text-popover-foreground shadow-lg"
        >
          <Link
            role="menuitem"
            className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted"
            href={`/admin/cursos/${id}`}
            onClick={() => setOpen(false)}
          >
            <Icon name="edit" size={16} />
            Editar
          </Link>
          <button
            role="menuitem"
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-foreground transition-colors hover:bg-muted"
            type="button"
            onClick={() => setAsk(true)}
          >
            <Icon name={published ? "visibility_off" : "publish"} size={16} />
            {published ? "Despublicar" : "Publicar"}
          </button>
        </div>
      ) : null}
      <ConfirmDialog
        open={ask}
        title={published ? "Despublicar curso" : "Publicar curso"}
        body={
          published
            ? `${name} dejará de verse en el catálogo de estudiantes.`
            : `${name} quedará visible para preinscripción.`
        }
        confirmLabel={published ? "Despublicar" : "Publicar"}
        pending={pending}
        onCancel={() => setAsk(false)}
        onConfirm={togglePublished}
      />
    </div>
  );
}
