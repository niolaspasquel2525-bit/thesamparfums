import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";

export function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    // Los toasts que sigan en pantalla al abrir el modal recalculan mal su
    // altura apenas el body queda con overflow:hidden (bug de interacción
    // con Sonner) — los descartamos para que no quede un toast gigante.
    toast.dismiss();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  // Portal directo a <body>: así el modal siempre queda por encima de
  // cualquier contenedor padre con su propio stacking context (ej. el
  // <header> sticky), sin importar dónde se monte este componente.
  return createPortal(
    <div
      className="fixed inset-0 z-[80] overflow-y-auto overscroll-contain bg-background/85 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* min-h-full: si el contenido es más alto que la pantalla, el cajón crece y se puede
          deslizar hasta arriba (con items-end directo en el contenedor, el título y el
          botón "Cerrar" quedaban fuera de la pantalla y la ficha parecía congelada). */}
      <div
        className="flex min-h-full items-end justify-center sm:items-center sm:p-6"
        onMouseDown={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div className="w-full max-w-xl border border-border bg-card px-6 pt-8 pb-[calc(2rem+env(safe-area-inset-bottom,0px))] shadow-[0_0_60px_rgba(0,0,0,0.7)] sm:px-10 sm:pt-10 sm:pb-10">
          <div className="flex items-start justify-between gap-6">
            <h2 className="display-italic text-3xl text-foreground">{title}</h2>
            <button
              type="button"
              onClick={onClose}
              className="label-caps text-muted-foreground transition-colors hover:text-gold-bright"
            >
              Cerrar
            </button>
          </div>
          <span className="mt-5 mb-6 block h-px w-full bg-border" />
          {children}
        </div>
      </div>
    </div>,
    document.body,
  );
}
