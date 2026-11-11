import { useQuery } from "@tanstack/react-query";

/** Un perfume se considera nuevo durante este tiempo desde que se agregó. */
export const DIAS_NUEVO = 30;

export const esNuevo = (creado: string | null | undefined) =>
  !!creado && Date.now() - new Date(creado).getTime() < DIAS_NUEVO * 86_400_000;

export type AjustesNuevo = { id: string | null; si: string[]; no: string[] };

const VACIO: AjustesNuevo = { id: null, si: [], no: [] };

/** Esta demo no tiene backend ni ajustes manuales: manda la fecha de cada perfume (`esNuevo`). */
export function useAjustesNuevo() {
  return useQuery({
    queryKey: ["nuevo_marcas"],
    queryFn: async () => VACIO,
    staleTime: Infinity,
  });
}

/** ¿Lleva la etiqueta "Nuevo"? Manda el ajuste manual; si no hay, la fecha en que se agregó. */
export function lleva(
  id: string,
  creado: string | null | undefined,
  a: AjustesNuevo | undefined,
): boolean {
  if (a?.no.includes(id)) return false;
  if (a?.si.includes(id)) return true;
  return esNuevo(creado);
}
