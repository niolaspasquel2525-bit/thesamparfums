export const EVENTO_CARRITO_LLEGO = "thesamparfums-carrito-llego";

/**
 * Anima la foto del perfume (o un punto dorado si no hay foto) desde `origen`
 * hasta el botón del carrito (`[data-carrito-fab]`), haciéndose más pequeña
 * mientras se acerca, y avisa con un evento cuando llega para que el botón
 * crezca y destaque. Si el usuario prefiere menos movimiento, o el botón no
 * existe, solo avisa sin animar.
 */
export function volarAlCarrito(origen: DOMRect, imagen?: string | null) {
  const avisar = () => window.dispatchEvent(new Event(EVENTO_CARRITO_LLEGO));
  // Hay varios botones de carrito (encabezado, barra del celular, flotante de escritorio):
  // el destino es el primero que está a la vista, que es el del encabezado.
  const destino =
    [...document.querySelectorAll<HTMLElement>("[data-carrito-fab]")].find(
      (el) => el.getBoundingClientRect().width > 0,
    ) ?? null;
  const sinMovimiento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!destino || sinMovimiento || typeof Element.prototype.animate !== "function") {
    avisar();
    return;
  }

  const tamano = 76;
  const d = destino.getBoundingClientRect();
  const x0 = origen.left + origen.width / 2 - tamano / 2;
  const y0 = origen.top + origen.height / 2 - tamano / 2;
  const x1 = d.left + d.width / 2 - tamano / 2;
  const y1 = d.top + d.height / 2 - tamano / 2;

  const vuelo = document.createElement("div");
  vuelo.setAttribute("aria-hidden", "true");
  Object.assign(vuelo.style, {
    position: "fixed",
    left: "0",
    top: "0",
    width: `${tamano}px`,
    height: `${tamano}px`,
    borderRadius: "9999px",
    overflow: "hidden",
    background: imagen ? "#fff" : "oklch(0.54 0.09 82)",
    border: "2px solid oklch(0.54 0.09 82)",
    boxShadow: "0 10px 28px rgba(20,19,17,0.35), 0 0 0 4px rgba(138,106,43,0.25)",
    zIndex: "100",
    pointerEvents: "none",
    willChange: "transform",
  });
  if (imagen) {
    const img = document.createElement("img");
    img.src = imagen;
    img.alt = "";
    Object.assign(img.style, {
      width: "100%",
      height: "100%",
      objectFit: "contain",
      padding: "4px",
    });
    vuelo.appendChild(img);
  }
  document.body.appendChild(vuelo);

  // Trayectoria en arco: sube un poco y se encoge hasta casi nada al caer en el carrito.
  const cx = (x0 + x1) / 2;
  const cy = Math.min(y0, y1) - 40;
  const animacion = vuelo.animate(
    [
      { transform: `translate(${x0}px, ${y0}px) scale(1)`, opacity: 1 },
      { transform: `translate(${cx}px, ${cy}px) scale(0.65)`, opacity: 1, offset: 0.45 },
      { transform: `translate(${x1}px, ${y1}px) scale(0.16)`, opacity: 0.95 },
    ],
    { duration: 950, easing: "cubic-bezier(0.45, 0, 0.25, 1)" },
  );
  const fin = () => {
    vuelo.remove();
    avisar();
  };
  animacion.onfinish = fin;
  animacion.oncancel = fin;
}
