import { useCallback, useEffect, useRef } from "react";
import { Link } from "@tanstack/react-router";
import { Flame } from "lucide-react";
import { esPreventa, type TABS_CATALOGO } from "@/lib/thesamparfums";
import { dinero } from "@/lib/precios-home";
import { useMasVendidos } from "@/lib/mas-vendidos";
import { precioDesdeNuevo, type NuevoIngreso } from "@/lib/nuevos";

const VELOCIDAD_PX = 0.55;
const PAUSA_MS = 5000;

function Tarjeta({ p }: { p: NuevoIngreso }) {
  const desde = precioDesdeNuevo(p);
  return (
    <li className="w-40 shrink-0 sm:w-52">
      <Link
        to="/catalogo"
        search={{
          categoria: p.categoria as (typeof TABS_CATALOGO)[number],
          buscar: p.nombre,
        }}
        className="group block overflow-hidden rounded-2xl border border-border bg-background shadow-sm transition-colors hover:border-gold/60"
      >
        <span className="relative block aspect-square bg-white">
          <span className="label-caps absolute top-2 left-2 z-10 flex items-center gap-1 rounded-full bg-gold px-2.5 py-1 text-[0.55rem] text-background shadow">
            <Flame aria-hidden="true" className="h-3 w-3" />
            {esPreventa(p.estado) ? "Preventa" : "Top"}
          </span>
          {p.imagen_url ? (
            <img
              src={p.imagen_url}
              alt={`${p.marca} ${p.nombre}`}
              loading="lazy"
              draggable={false}
              className="h-full w-full object-contain p-3 transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <span
              aria-hidden="true"
              className="display-italic flex h-full items-center justify-center text-5xl text-gold/30"
            >
              {p.marca.charAt(0)}
            </span>
          )}
        </span>
        <span className="block px-3 py-2.5">
          <span className="label-caps block truncate text-[0.58rem] text-muted-foreground">
            {p.marca}
          </span>
          <span className="block truncate text-sm font-medium text-foreground">{p.nombre}</span>
          {desde !== null && (
            <span className="block text-xs text-gold-bright">Desde {dinero(desde)}</span>
          )}
        </span>
      </Link>
    </li>
  );
}

/** Los más vendidos que elige el admin, en un carrusel horizontal que avanza solo (sin repetir perfumes). */
export function MasVendidos() {
  const { data } = useMasVendidos();
  const lista = data ?? [];
  const pista = useRef<HTMLUListElement>(null);
  const hasta = useRef(0);

  const pausar = useCallback(() => {
    hasta.current = Date.now() + PAUSA_MS;
  }, []);

  // Va de izquierda a derecha, espera un momento al final y regresa; si caben todos, queda quieto.
  useEffect(() => {
    const el = pista.current;
    if (!el || lista.length === 0) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let id = 0;
    let acumulado = el.scrollLeft;
    let sentido = 1;
    let esperaHasta = Date.now() + 1500;
    const paso = () => {
      const maximo = el.scrollWidth - el.clientWidth;
      const ahora = Date.now();
      if (maximo > 2) {
        if (ahora < hasta.current) {
          acumulado = el.scrollLeft;
        } else if (ahora >= esperaHasta) {
          acumulado += sentido * (sentido === 1 ? VELOCIDAD_PX : VELOCIDAD_PX * 2.5);
          if (acumulado >= maximo) {
            acumulado = maximo;
            sentido = -1;
            esperaHasta = ahora + 1800;
          } else if (acumulado <= 0) {
            acumulado = 0;
            sentido = 1;
            esperaHasta = ahora + 1800;
          }
          el.scrollLeft = acumulado;
        }
      }
      id = requestAnimationFrame(paso);
    };
    id = requestAnimationFrame(paso);
    return () => cancelAnimationFrame(id);
  }, [lista.length]);

  if (lista.length === 0) return null;

  return (
    <section id="mas-vendidos" className="border-t border-border">
      <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
        <h2 className="display-italic text-center text-3xl text-foreground sm:text-4xl">
          Los más vendidos
        </h2>
        <p className="mx-auto mt-2 max-w-md text-center text-sm text-muted-foreground">
          Los favoritos de nuestros clientes.
        </p>

        <ul
          ref={pista}
          aria-label="Perfumes más vendidos"
          onPointerEnter={(e) => e.pointerType === "mouse" && pausar()}
          onPointerMove={(e) => e.pointerType === "mouse" && pausar()}
          onPointerDown={pausar}
          onTouchStart={pausar}
          onWheel={pausar}
          className="-mx-5 mt-6 flex gap-3 overflow-x-auto px-5 pb-3 [scrollbar-width:none] sm:mx-0 sm:gap-4 sm:px-0 [&::-webkit-scrollbar]:hidden [&>li:first-child]:ml-auto [&>li:last-child]:mr-auto"
        >
          {lista.map((p) => (
            <Tarjeta key={p.id} p={p} />
          ))}
        </ul>
      </div>
    </section>
  );
}
