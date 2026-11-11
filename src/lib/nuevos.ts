import { useQuery } from "@tanstack/react-query";
import { PERFUMES } from "@/lib/perfumes-data";

export { DIAS_NUEVO, esNuevo } from "@/lib/nuevo-marcas";

export type NuevoIngreso = {
  id: string;
  categoria: string;
  marca: string;
  nombre: string;
  imagen_url: string | null;
  estado: string;
  created_at: string;
  precio_3ml: number | null;
  precio_5ml: number | null;
  precio_10ml: number | null;
  precio_frasco: number | null;
};

/**
 * Perfumes de la ventana de nuevos ingresos: en la versión con Supabase los elige el admin o,
 * si no eligió ninguno, toma los últimos agregados. Esta demo no tiene backend: la lista ya
 * viene resuelta y ordenada.
 */
export function useNuevosIngresos(cantidad = 6) {
  return useQuery({
    queryKey: ["nuevos_ingresos", cantidad],
    staleTime: Infinity,
    queryFn: async () =>
      [...PERFUMES]
        .filter(
          (p) =>
            (p.estado === "Disponible" || p.estado.startsWith("Preventa")) &&
            !p.es_frasco_completo &&
            p.marca !== "Combo" &&
            p.created_at,
        )
        .sort((a, b) => (b.created_at ?? "").localeCompare(a.created_at ?? ""))
        .slice(0, cantidad) as NuevoIngreso[],
  });
}

export function precioDesdeNuevo(p: NuevoIngreso) {
  const v = [p.precio_3ml, p.precio_5ml, p.precio_10ml, p.precio_frasco].filter(
    (x): x is number => typeof x === "number" && x > 0,
  );
  return v.length > 0 ? Math.min(...v) : null;
}
