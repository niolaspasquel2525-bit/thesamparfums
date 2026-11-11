/**
 * Reduce una foto antes de subirla: máximo `lado` px por el lado más largo y
 * formato WebP (o JPEG si el navegador no lo soporta). Una foto de celular de
 * varios MB queda en unos pocos KB, así el catálogo carga rápido.
 */
export async function comprimirImagen(archivo: File, lado = 1200, calidad = 0.85): Promise<Blob> {
  const bitmap = await createImageBitmap(archivo);
  const escala = Math.min(1, lado / Math.max(bitmap.width, bitmap.height));
  const ancho = Math.max(1, Math.round(bitmap.width * escala));
  const alto = Math.max(1, Math.round(bitmap.height * escala));
  const canvas = document.createElement("canvas");
  canvas.width = ancho;
  canvas.height = alto;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("No se pudo preparar la imagen.");
  // Fondo blanco para fotos con transparencia.
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, ancho, alto);
  ctx.drawImage(bitmap, 0, 0, ancho, alto);
  bitmap.close();

  const aBlob = (tipo: string) =>
    new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, tipo, calidad));
  const webp = await aBlob("image/webp");
  if (webp && webp.type === "image/webp") return webp;
  const jpeg = await aBlob("image/jpeg");
  if (!jpeg) throw new Error("No se pudo comprimir la imagen.");
  return jpeg;
}

export function extensionDe(blob: Blob) {
  return blob.type === "image/webp" ? "webp" : "jpg";
}

const PREFIJO_PUBLICO = "/storage/v1/object/public/perfumes/";

/**
 * Dirección de la miniatura (520 px) de una foto de perfume: mismo nombre de
 * archivo dentro de `thumbs/`. Devuelve null si la foto no está en nuestro bucket.
 */
export function urlMiniatura(url: string | null | undefined): string | null {
  if (!url) return null;
  const i = url.indexOf(PREFIJO_PUBLICO);
  if (i < 0) return null;
  const resto = url.slice(i + PREFIJO_PUBLICO.length);
  if (resto.startsWith("thumbs/")) return null;
  return `${url.slice(0, i + PREFIJO_PUBLICO.length)}thumbs/${resto}`;
}

/** Sube la miniatura (520 px) de una foto junto a la original. No interrumpe si falla. */
export async function subirMiniatura(
  bucket: {
    upload: (
      ruta: string,
      cuerpo: Blob,
      opciones: { upsert: boolean; contentType: string; cacheControl: string },
    ) => PromiseLike<{ error: { message: string } | null }>;
  },
  archivo: File,
  ruta: string,
) {
  try {
    const mini = await comprimirImagen(archivo, 520, 0.78);
    await bucket.upload(`thumbs/${ruta}`, mini, {
      upsert: true,
      contentType: mini.type,
      cacheControl: "31536000",
    });
  } catch {
    // Sin miniatura se usa la foto original.
  }
}
