export type Resena = { id: string; texto: string; imagen: string; creada: string };

/**
 * Reseñas de clientes. Esta demo no tiene backend (ni Vercel Blob ni panel de
 * aprobación): no hay reseñas reales todavía, así que la lista empieza vacía
 * en vez de inventar testimonios falsos. `configurada: false` hace que la
 * página /resenas muestre el aviso de "muy pronto" en vez del formulario.
 */
export async function cargarResenas(): Promise<{ configurada: boolean; resenas: Resena[] }> {
  return { configurada: false, resenas: [] };
}

export async function enviarResena(
  _file?: File,
  _texto?: string,
  _sitio?: string,
): Promise<string | null> {
  return "Las reseñas aún no están activas en este sitio.";
}
