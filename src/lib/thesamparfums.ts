export const WHATSAPP_NUMBER = "593997349288";
export const WHATSAPP_DISPLAY = "099 734 9288";
export const USUARIO_REDES = "the.sam.parfums";
export const INSTAGRAM_URL = `https://www.instagram.com/${USUARIO_REDES}/`;
/** The Sam Parfums no tiene local fijo: vende en ferias/mercados y envía a todo el país. */
export const COBERTURA = "Envíos a todo el Ecuador";

// api.whatsapp.com es el endpoint "click to chat" oficial de Meta: abre la
// app directo en móvil (sin el salto extra que a veces mete wa.me) y cae a
// WhatsApp Web en escritorio, sin depender de trucos con window.open.
export function waLink(mensaje: string) {
  return `https://api.whatsapp.com/send?phone=${WHATSAPP_NUMBER}&text=${encodeURIComponent(mensaje)}`;
}

/**
 * Redirige a WhatsApp desde un flujo con lógica previa (ej. guardar en la
 * base de datos). Navega la propia pestaña — nunca abre una pestaña en
 * blanco a la espera de un window.open() diferido, que es lo que deja al
 * usuario viendo una pantalla en blanco si algo tarda o falla.
 */
export function irAWhatsApp(mensaje: string) {
  window.location.href = waLink(mensaje);
}

export const CATEGORIAS = [
  "Mujer",
  "Hombre",
  "Unisex",
  "Árabes",
  "Nicho",
  "Diseñador",
  "Artesanal",
  "Testers",
] as const;

/**
 * Pestañas especiales del catálogo: no son categorías de producto reales, no
 * filtran por `categoria`. En vez de un grid de decants filtrado, cada una
 * muestra su propia vista:
 * - BAJO_PEDIDO: formulario de búsqueda + WhatsApp; muestra como sugerencia
 *   los perfumes marcados con `es_bajo_pedido = true`.
 * - BOTELLAS_COMPLETAS: filas reales, filtradas por `es_frasco_completo = true`.
 */
export const BAJO_PEDIDO = "Bajo pedido" as const;
export const BOTELLAS_COMPLETAS = "Botellas completas" as const;
/** Nombre que ven los clientes; el valor interno de arriba es el que guarda la base de datos. */
export const ETIQUETA_SELLADOS = "Sellados";
export const COMBOS = "Combos" as const;
/** Vista sin categoría elegida: todo el catálogo agrupado por estilo. */
export const TODAS = "Todos" as const;

/**
 * Preventa: se guarda en la columna `estado` como "Preventa" o "Preventa|15 a 20 días"
 * (el texto después de la barra es el tiempo estimado de entrega).
 */
export const ESTADO_PREVENTA = "Preventa";
export const esPreventa = (estado: string | null | undefined) =>
  !!estado && estado.startsWith(ESTADO_PREVENTA);
export const tiempoPreventa = (estado: string | null | undefined) =>
  estado?.split("|")[1]?.trim() || null;
export const estadoPreventa = (tiempo: string) =>
  tiempo.trim() ? `${ESTADO_PREVENTA}|${tiempo.trim()}` : ESTADO_PREVENTA;

/**
 * Pestañas por género: filtran por `genero`, no por `categoria`. Un perfume
 * Unisex aparece tanto en Mujer como en Hombre.
 */

export function coincideCategoria(p: { categoria: string; genero?: string | null }, tab: string) {
  if (p.categoria === tab) return true;
  if (tab === "Mujer") return p.genero === "Mujer" || p.genero === "Unisex";
  if (tab === "Hombre") return p.genero === "Hombre" || p.genero === "Unisex";
  if (tab === "Unisex") return p.genero === "Unisex";
  return false;
}

export const TABS_CATALOGO = [...CATEGORIAS, BOTELLAS_COMPLETAS, COMBOS, BAJO_PEDIDO] as const;

export type Perfume = {
  id: string;
  created_at?: string;
  categoria: string;
  marca: string;
  nombre: string;
  acordes: string | null;
  precio_3ml: number | null;
  precio_5ml: number | null;
  precio_10ml: number | null;
  tamano_frasco: string | null;
  precio_frasco: number | null;
  estado: string;
  imagen_url?: string | null;
  es_frasco_completo: boolean;
  es_bajo_pedido: boolean;
  genero?: string | null;
  subcategoria_id: string | null;
  ahorro_3ml?: number | null;
  ahorro_5ml?: number | null;
  ahorro_10ml?: number | null;
};

/**
 * Subcategorías dentro de una categoría real (Mujer, Hombre, etc.). A
 * diferencia de las categorías y de las tarjetas de catalogo_categorias, se
 * crean y borran libremente desde /admin/subcategorias — no hay fila
 * semilla. Un perfume sin subcategoria_id cae en el grupo "Otros".
 */
export type Subcategoria = {
  id: string;
  categoria: string;
  nombre: string;
  orden: number;
};

/** Cuánto ahorra el cliente (en dólares) con un combo en la presentación elegida; 0 si no aplica. */
export function ahorroDe(
  p: Pick<Perfume, "ahorro_3ml" | "ahorro_5ml" | "ahorro_10ml">,
  presentacion: string | undefined,
): number {
  const v =
    presentacion === "3 ml"
      ? p.ahorro_3ml
      : presentacion === "5 ml"
        ? p.ahorro_5ml
        : presentacion === "10 ml"
          ? p.ahorro_10ml
          : 0;
  return Number(v ?? 0);
}
