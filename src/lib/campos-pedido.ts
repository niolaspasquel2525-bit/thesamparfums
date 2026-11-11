export type TipoCampo = "texto" | "telefono" | "correo" | "textarea";

export type CampoPedido = {
  id: string;
  clave: string;
  etiqueta: string;
  tipo: TipoCampo;
  placeholder: string | null;
  requerido: boolean;
  activo: boolean;
  orden: number;
};

export const TIPOS_CAMPO: { value: TipoCampo; label: string }[] = [
  { value: "texto", label: "Texto corto" },
  { value: "telefono", label: "Teléfono" },
  { value: "correo", label: "Correo electrónico" },
  { value: "textarea", label: "Texto largo" },
];

// Si campos_pedido está vacía (nunca debería pasar tras la migración, pero
// por si acaso) o la consulta todavía no responde, usamos estos 3 campos
// como respaldo para que el formulario de contacto nunca quede vacío.
export const CAMPOS_PEDIDO_DEFAULT: CampoPedido[] = [
  {
    id: "nombre",
    clave: "nombre",
    etiqueta: "Nombres completos",
    tipo: "texto",
    placeholder: "Nombre y apellido",
    requerido: true,
    activo: true,
    orden: 0,
  },
  {
    id: "direccion",
    clave: "direccion",
    etiqueta: "Dirección de envío",
    tipo: "texto",
    placeholder: "Calle principal, número y barrio",
    requerido: true,
    activo: true,
    orden: 1,
  },
  {
    id: "referencia",
    clave: "referencia",
    etiqueta: "Referencia",
    tipo: "texto",
    placeholder: "Ej. frente al parque, casa blanca de dos pisos",
    requerido: true,
    activo: true,
    orden: 2,
  },
  {
    id: "celular",
    clave: "celular",
    etiqueta: "Celular / WhatsApp",
    tipo: "telefono",
    placeholder: "09XXXXXXXX",
    requerido: true,
    activo: true,
    orden: 3,
  },
  {
    id: "cedula",
    clave: "cedula",
    etiqueta: "Cédula de identidad",
    tipo: "texto",
    placeholder: "10 dígitos",
    requerido: true,
    activo: true,
    orden: 4,
  },
];

export function slugifyClave(texto: string): string {
  const base = texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
  return base || "campo";
}
