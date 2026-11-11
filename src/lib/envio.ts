import { normalizarCiudad } from "./ciudades-ecuador";

/** Envío a todo el Ecuador a una sola tarifa plana (no hay tiers por ciudad todavía). */
export const ENVIO_OTRAS_CIUDADES = 3.5;

/**
 * Costo de envío según la ciudad escrita en el carrito. Devuelve null
 * mientras no hay ciudad, para no cobrar antes de saber a dónde va.
 */
export function costoEnvio(ciudad: string): number | null {
  const c = normalizarCiudad(ciudad);
  if (!c) return null;
  return ENVIO_OTRAS_CIUDADES;
}
