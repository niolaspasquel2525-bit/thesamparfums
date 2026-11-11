import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "@tanstack/react-router";
import { Sparkles, X } from "lucide-react";
import { esPreventa, type TABS_CATALOGO } from "@/lib/thesamparfums";
import { dinero } from "@/lib/precios-home";
import { precioDesdeNuevo, useNuevosIngresos } from "@/lib/nuevos";

const CLAVE = "thesamparfums-nuevos-vistos";
const INTERVALO_MS = 3200;
const PAUSA_MS = 9000;

/** Ventana que aparece al entrar a la portada y presenta los perfumes nuevos, uno sobre otro. */
export function NuevosIngresos() {
  const [abierto, setAbierto] = useState(false);
  const [activo, setActivo] = useState(0);
  const { data } = useNuevosIngresos(6);
  const lista = data ?? [];
  const n = lista.length;
  const hastaRef = useRef(0);
  const cambioRef = useRef(0);
  const toqueX = useRef<number | null>(null);

  useEffect(() => {
    if (n === 0) return;
    try {
      if (sessionStorage.getItem(CLAVE)) return;
      sessionStorage.setItem(CLAVE, "1");
    } catch {
      /* sin almacenamiento: se muestra igual una vez por carga */
    }
    const t = window.setTimeout(() => setAbierto(true), 900);
    return () => window.clearTimeout(t);
  }, [n]);

  useEffect(() => {
    if (!abierto) return;
    const alTeclear = (e: KeyboardEvent) => e.key === "Escape" && setAbierto(false);
    document.addEventListener("keydown", alTeclear);
    const antes = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", alTeclear);
      document.body.style.overflow = antes;
    };
  }, [abierto]);

  // Pasa solo cada pocos segundos; si la persona interactúa, espera un rato antes de seguir.
  useEffect(() => {
    if (!abierto || n < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    cambioRef.current = Date.now();
    const t = window.setInterval(() => {
      const ahora = Date.now();
      if (ahora < hastaRef.current || ahora - cambioRef.current < INTERVALO_MS) return;
      cambioRef.current = ahora;
      setActivo((a) => (a + 1) % n);
    }, 300);
    return () => window.clearInterval(t);
  }, [abierto, n]);

  const ir = (i: number) => {
    setActivo(((i % n) + n) % n);
    cambioRef.current = Date.now();
    hastaRef.current = Date.now() + PAUSA_MS;
  };

  if (n === 0 || !abierto) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[95] flex items-center justify-center bg-foreground/55 p-4 backdrop-blur-[2px] animate-in duration-300 fade-in"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) setAbierto(false);
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Novedades"
        className="relative max-h-[94dvh] w-full max-w-md animate-in overflow-y-auto rounded-3xl border border-gold/50 bg-card shadow-[0_30px_80px_-20px_rgba(20,19,17,0.6)] duration-300 zoom-in-95"
      >
        <button
          type="button"
          onClick={() => setAbierto(false)}
          aria-label="Cerrar"
          className="absolute top-3 right-3 z-40 flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background/90 text-foreground shadow transition-colors hover:border-gold hover:text-gold-bright"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="bg-gold px-6 pt-7 pb-5 text-center text-background">
          <p className="label-caps flex items-center justify-center gap-2 text-[0.65rem]">
            <Sparkles aria-hidden="true" className="h-3.5 w-3.5" />
            Recién llegados
            <Sparkles aria-hidden="true" className="h-3.5 w-3.5" />
          </p>
          <h2 className="display-italic mt-2 text-4xl leading-none">¡Novedades!</h2>
          <p className="mt-2 text-sm text-background/85">
            Descubre perfumes interesantes que tenemos para ti
          </p>
        </div>

        <div className="p-5">
          <ul
            aria-label="Perfumes nuevos"
            className="relative mx-auto aspect-[4/5] w-full max-w-[17rem] touch-pan-y"
            onTouchStart={(e) => {
              hastaRef.current = Date.now() + PAUSA_MS;
              toqueX.current = e.touches[0]?.clientX ?? null;
            }}
            onTouchEnd={(e) => {
              if (toqueX.current === null) return;
              const dx = (e.changedTouches[0]?.clientX ?? toqueX.current) - toqueX.current;
              toqueX.current = null;
              if (Math.abs(dx) > 40) ir(activo + (dx < 0 ? 1 : -1));
            }}
            onPointerEnter={(e) => {
              if (e.pointerType === "mouse") hastaRef.current = Date.now() + PAUSA_MS;
            }}
          >
            {lista.map((p, i) => {
              const rel = (i - activo + n) % n;
              const posicion =
                rel === 0
                  ? "z-30 translate-x-0 scale-100 opacity-100 [transition-delay:0ms,0ms]"
                  : rel === n - 1 && n > 1
                    ? "z-20 -translate-x-3 scale-[0.94] opacity-0 [transition-delay:0ms,550ms]"
                    : "z-10 translate-x-[115%] scale-100 opacity-0 [transition-delay:0ms,0ms]";
              const desde = precioDesdeNuevo(p);
              return (
                <li
                  key={p.id}
                  aria-hidden={rel !== 0}
                  className={`absolute inset-0 transition-[transform,opacity] duration-700 ease-out ${posicion}`}
                >
                  <Link
                    to="/catalogo"
                    search={{
                      categoria: p.categoria as (typeof TABS_CATALOGO)[number],
                      orden: "recientes",
                    }}
                    onClick={() => setAbierto(false)}
                    tabIndex={rel === 0 ? 0 : -1}
                    className="flex h-full flex-col overflow-hidden rounded-2xl border border-gold/40 bg-background shadow-[0_18px_40px_-18px_rgba(20,19,17,0.5)]"
                  >
                    <span className="relative block flex-1 bg-white">
                      <span className="label-caps absolute top-3 left-3 z-10 rounded-full bg-gold px-3 py-1 text-[0.6rem] text-background shadow">
                        {esPreventa(p.estado) ? "Preventa" : "Nuevo"}
                      </span>
                      {p.imagen_url ? (
                        <img
                          src={p.imagen_url}
                          alt={`${p.marca} ${p.nombre}`}
                          className="absolute inset-0 h-full w-full object-contain p-5"
                        />
                      ) : (
                        <span
                          aria-hidden="true"
                          className="display-italic absolute inset-0 flex items-center justify-center text-7xl text-gold/30"
                        >
                          {p.marca.charAt(0)}
                        </span>
                      )}
                    </span>
                    <span className="block border-t border-border px-4 py-3 text-center">
                      <span className="label-caps block truncate text-[0.62rem] text-muted-foreground">
                        {p.marca}
                      </span>
                      <span className="block truncate font-display text-xl font-medium text-foreground">
                        {p.nombre}
                      </span>
                      {desde !== null && (
                        <span className="block text-sm text-gold-bright">
                          Desde {dinero(desde)}
                        </span>
                      )}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>

          {n > 1 && (
            <div
              className="mt-4 flex items-center justify-center gap-2"
              role="group"
              aria-label="Elegir perfume"
            >
              {lista.map((p, i) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => ir(i)}
                  aria-label={`Ver ${p.marca} ${p.nombre}`}
                  aria-current={i === activo}
                  className="flex h-6 items-center px-0.5"
                >
                  <span
                    className={`block h-1.5 rounded-full transition-all duration-500 ${
                      i === activo ? "w-6 bg-gold" : "w-1.5 bg-foreground/25"
                    }`}
                  />
                </button>
              ))}
            </div>
          )}

          <Link
            to="/catalogo"
            search={{ orden: "recientes" }}
            onClick={() => setAbierto(false)}
            className="label-caps mt-4 block rounded-full border border-gold bg-gold px-8 py-3.5 text-center text-background transition-colors hover:border-gold-bright hover:bg-gold-bright"
          >
            Conoce más
          </Link>
        </div>
      </div>
    </div>,
    document.body,
  );
}
