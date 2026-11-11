import { useQuery } from "@tanstack/react-query";
import { PERFUMES } from "@/lib/perfumes-data";

export type PrecioHome = {
  categoria: string;
  marca: string;
  nombre: string;
  precio_3ml: number | null;
  precio_frasco: number | null;
  es_frasco_completo: boolean;
};

/** Precios reales del catálogo disponible, para la portada y la sección de decants. */
export function usePreciosHome() {
  return useQuery({
    queryKey: ["precios_home"],
    queryFn: async () =>
      PERFUMES.filter((p) => p.estado === "Disponible").map(
        (p): PrecioHome => ({
          categoria: p.categoria,
          marca: p.marca,
          nombre: p.nombre,
          precio_3ml: p.precio_3ml,
          precio_frasco: p.precio_frasco,
          es_frasco_completo: p.es_frasco_completo,
        }),
      ),
    staleTime: Infinity,
  });
}

/** Precio de decant de 3 ml más bajo de una categoría (o de todo el catálogo). */
export function desde3ml(filas: PrecioHome[] | undefined, categoria?: string) {
  const v = (filas ?? [])
    .filter((p) => (!categoria || p.categoria === categoria) && p.marca !== "Combo")
    .map((p) => p.precio_3ml)
    .filter((x): x is number => typeof x === "number" && x > 0);
  return v.length > 0 ? Math.min(...v) : null;
}

export function dinero(n: number) {
  return `$${n.toFixed(2).replace(".", ",")}`;
}
