import { Link } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { desde3ml, dinero, usePreciosHome } from "@/lib/precios-home";
import type { TABS_CATALOGO } from "@/lib/thesamparfums";

type Categoria = (typeof TABS_CATALOGO)[number];

type Slide = {
  clave: string;
  eyebrow: string;
  titulo: string;
  texto: string;
  imagen: string;
  categoria: Categoria | null;
  cta: string;
  /** Categoría usada para calcular el precio "desde". */
  precioDe?: string;
  /** Imagen horizontal (3:2) en lugar del banner vertical. */
  ancha?: boolean;
  /** Segundo botón; por defecto lleva a "Cómo funcionan". */
  secundario?: { texto: string; to: "/conocenos" };
};

const SLIDES: Slide[] = [
  {
    clave: "bienvenida",
    eyebrow: "Perfumería 100% original en Ecuador",
    titulo: "Descubre tu esencia",
    texto: "Decants de 3, 5 y 10 ml en perfumería árabe, diseñador y nicho.",
    imagen: "/portada/bienvenida.webp",
    categoria: null,
    cta: "Ver catálogo",
    ancha: true,
    secundario: { texto: "Conócenos", to: "/conocenos" },
  },
  {
    clave: "arabes",
    eyebrow: "Árabes",
    titulo: "Intensos, duraderos y con carácter",
    texto: "Lattafa, Armaf y más. Las fragancias árabes que todos están pidiendo, con oud y ámbar.",
    imagen: "/categorias/banner-arabes-3.webp",
    categoria: "Árabes",
    cta: "Ver árabes",
    precioDe: "Árabes",
  },
  {
    clave: "disenador",
    eyebrow: "Diseñador",
    titulo: "Marcas que han marcado la historia",
    texto: "Dior, Armani, Valentino y más, clásicos y novedades en el tamaño que quieras probar.",
    imagen: "/categorias/banner-disenador-2.webp",
    categoria: "Diseñador",
    cta: "Ver diseñador",
    precioDe: "Diseñador",
  },
  {
    clave: "nicho",
    eyebrow: "Nicho",
    titulo: "Fragancias de lujo",
    texto:
      "Perfumes exclusivos de Xerjoff, Kilian y más que podrás probar sin tener que gastar una fortuna.",
    imagen: "/categorias/banner-nicho-2.webp",
    categoria: "Nicho",
    cta: "Ver nicho",
    precioDe: "Nicho",
  },
];

const INTERVALO_MS = 4500;
/** Tiempo sin interacción antes de que el carrusel vuelva a avanzar solo. */
const PAUSA_MS = 20_000;

function Titulo({
  como: Tag,
  className,
  children,
}: {
  como: "h1" | "h2";
  className: string;
  children: React.ReactNode;
}) {
  return <Tag className={className}>{children}</Tag>;
}

export function Hero() {
  const { data: filas } = usePreciosHome();
  const [activo, setActivo] = useState(0);
  const [pausa, setPausa] = useState(false);
  const [reducido, setReducido] = useState(false);
  const toqueX = useRef<number | null>(null);

  useEffect(() => {
    setReducido(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  // Cuando la persona interactúa (toca, desliza, usa flechas o puntos, pasa el cursor), el carrusel
  // se queda donde está y solo vuelve al automático tras PAUSA_MS sin interacción.
  const hastaRef = useRef(0);
  const cambioRef = useRef(0);

  const interactuar = useCallback(() => {
    hastaRef.current = Date.now() + PAUSA_MS;
  }, []);

  const ir = useCallback(
    (i: number) => {
      setActivo((i + SLIDES.length) % SLIDES.length);
      cambioRef.current = Date.now();
      interactuar();
    },
    [interactuar],
  );

  useEffect(() => {
    if (reducido) return;
    cambioRef.current = Date.now();
    const t = window.setInterval(() => {
      const ahora = Date.now();
      if (pausa) hastaRef.current = ahora + PAUSA_MS;
      if (ahora < hastaRef.current || ahora - cambioRef.current < INTERVALO_MS) return;
      cambioRef.current = ahora;
      setActivo((a) => (a + 1) % SLIDES.length);
    }, 250);
    return () => window.clearInterval(t);
  }, [pausa, reducido]);

  return (
    <section
      id="inicio"
      aria-roledescription="carrusel"
      aria-label="Destacados"
      className="relative overflow-hidden border-b border-border"
      onPointerEnter={(e) => e.pointerType === "mouse" && setPausa(true)}
      onPointerLeave={(e) => e.pointerType === "mouse" && setPausa(false)}
      onTouchStart={(e) => {
        interactuar();
        toqueX.current = e.touches[0]?.clientX ?? null;
      }}
      onTouchEnd={(e) => {
        if (toqueX.current === null) return;
        const dx = (e.changedTouches[0]?.clientX ?? toqueX.current) - toqueX.current;
        toqueX.current = null;
        if (Math.abs(dx) > 50) ir(activo + (dx < 0 ? 1 : -1));
      }}
    >
      <div className="grid [&>*]:col-start-1 [&>*]:row-start-1">
        {SLIDES.map((s, i) => {
          const visible = i === activo;
          const precio = desde3ml(filas, s.precioDe);
          return (
            <div
              key={s.clave}
              role="group"
              aria-roledescription="diapositiva"
              aria-label={`${i + 1} de ${SLIDES.length}`}
              aria-hidden={!visible}
              inert={!visible}
              className={`mx-auto grid w-full max-w-6xl items-center gap-4 px-5 pt-3 pb-12 transition-opacity duration-700 sm:px-8 sm:pt-5 sm:pb-14 lg:grid-cols-2 lg:gap-12 lg:pt-6 lg:pb-14 ${
                visible ? "opacity-100" : "pointer-events-none opacity-0"
              }`}
            >
              <div className="relative order-1 mx-auto aspect-[4/3] w-full max-w-xl overflow-hidden rounded-2xl border border-border lg:order-2 lg:max-w-none">
                <img
                  src={s.imagen}
                  alt=""
                  loading={i === 0 ? "eager" : "lazy"}
                  decoding="async"
                  className={`absolute inset-0 h-full w-full object-cover ${s.ancha ? "object-[65%_center]" : "object-[center_42%]"}`}
                />
              </div>

              <div className="order-2 text-center lg:order-1 lg:text-left">
                <div className="flex items-center justify-center gap-3 lg:justify-start">
                  <span className="hidden h-px w-10 bg-gold lg:block" aria-hidden="true" />
                  <span className="label-caps text-gold">{s.eyebrow}</span>
                </div>
                <Titulo
                  como={i === 0 ? "h1" : "h2"}
                  className="display-italic mt-3 text-[1.9rem] leading-[1.08] text-foreground sm:text-4xl lg:text-5xl"
                >
                  {s.titulo}
                </Titulo>
                <p className="mx-auto mt-3 max-w-md text-[0.95rem] leading-relaxed text-muted-foreground sm:text-base lg:mx-0">
                  {s.texto}
                </p>
                {precio !== null && !s.ancha && (
                  <p className="mt-2 text-sm text-foreground">
                    Decants de 3 ml <span className="text-gold-bright">desde {dinero(precio)}</span>
                  </p>
                )}
                <div className="mt-5 flex flex-col items-center gap-2.5 sm:flex-row sm:justify-center lg:justify-start">
                  {s.categoria ? (
                    <Link
                      to="/catalogo"
                      search={{ categoria: s.categoria }}
                      className="label-caps w-full border border-gold bg-gold px-8 py-3 text-background transition-colors hover:border-gold-bright hover:bg-gold-bright sm:w-auto"
                    >
                      {s.cta}
                    </Link>
                  ) : (
                    <a
                      href="#catalogo"
                      className="label-caps w-full border border-gold bg-gold px-8 py-3 text-background transition-colors hover:border-gold-bright hover:bg-gold-bright sm:w-auto"
                    >
                      {s.cta}
                    </a>
                  )}
                  {s.secundario ? (
                    <Link
                      to={s.secundario.to}
                      className="label-caps w-full border border-border px-8 py-3 text-foreground transition-colors hover:border-gold hover:text-gold-bright sm:w-auto"
                    >
                      {s.secundario.texto}
                    </Link>
                  ) : (
                    <Link
                      to="/conocenos"
                      hash="como-funciona"
                      className="label-caps w-full border border-border px-8 py-3 text-foreground transition-colors hover:border-gold hover:text-gold-bright sm:w-auto"
                    >
                      Cómo funcionan
                    </Link>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-2 z-10 flex items-center justify-center gap-2 sm:bottom-3">
        <button
          type="button"
          onClick={() => ir(activo - 1)}
          aria-label="Anterior"
          className="pointer-events-auto hidden h-9 w-9 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:border-gold hover:text-gold-bright sm:flex"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        {SLIDES.map((s, i) => (
          <button
            key={s.clave}
            type="button"
            onClick={() => ir(i)}
            aria-label={`Ir a ${s.eyebrow}`}
            aria-current={i === activo}
            className="pointer-events-auto flex h-8 items-center px-1"
          >
            <span
              className={`block h-[3px] rounded-full transition-all duration-500 ${
                i === activo ? "w-8 bg-gold" : "w-4 bg-foreground/25"
              }`}
            />
          </button>
        ))}
        <button
          type="button"
          onClick={() => ir(activo + 1)}
          aria-label="Siguiente"
          className="pointer-events-auto hidden h-9 w-9 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:border-gold hover:text-gold-bright sm:flex"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </section>
  );
}
