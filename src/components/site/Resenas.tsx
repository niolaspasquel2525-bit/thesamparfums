import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { MessageSquareQuote, X } from "lucide-react";
import { cargarResenas, type Resena } from "@/lib/resenas";
import { Ornament } from "./Ornament";

/** Quita comillas que el cliente haya puesto al inicio o al final, para envolver siempre con las nuestras. */
const sinComillas = (t: string) =>
  t
    .trim()
    .replace(/^["'“”‘’«»]+|["'“”‘’«»]+$/g, "")
    .trim();

/** Tarjeta de tamaño fijo: la foto, cuatro líneas de texto como máximo y "Ver reseña". */
function TarjetaResena({ r, onAbrir }: { r: Resena; onAbrir: () => void }) {
  return (
    <li className="w-48 shrink-0 snap-start sm:w-56">
      <button
        type="button"
        onClick={onAbrir}
        aria-label="Abrir reseña completa"
        className="group flex h-full w-full flex-col overflow-hidden rounded-2xl border border-border bg-background text-left shadow-sm transition-colors hover:border-gold/60"
      >
        <img
          src={r.imagen}
          alt="Foto enviada por un cliente"
          loading="lazy"
          className="aspect-[4/5] w-full shrink-0 object-cover transition-transform duration-500 group-hover:scale-[1.02]"
        />
        <span className="flex flex-1 flex-col p-3">
          <span className="line-clamp-4 h-[4.82rem] overflow-hidden text-sm leading-snug text-foreground">
            “{sinComillas(r.texto)}”
          </span>
          <span className="label-caps mt-2 text-[0.62rem] text-gold underline-offset-4 group-hover:text-gold-bright group-hover:underline">
            Ver más
          </span>
        </span>
      </button>
    </li>
  );
}

/** Ventana con la reseña completa y una invitación a empezar una nueva experiencia. */
function DetalleResena({ r, onCerrar }: { r: Resena; onCerrar: () => void }) {
  useEffect(() => {
    const alTeclear = (e: KeyboardEvent) => e.key === "Escape" && onCerrar();
    document.addEventListener("keydown", alTeclear);
    const antes = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", alTeclear);
      document.body.style.overflow = antes;
    };
  }, [onCerrar]);

  return createPortal(
    <div
      className="fixed inset-0 z-[95] flex items-center justify-center bg-foreground/55 p-4 backdrop-blur-[2px] animate-in duration-300 fade-in"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onCerrar();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Reseña de un cliente"
        className="relative flex max-h-[94dvh] w-full max-w-md animate-in flex-col overflow-hidden rounded-3xl border border-gold/50 bg-card shadow-[0_30px_80px_-20px_rgba(20,19,17,0.6)] duration-300 zoom-in-95"
      >
        <button
          type="button"
          onClick={onCerrar}
          aria-label="Cerrar"
          className="absolute top-3 right-3 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background/90 text-foreground shadow transition-colors hover:border-gold hover:text-gold-bright"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="min-h-0 flex-1 overflow-y-auto">
          <img
            src={r.imagen}
            alt="Foto enviada por un cliente"
            className="max-h-[38dvh] w-full bg-white object-contain"
          />
          <div className="p-6">
            <p className="label-caps flex items-center gap-2 text-[0.65rem] text-gold">
              <MessageSquareQuote aria-hidden="true" className="h-3.5 w-3.5" />
              Reseña de un cliente
            </p>
            <p className="display-italic mt-3 text-2xl leading-snug whitespace-pre-line text-foreground">
              “{sinComillas(r.texto)}”
            </p>
          </div>
        </div>

        <div className="border-t border-border bg-card p-4 text-center">
          <p className="text-sm text-muted-foreground">¿Quieres vivir la misma experiencia?</p>
          <Link
            to="/catalogo"
            onClick={onCerrar}
            className="label-caps mt-3 block rounded-full border border-gold bg-gold px-8 py-3.5 text-center text-background transition-colors hover:border-gold-bright hover:bg-gold-bright"
          >
            Empieza tu nueva experiencia
          </Link>
        </div>
      </div>
    </div>,
    document.body,
  );
}

/** Reseñas de clientes: franja compacta al final de la portada, siempre visible. */
export function Resenas() {
  const { data } = useQuery({
    queryKey: ["resenas"],
    queryFn: cargarResenas,
    staleTime: 60_000,
  });
  const resenas = data?.resenas ?? [];
  const [abierta, setAbierta] = useState<Resena | null>(null);

  return (
    <section id="resenas" className="scroll-mt-28 border-t border-border bg-card/40">
      <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 sm:py-20">
        <Ornament />
        <h2 className="display-italic mt-6 text-center text-3xl text-foreground sm:text-5xl">
          {resenas.length > 0 ? "Lo que dicen nuestros clientes" : "Tu opinión cuenta"}
        </h2>
        <p className="mx-auto mt-3 max-w-md text-center text-sm text-muted-foreground">
          {resenas.length > 0
            ? "Opiniones reales de quienes ya probaron nuestros decants."
            : "¿Ya probaste tus decants? Sube la foto de tu pedido y cuéntanos cómo te fue."}
        </p>

        {resenas.length > 0 && (
          <ul
            className="-mx-5 mt-8 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-3 sm:mx-0 sm:justify-center sm:px-0 [&::-webkit-scrollbar]:hidden"
            aria-label="Reseñas de clientes"
          >
            {resenas.map((r) => (
              <TarjetaResena key={r.id} r={r} onAbrir={() => setAbierta(r)} />
            ))}
          </ul>
        )}

        <div className="mt-8 text-center">
          <Link
            to="/resenas"
            className="label-caps inline-flex items-center gap-2 border border-gold bg-gold px-8 py-3 text-background transition-colors hover:border-gold-bright hover:bg-gold-bright"
          >
            <MessageSquareQuote aria-hidden="true" className="h-4 w-4" />
            Deja tu reseña
          </Link>
        </div>
      </div>
      {abierta && <DetalleResena r={abierta} onCerrar={() => setAbierta(null)} />}
    </section>
  );
}
