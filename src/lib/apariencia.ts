export type FontPresetKey = "cormorant_jost" | "playfair_inter" | "garamond_manrope";

export const FONT_PRESETS: Record<FontPresetKey, { label: string; display: string; sans: string }> =
  {
    cormorant_jost: {
      label: "Cormorant Garamond + Jost",
      display: '"Cormorant Garamond", Georgia, serif',
      sans: '"Jost", ui-sans-serif, system-ui, sans-serif',
    },
    playfair_inter: {
      label: "Playfair Display + Inter",
      display: '"Playfair Display", Georgia, serif',
      sans: '"Inter", ui-sans-serif, system-ui, sans-serif',
    },
    garamond_manrope: {
      label: "EB Garamond + Manrope",
      display: '"EB Garamond", Georgia, serif',
      sans: '"Manrope", ui-sans-serif, system-ui, sans-serif',
    },
  };

export type ConfiguracionSitio = {
  color_fondo: string;
  color_texto: string;
  color_dorado: string;
  color_dorado_claro: string;
  tipografia: string;
  catalogo_titulo: string;
  catalogo_descripcion: string;
  catalogo_mostrar_otros: boolean;
  hero_eyebrow: string;
  hero_imagen_url: string | null;
  promo_activo: boolean;
  promo_texto: string;
  promo_premio: string;
  promo_detalle: string;
};

/** Colores del tema oscuro anterior: si la base de datos aún los trae, se usa la paleta clara. */
export const COLORES_TEMA_OSCURO = ["#050504", "#F4EFE4", "#B4924C", "#D4B26A"];

export const CONFIG_SITIO_DEFAULT: ConfiguracionSitio = {
  color_fondo: "#0B0A0C",
  color_texto: "#F4EFE8",
  color_dorado: "#D43F8D",
  color_dorado_claro: "#E6679F",
  tipografia: "garamond_manrope",
  catalogo_titulo: "Catálogo",
  catalogo_descripcion: "Perfumes árabes, de diseñador y nicho, 100% originales.",
  catalogo_mostrar_otros: true,
  hero_eyebrow: "Perfumes árabes, diseñador y nicho · 100% originales",
  hero_imagen_url: null,
  // Sin promoción activa por ahora: la casilla queda lista si el cliente quiere lanzar un sorteo.
  promo_activo: false,
  promo_texto: "🎁 Promoción de apertura: con cada compra mayor a $20, participas por un",
  promo_premio: "premio por definir",
  promo_detalle: "Promoción de ejemplo — defínela antes de activarla.",
};

export const HERO_IMAGEN_DEFAULT = "/frasco-hero.png";

/** Banners que viven en el sitio y mandan sobre la imagen guardada en la base de datos. */
const BANNER_LOCAL: Record<string, string> = {
  "Botellas completas": "/categorias/banner-botellas.webp",
  Testers: "/categorias/testers.webp",
};

export function conBannerLocal<
  T extends { slug: string; etiqueta: string; imagen_url: string | null },
>(c: T): T {
  if (c.slug === "Testers") return { ...c, imagen_url: BANNER_LOCAL["Testers"] ?? c.imagen_url };
  if (c.slug !== "Botellas completas") return c;
  return { ...c, etiqueta: "Sellados", imagen_url: BANNER_LOCAL[c.slug] ?? c.imagen_url };
}

export type CatalogoCategoria = {
  id: string;
  slug: string;
  etiqueta: string;
  icono: string | null;
  imagen_url: string | null;
  visible: boolean;
  orden: number;
};
