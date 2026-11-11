import { BOTELLAS_COMPLETAS } from "@/lib/thesamparfums";
import { conBannerLocal, type CatalogoCategoria } from "@/lib/apariencia";

/**
 * Tarjetas de categoría del catálogo. Esta demo no tiene backend: reemplaza
 * la tabla `catalogo_categorias`. `conBannerLocal` (apariencia.ts) pone las
 * fotos de Testers y Sellados; Árabes/Diseñador/Nicho/Combos ya traen la suya.
 */
const BASE: { slug: string; orden: number; imagen_url: string | null }[] = [
  { slug: "Árabes", orden: 0, imagen_url: "/categorias/banner-arabes-3.webp" },
  { slug: "Diseñador", orden: 1, imagen_url: "/categorias/banner-disenador-2.webp" },
  { slug: "Nicho", orden: 2, imagen_url: "/categorias/banner-nicho-2.webp" },
  { slug: "Testers", orden: 3, imagen_url: null },
  { slug: BOTELLAS_COMPLETAS, orden: 4, imagen_url: null },
  { slug: "Combos", orden: 5, imagen_url: "/categorias/banner-combos.webp" },
];

export const CATEGORIAS: CatalogoCategoria[] = BASE.map(({ slug, orden, imagen_url }) =>
  conBannerLocal({
    id: slug,
    slug,
    etiqueta: slug,
    icono: null,
    imagen_url,
    visible: true,
    orden,
  }),
);
