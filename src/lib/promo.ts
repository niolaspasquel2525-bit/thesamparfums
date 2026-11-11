/** Cierre de la promoción de apertura: 31 de octubre de 2026, 23:59 (hora de Ecuador, UTC-5). */
export const PROMO_FIN = new Date("2026-10-31T23:59:59-05:00");

/** Compra mínima para la muestra gratis y el primer cupo del sorteo. */
export const PROMO_MINIMO = 19.99;

export type TiempoRestante = {
  /** false hasta que el navegador ya conoce la hora (evita desajustes con el servidor). */
  listo: boolean;
  activa: boolean;
  dias: number;
  horas: number;
  minutos: number;
  segundos: number;
};

export function calcularRestante(ahora: number): TiempoRestante {
  const ms = PROMO_FIN.getTime() - ahora;
  if (ms <= 0) return { listo: true, activa: false, dias: 0, horas: 0, minutos: 0, segundos: 0 };
  const total = Math.floor(ms / 1000);
  return {
    listo: true,
    activa: true,
    dias: Math.floor(total / 86400),
    horas: Math.floor((total % 86400) / 3600),
    minutos: Math.floor((total % 3600) / 60),
    segundos: total % 60,
  };
}

export function dosDigitos(n: number) {
  return String(n).padStart(2, "0");
}

export function textoRestante(t: TiempoRestante) {
  return `${t.dias}d ${dosDigitos(t.horas)}h ${dosDigitos(t.minutos)}m ${dosDigitos(t.segundos)}s`;
}
