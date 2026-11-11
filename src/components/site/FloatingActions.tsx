import { useEffect } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { FlaskConical, Gift, House, ShoppingBag, Truck } from "lucide-react";
import { waLink } from "@/lib/thesamparfums";
import { EVENTO_CARRITO_LLEGO } from "@/lib/volarAlCarrito";
import { useCart } from "@/contexts/CartContext";
import { useModal } from "@/contexts/ModalContext";
import { CartDrawer } from "./CartDrawer";
import { IconoWhatsApp } from "./IconoWhatsApp";

const ESTILO_BOTON =
  "relative flex h-14 w-14 items-center justify-center rounded-full border border-gold bg-background text-gold shadow-[0_0_30px_rgba(0,0,0,0.6)] transition-colors hover:bg-gold hover:text-background";

/**
 * Botones flotantes abajo a la derecha: el carrito (con contador y rebote al
 * recibir un producto) encima del de WhatsApp. El cajón del carrito también
 * vive acá para que el botón funcione en cualquier página.
 */
export function FloatingActions() {
  const { cantidadTotal } = useCart();
  const { activo, abrir, cerrar } = useModal();

  useEffect(() => {
    const rebotar = () => {
      document.querySelectorAll<HTMLElement>("[data-carrito-fab]").forEach((el) => {
        if (el.getBoundingClientRect().width === 0) return;
        el.animate(
          [
            { transform: "scale(1)", boxShadow: "0 0 0 0 rgba(138,106,43,0.75)" },
            { transform: "scale(1.55)", boxShadow: "0 0 0 16px rgba(138,106,43,0)", offset: 0.45 },
            { transform: "scale(0.94)", boxShadow: "0 0 0 0 rgba(138,106,43,0)", offset: 0.75 },
            { transform: "scale(1)", boxShadow: "0 0 0 0 rgba(138,106,43,0)" },
          ],
          { duration: 750, easing: "ease-out" },
        );
      });
    };
    window.addEventListener(EVENTO_CARRITO_LLEGO, rebotar);
    return () => window.removeEventListener(EVENTO_CARRITO_LLEGO, rebotar);
  }, []);

  return (
    <>
      <div className="fixed right-5 bottom-5 z-[60] hidden flex-col items-center gap-3 md:flex">
        <button
          type="button"
          data-carrito-fab
          onClick={() => abrir("carrito")}
          aria-label={`Ver carrito${cantidadTotal > 0 ? `, ${cantidadTotal} artículos` : ""}`}
          className={ESTILO_BOTON}
        >
          <ShoppingBag className="h-6 w-6" />
          {cantidadTotal > 0 && (
            <span className="absolute -top-1.5 -right-1.5 flex h-6 min-w-6 items-center justify-center rounded-full bg-gold px-1.5 text-xs font-semibold tabular-nums text-background shadow-md">
              {cantidadTotal}
            </span>
          )}
        </button>

        <a
          href={waLink("Hola The Sam Parfums, quisiera hacer una consulta.")}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Escríbenos por WhatsApp"
          className={ESTILO_BOTON}
        >
          <IconoWhatsApp className="h-6 w-6" />
        </a>
      </div>

      <BarraMovil cantidad={cantidadTotal} onCarrito={() => abrir("carrito")} />

      <CartDrawer open={activo === "carrito"} onClose={cerrar} />
    </>
  );
}

const ITEM =
  "flex h-full w-full flex-col items-center justify-center gap-1 px-0.5 text-center transition-[color,transform] duration-100 ease-out active:scale-95";
const ETIQUETA = "label-caps text-[0.5rem] leading-tight";

/** Barra de navegación del celular: franja sencilla con los accesos principales. En computador no se ve. */
function BarraMovil({ cantidad, onCarrito }: { cantidad: number; onCarrito: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const categoria = useRouterState({
    select: (s) => (s.location.search as { categoria?: string }).categoria,
  });
  const enCatalogo = pathname.startsWith("/catalogo");
  const activo = (ok: boolean) => (ok ? "text-gold" : "text-muted-foreground");

  return (
    <>
      {/* Espacio al final de la página para que la barra no tape el contenido. */}
      <div
        aria-hidden="true"
        className="h-[calc(4rem+env(safe-area-inset-bottom,0px))] md:hidden"
      />

      <a
        href={waLink("Hola The Sam Parfums, quisiera hacer una consulta.")}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Escríbenos por WhatsApp"
        className="fixed right-4 bottom-[calc(5.5rem+env(safe-area-inset-bottom,0px))] z-[60] flex h-12 w-12 items-center justify-center rounded-full border border-border bg-background text-gold shadow-[0_6px_20px_rgba(20,19,17,0.15)] md:hidden"
      >
        <IconoWhatsApp className="h-6 w-6" />
      </a>

      <nav
        aria-label="Navegación principal"
        className="fixed inset-x-0 bottom-0 z-[60] border-t border-border bg-background/92 pb-[env(safe-area-inset-bottom,0px)] backdrop-blur-md md:hidden"
      >
        <div className="relative mx-auto h-16 max-w-md">
          <ul className="grid h-full grid-cols-5 items-center px-1">
            <li className="h-full">
              <Link to="/" className={`${ITEM} ${activo(pathname === "/")}`}>
                <House className="h-5 w-5" />
                <span className={ETIQUETA}>Inicio</span>
              </Link>
            </li>
            <li className="h-full">
              <Link
                to="/catalogo"
                search={{}}
                className={`${ITEM} ${activo(enCatalogo && categoria !== "Combos" && categoria !== "Bajo pedido")}`}
              >
                <FlaskConical className="h-5 w-5" />
                <span className={ETIQUETA}>Catálogo</span>
              </Link>
            </li>
            <li className="h-full">
              <Link
                to="/catalogo"
                search={{ categoria: "Combos" }}
                className={`${ITEM} ${activo(enCatalogo && categoria === "Combos")}`}
              >
                <Gift className="h-5 w-5" />
                <span className={ETIQUETA}>Combos</span>
              </Link>
            </li>
            <li className="h-full">
              <Link
                to="/catalogo"
                search={{ categoria: "Bajo pedido" }}
                className={`${ITEM} ${activo(enCatalogo && categoria === "Bajo pedido")}`}
              >
                <Truck className="h-5 w-5" />
                <span className={ETIQUETA}>Bajo pedido</span>
              </Link>
            </li>
            <li className="h-full">
              <button
                type="button"
                data-carrito-fab
                onClick={onCarrito}
                aria-label={`Ver carrito${cantidad > 0 ? `, ${cantidad} artículos` : ""}`}
                className={`${ITEM} text-muted-foreground`}
              >
                <span className="relative">
                  <ShoppingBag className="h-5 w-5" />
                  {cantidad > 0 && (
                    <span className="absolute -top-2 -right-2.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold px-1 text-[0.6rem] font-semibold tabular-nums text-background">
                      {cantidad}
                    </span>
                  )}
                </span>
                <span className={ETIQUETA}>Carrito</span>
              </button>
            </li>
          </ul>
        </div>
      </nav>
    </>
  );
}
