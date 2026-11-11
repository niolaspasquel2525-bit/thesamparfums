import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "@tanstack/react-router";
import {
  type LucideIcon,
  FlaskConical,
  House,
  Info,
  MapPin,
  Menu,
  MessageSquareQuote,
  Search,
  ShoppingBag,
  Sparkles,
  X,
} from "lucide-react";
import { IconoWhatsApp } from "./IconoWhatsApp";
import { PromoTicker } from "./PromoTicker";
import { waLink } from "@/lib/thesamparfums";
import { useCart } from "@/contexts/CartContext";
import { useModal } from "@/contexts/ModalContext";

type Enlace = { href: string; label: string; route?: boolean };

/** Accesos principales; "Inicio" es el logo y "Ubicación" está dentro de Contacto. */
const IZQUIERDA: Enlace[] = [
  { href: "/catalogo", label: "Catálogo", route: true },
  { href: "/catalogo?orden=recientes", label: "Novedades" },
  { href: "/conocenos", label: "Conócenos", route: true },
];
const DERECHA: Enlace[] = [
  { href: "/#resenas", label: "Reseñas" },
  { href: "/#contacto", label: "Contacto" },
];

/** Menú lateral del celular: una lista vertical con icono por sección. */
const MENU_LATERAL: (Enlace & { Icono: LucideIcon })[] = [
  { href: "/", label: "Inicio", route: true, Icono: House },
  { href: "/catalogo", label: "Catálogo", route: true, Icono: FlaskConical },
  { href: "/catalogo?orden=recientes", label: "Novedades", Icono: Sparkles },
  { href: "/conocenos", label: "Conócenos", route: true, Icono: Info },
  { href: "/#contacto", label: "Contacto", Icono: MapPin },
  { href: "/#resenas", label: "Reseñas", Icono: MessageSquareQuote },
];

const BOTON =
  "label-caps rounded-full border border-border bg-background/60 px-3.5 py-2.5 text-center xl:px-5 text-foreground transition-colors hover:border-gold hover:text-gold-bright";
const ICONO =
  "relative flex h-11 w-11 items-center justify-center rounded-full border border-border bg-background/60 text-foreground transition-colors hover:border-gold hover:text-gold-bright";

function EnlaceNav({ l, className = BOTON }: { l: Enlace; className?: string }) {
  return l.route ? (
    <Link
      to={l.href}
      className={className}
      activeProps={{ className: `${className} !border-gold !text-gold-bright` }}
    >
      {l.label}
    </Link>
  ) : (
    <a href={l.href} className={className}>
      {l.label}
    </a>
  );
}

export function Header() {
  const [open, setOpen] = useState(false);
  const { cantidadTotal } = useCart();
  const { abrir } = useModal();

  // El menú lateral se cierra con Escape y bloquea el desplazamiento de la página mientras está abierto.
  useEffect(() => {
    if (!open) return;
    const alTeclear = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", alTeclear);
    const antes = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", alTeclear);
      document.body.style.overflow = antes;
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card shadow-[0_2px_14px_rgba(20,19,17,0.06)]">
      <PromoTicker />
      <div className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center px-3 py-1.5 sm:px-8">
        {/* Izquierda: menú en celular, botones en computador. */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            className={`${ICONO} lg:hidden`}
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <nav className="hidden items-center gap-2 lg:flex xl:gap-3" aria-label="Principal">
            {IZQUIERDA.map((l) => (
              <EnlaceNav key={l.href} l={l} />
            ))}
          </nav>
        </div>

        {/* Centro: logo (círculo negro con el nombre incluido). */}
        <Link to="/" aria-label="The Sam Parfums — inicio" className="flex justify-center px-2">
          <img
            src="/logo-thesamparfums-circulo.png"
            alt="The Sam Parfums"
            width={360}
            height={360}
            className="h-14 w-14 shrink-0 sm:h-[3.75rem] sm:w-[3.75rem]"
          />
        </Link>

        {/* Derecha: botones (computador), búsqueda y carrito. */}
        <div className="flex items-center justify-end gap-3">
          <nav className="hidden items-center gap-2 lg:flex xl:gap-3" aria-label="Secundaria">
            {DERECHA.map((l) => (
              <EnlaceNav key={l.href} l={l} />
            ))}
          </nav>
          <Link
            to="/catalogo"
            search={{}}
            aria-label="Buscar perfumes"
            className={`${ICONO} hidden sm:flex`}
          >
            <Search className="h-5 w-5" />
          </Link>
          <button
            type="button"
            data-carrito-fab
            onClick={() => abrir("carrito")}
            aria-label={`Ver carrito${cantidadTotal > 0 ? `, ${cantidadTotal} artículos` : ""}`}
            className={ICONO}
          >
            <ShoppingBag className="h-5 w-5" />
            {cantidadTotal > 0 && (
              <span className="absolute -top-1 -right-1 flex h-[1.1rem] min-w-[1.1rem] items-center justify-center rounded-full bg-gold px-1 text-[0.625rem] font-semibold tabular-nums text-background">
                {cantidadTotal}
              </span>
            )}
          </button>
        </div>
      </div>

      {open &&
        createPortal(
          <div className="fixed inset-0 z-[90] lg:hidden">
            <button
              type="button"
              aria-label="Cerrar menú"
              onClick={() => setOpen(false)}
              className="absolute inset-0 animate-in bg-foreground/45 duration-300 fade-in"
            />
            <nav
              aria-label="Menú principal"
              className="absolute inset-y-0 left-0 flex w-[82%] max-w-xs animate-in flex-col bg-card shadow-2xl duration-300 slide-in-from-left"
            >
              <div className="flex items-center justify-between border-b border-border px-5 py-4">
                <span className="label-caps text-foreground">Menú</span>
                <button
                  type="button"
                  aria-label="Cerrar menú"
                  onClick={() => setOpen(false)}
                  className={ICONO}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <ul className="flex flex-1 flex-col gap-2 overflow-y-auto px-4 py-4">
                {MENU_LATERAL.map(({ href, label, route, Icono }) => {
                  const clase =
                    "flex w-full items-center gap-4 rounded-xl border border-border bg-background/60 px-4 py-3.5 text-base text-foreground transition-colors hover:border-gold hover:text-gold-bright";
                  return (
                    <li key={href} onClick={() => setOpen(false)}>
                      {route ? (
                        <Link to={href} className={clase}>
                          <Icono aria-hidden="true" className="h-5 w-5 shrink-0 text-gold" />
                          {label}
                        </Link>
                      ) : (
                        <a href={href} className={clase}>
                          <Icono aria-hidden="true" className="h-5 w-5 shrink-0 text-gold" />
                          {label}
                        </a>
                      )}
                    </li>
                  );
                })}
              </ul>
              <div className="border-t border-border p-4 pb-[calc(1rem+env(safe-area-inset-bottom,0px))]">
                <a
                  href={waLink(
                    "Hola The Sam Parfums, quisiera más información sobre sus decants.",
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-3 rounded-full bg-[#25D366] px-5 py-3.5 text-base font-semibold text-white transition-colors hover:bg-[#1ebe5b]"
                >
                  <IconoWhatsApp className="h-5 w-5" />
                  Escríbenos por WhatsApp
                </a>
              </div>
            </nav>
          </div>,
          document.body,
        )}
    </header>
  );
}
