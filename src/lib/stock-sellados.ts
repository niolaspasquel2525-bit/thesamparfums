import { useQuery } from "@tanstack/react-query";

export type StockMapa = Record<string, number>;
export type FilaStock = { id: string; mapa: StockMapa };

/**
 * Unidades disponibles de cada sellado (botella completa). Esta demo no tiene
 * backend: el mapa vive hardcodeado acá en vez de salir de una config en Supabase.
 * Un sellado que no aparece en el mapa se entiende con una sola unidad.
 */
const MAPA_STOCK: StockMapa = {
  "bo-1": 4,
  "bo-2": 1,
  "bo-3": 0,
};

export function useStockSellados() {
  return useQuery({
    queryKey: ["stock_sellados"],
    queryFn: async (): Promise<FilaStock> => ({ id: "stock", mapa: MAPA_STOCK }),
    staleTime: Infinity,
  });
}

/** Unidades de un sellado: lo anotado arriba, o 1 si no se anotó nada. */
export const unidadesDe = (mapa: StockMapa | undefined, id: string) => mapa?.[id] ?? 1;

/** Texto de escasez para la tarjeta ("Última unidad", "Quedan 3"); null si no hay que avisar. */
export function textoUnidades(n: number): string | null {
  if (n <= 0) return null;
  return n === 1 ? "Última unidad" : `Quedan ${n}`;
}
