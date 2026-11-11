export const MONTO_POR_CUPO = 20;

/** Un cupo por cada $20 de compra; desde $19.99 ya cuenta el primero. */
export function cuposSorteo(subtotal: number): number {
  const centavos = Math.round(subtotal * 100);
  return Math.floor((centavos + 1) / (MONTO_POR_CUPO * 100));
}

/** Cuánto falta (en dólares) para ganar el siguiente cupo. */
export function faltaParaSiguienteCupo(subtotal: number): number {
  const siguiente = (cuposSorteo(subtotal) + 1) * MONTO_POR_CUPO - 0.01;
  return Math.max(0, Math.round((siguiente - subtotal) * 100) / 100);
}
