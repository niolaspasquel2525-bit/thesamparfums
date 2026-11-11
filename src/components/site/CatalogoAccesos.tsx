import { Link } from "@tanstack/react-router";
import { ArrowRight, PackageCheck, PackageSearch, TestTube } from "lucide-react";
import { BAJO_PEDIDO, BOTELLAS_COMPLETAS, TABS_CATALOGO } from "@/lib/thesamparfums";
import { CONFIG_SITIO_DEFAULT, conBannerLocal } from "@/lib/apariencia";
import { CATEGORIAS } from "@/lib/categorias-data";
import { Ornament } from "./Ornament";

export function CatalogoAccesos() {
  const tiles = CATEGORIAS.map(conBannerLocal);

  const titulo = CONFIG_SITIO_DEFAULT.catalogo_titulo;
  const descripcion = CONFIG_SITIO_DEFAULT.catalogo_descripcion;

  return (
    <section id="catalogo" className="relative mx-auto max-w-6xl px-5 py-14 sm:px-8 sm:py-20">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[28rem] bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(180,146,76,0.09),transparent_70%)]"
      />

      <Ornament />
      <h2 className="display-italic mt-7 text-center text-4xl text-foreground sm:text-5xl">
        {titulo}
      </h2>
      <p className="mx-auto mt-4 max-w-md text-center text-sm text-muted-foreground">
        {descripcion}
      </p>

      <div className="mt-12 grid grid-cols-2 gap-4 lg:grid-cols-5 [&>*:last-child:nth-child(odd)]:col-span-2 lg:[&>*:last-child:nth-child(odd)]:col-span-1">
        {tiles.map((c) =>
          c.imagen_url ? (
            <Link
              key={c.id}
              to="/catalogo"
              search={{ categoria: c.slug as (typeof TABS_CATALOGO)[number] }}
              className="group relative flex aspect-[4/5] flex-col overflow-hidden rounded-2xl border border-border bg-card/40 transition-all duration-300 hover:-translate-y-1 hover:border-gold/60 hover:shadow-[0_20px_50px_-20px_rgba(180,146,76,0.4)]"
            >
              <span className="relative flex-1 overflow-hidden bg-white">
                <img
                  src={c.imagen_url}
                  alt=""
                  loading="lazy"
                  className={`absolute inset-0 h-full w-full transition-transform duration-500 group-hover:scale-105 ${
                    c.imagen_url.includes("/banner-")
                      ? `object-cover ${c.imagen_url.includes("banner-botellas") ? "object-[center_20%]" : "object-[center_55%]"}`
                      : "object-contain p-3"
                  }`}
                />
              </span>
              <span className="flex items-center justify-between gap-2 px-4 py-3.5">
                <span className="display-italic text-xl text-foreground transition-colors duration-300 group-hover:text-gold-bright sm:text-2xl">
                  {c.etiqueta}
                </span>
                <ArrowRight
                  aria-hidden="true"
                  className="h-4 w-4 shrink-0 text-gold transition-transform duration-300 group-hover:translate-x-1"
                />
              </span>
            </Link>
          ) : (
            <Link
              key={c.id}
              to="/catalogo"
              search={{ categoria: c.slug as (typeof TABS_CATALOGO)[number] }}
              className="group relative flex aspect-[4/5] flex-col items-center justify-center gap-4 overflow-hidden rounded-2xl border border-border bg-gradient-to-b from-card/50 to-card/10 px-4 transition-all duration-300 hover:-translate-y-1 hover:border-gold/60 hover:shadow-[0_20px_50px_-20px_rgba(180,146,76,0.4)]"
            >
              {c.icono ? (
                <span
                  aria-hidden="true"
                  className="display-italic text-4xl text-gold/25 transition-colors duration-300 group-hover:text-gold/50"
                >
                  {c.icono}
                </span>
              ) : c.slug === BAJO_PEDIDO ? (
                <PackageSearch
                  aria-hidden="true"
                  className="h-8 w-8 text-gold/40 transition-colors duration-300 group-hover:text-gold"
                />
              ) : c.slug === "Testers" ? (
                <TestTube
                  aria-hidden="true"
                  className="h-8 w-8 text-gold/40 transition-colors duration-300 group-hover:text-gold"
                />
              ) : c.slug === BOTELLAS_COMPLETAS ? (
                <PackageCheck
                  aria-hidden="true"
                  className="h-8 w-8 text-gold/40 transition-colors duration-300 group-hover:text-gold"
                />
              ) : (
                <span
                  aria-hidden="true"
                  className="display-italic text-4xl text-gold/25 transition-colors duration-300 group-hover:text-gold/50"
                >
                  {c.etiqueta.charAt(0)}
                </span>
              )}
              <span className="label-caps text-foreground transition-colors duration-300 group-hover:text-gold-bright">
                {c.etiqueta}
              </span>
            </Link>
          ),
        )}
      </div>

      <div className="mt-12 text-center">
        <Link
          to="/catalogo"
          className="label-caps inline-flex items-center gap-2 border border-gold px-7 py-3.5 text-gold transition-colors hover:bg-gold hover:text-background"
        >
          Ver catálogo completo
          <ArrowRight aria-hidden="true" className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
