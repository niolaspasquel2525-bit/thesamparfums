import { useState, type ImgHTMLAttributes } from "react";
import { urlMiniatura } from "@/lib/imagen";

/**
 * Foto de perfume liviana: usa la miniatura (520 px) y, si no existe, la foto original.
 */
export function FotoPerfume({
  src,
  alt,
  ...resto
}: { src: string; alt: string } & Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "alt">) {
  const mini = urlMiniatura(src);
  const [fallo, setFallo] = useState(false);
  return (
    <img
      {...resto}
      src={mini && !fallo ? mini : src}
      alt={alt}
      onError={mini && !fallo ? () => setFallo(true) : undefined}
    />
  );
}
