import { useQuery } from "@tanstack/react-query";
import { PERFUMES } from "@/lib/perfumes-data";
import type { NuevoIngreso } from "@/lib/nuevos";

/**
 * Los más vendidos: en la versión con Supabase los elige el admin a mano.
 * Esta demo no tiene backend, así que la lista vive hardcodeada acá.
 */
const IDS_MAS_VENDIDOS = ["di-1", "ar-1", "ni-2", "di-5", "ar-3", "di-6"];

export function useMasVendidos() {
  return useQuery({
    queryKey: ["mas_vendidos"],
    staleTime: Infinity,
    queryFn: async () => {
      const porId = new Map(PERFUMES.map((p) => [p.id, p]));
      return IDS_MAS_VENDIDOS.map((id) => porId.get(id)).filter(
        (p): p is NuevoIngreso =>
          !!p && (p.estado === "Disponible" || p.estado.startsWith("Preventa")),
      );
    },
  });
}
