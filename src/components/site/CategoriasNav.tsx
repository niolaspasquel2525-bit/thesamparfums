import { useEffect, useRef } from "react";
import { BOTELLAS_COMPLETAS, COMBOS, TODAS } from "@/lib/thesamparfums";
import { conBannerLocal, type CatalogoCategoria } from "@/lib/apariencia";
import { CATEGORIAS } from "@/lib/categorias-data";
import { cn } from "@/lib/utils";
import { FotoPerfume } from "./FotoPerfume";

const RESPALDO: CatalogoCategoria[] = CATEGORIAS;

/** Las categorías que se muestran como círculos, en este orden. */
const PRINCIPALES: readonly string[] = [
  "Árabes",
  "Diseñador",
  "Nicho",
  "Testers",
  BOTELLAS_COMPLETAS,
  COMBOS,
];

/** Fila de categorías con una foto redonda cada una (se desliza de lado en el celular). */
export function CategoriasNav({
  categoria,
  onSelect,
}: {
  categoria: string;
  onSelect: (slug: string) => void;
}) {
  const todas: CatalogoCategoria[] = RESPALDO.map(conBannerLocal);
  const items = PRINCIPALES.map(
    (slug) =>
      todas.find((c) => c.slug === slug) ??
      RESPALDO.find((c) => c.slug === slug) ?? {
        id: slug,
        slug,
        etiqueta: slug,
        icono: null,
        imagen_url: null,
        visible: true,
        orden: 0,
      },
  ).map(conBannerLocal);
  const activoRef = useRef<HTMLButtonElement>(null);

  // Al abrir una categoría desde la portada, la deja a la vista dentro de la fila.
  useEffect(() => {
    activoRef.current?.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
  }, [categoria]);

  return (
    <div className="-mx-5 mt-12 overflow-x-auto px-5 pb-3 [scrollbar-width:none] sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden">
      <div
        role="tablist"
        aria-label="Categorías"
        className="mx-auto flex w-max min-w-full gap-4 sm:justify-center sm:gap-6"
      >
        {items.map((c) => {
          const activa = categoria === c.slug;
          return (
            <button
              key={c.slug}
              ref={activa ? activoRef : undefined}
              role="tab"
              type="button"
              aria-selected={activa}
              onClick={() => onSelect(activa ? TODAS : c.slug)}
              className="group flex w-[4.6rem] shrink-0 flex-col items-center gap-2 sm:w-24"
            >
              <span
                className={cn(
                  "relative flex h-[4.2rem] w-[4.2rem] items-center justify-center overflow-hidden rounded-full border-2 bg-white transition-all duration-300 sm:h-20 sm:w-20",
                  activa
                    ? "border-gold shadow-[0_8px_24px_-8px_rgba(180,146,76,0.8)]"
                    : "border-border group-hover:border-gold/50",
                )}
              >
                {c.imagen_url ? (
                  <FotoPerfume
                    src={c.imagen_url}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className={
                      c.imagen_url.includes("/banner-")
                        ? `h-full w-full object-cover ${c.imagen_url.includes("banner-botellas") ? "object-[center_24%]" : "object-[center_55%]"}`
                        : "h-full w-full object-contain p-1.5"
                    }
                  />
                ) : (
                  <span aria-hidden="true" className="display-italic text-2xl text-neutral-400">
                    {c.etiqueta.charAt(0)}
                  </span>
                )}
              </span>
              <span
                className={cn(
                  "label-caps text-center text-[0.58rem] leading-tight transition-colors sm:text-[0.62rem]",
                  activa ? "text-gold-bright" : "text-muted-foreground group-hover:text-foreground",
                )}
              >
                {c.etiqueta}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
