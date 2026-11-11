export type CodigoPromo = {
  codigo: string;
  tipo: "decant_gratis" | "porcentaje" | "monto";
  valor: number;
  descripcion: string | null;
  /** Subtotal mínimo del pedido para que el código aplique. */
  compra_minima: number;
};

/**
 * Códigos de descuento. Esta demo no tiene backend: la lista vive hardcodeada
 * acá en vez de salir de una tabla `codigos_promo` + función RPC.
 */
const CODIGOS: CodigoPromo[] = [
  {
    codigo: "BIENVENIDA",
    tipo: "porcentaje",
    valor: 10,
    descripcion: "10% de descuento en tu primer pedido",
    compra_minima: 15,
  },
];

/** Devuelve el código si existe; null si no. */
export async function validarCodigo(texto: string): Promise<CodigoPromo | null> {
  const limpio = texto.trim().toUpperCase();
  if (!limpio) return null;
  return CODIGOS.find((c) => c.codigo === limpio) ?? null;
}

/** ¿El pedido llega a la compra mínima del código? */
export function cumpleMinimo(c: CodigoPromo, subtotal: number): boolean {
  return subtotal >= c.compra_minima;
}

/** Descuento en dólares que da el código sobre el subtotal (los decants gratis no restan). */
export function descuentoDe(c: CodigoPromo | null, subtotal: number): number {
  if (!c || !cumpleMinimo(c, subtotal)) return 0;
  const v = c.tipo === "porcentaje" ? (subtotal * c.valor) / 100 : c.tipo === "monto" ? c.valor : 0;
  return Math.min(subtotal, Math.round(v * 100) / 100);
}

export function textoCodigo(c: CodigoPromo): string {
  if (c.tipo === "decant_gratis") return c.descripcion || "Decant gratis";
  if (c.tipo === "porcentaje") return c.descripcion || `${c.valor}% de descuento`;
  return c.descripcion || `$${c.valor.toFixed(2)} de descuento`;
}
