import { CAMPOS_PEDIDO_DEFAULT, type CampoPedido } from "@/lib/campos-pedido";

/** Esta demo no tiene backend ni panel de admin: el formulario de pedido usa siempre estos campos. */
export function useCamposPedido(): CampoPedido[] {
  return CAMPOS_PEDIDO_DEFAULT;
}

const AUTOCOMPLETE: Record<string, string> = {
  nombre: "name",
  direccion: "street-address",
  celular: "tel",
};

const field =
  "w-full border-b border-input bg-transparent px-0 py-3 text-base text-foreground placeholder:text-muted-foreground/60 transition-colors focus:border-gold focus:outline-none";

export function CamposDinamicos({
  campos,
  valores,
  onChange,
}: {
  campos: CampoPedido[];
  valores: Record<string, string>;
  onChange: (clave: string, valor: string) => void;
}) {
  return (
    <>
      {campos.map((c) => (
        <div key={c.id}>
          <label htmlFor={`campo-${c.clave}`} className="label-caps text-muted-foreground">
            {c.etiqueta}
            {!c.requerido && " (opcional)"}
          </label>
          {c.tipo === "textarea" ? (
            <textarea
              id={`campo-${c.clave}`}
              required={c.requerido}
              rows={3}
              value={valores[c.clave] ?? ""}
              onChange={(e) => onChange(c.clave, e.target.value)}
              className={`${field} resize-none`}
              placeholder={c.placeholder ?? ""}
            />
          ) : (
            <input
              id={`campo-${c.clave}`}
              required={c.requerido}
              type={c.tipo === "correo" ? "email" : c.tipo === "telefono" ? "tel" : "text"}
              inputMode={
                c.tipo === "telefono" ? "tel" : c.clave === "cedula" ? "numeric" : undefined
              }
              {...(c.clave === "cedula"
                ? { pattern: "[0-9]{10}", maxLength: 10, title: "La cédula tiene 10 dígitos" }
                : {})}
              autoComplete={AUTOCOMPLETE[c.clave]}
              value={valores[c.clave] ?? ""}
              onChange={(e) => onChange(c.clave, e.target.value)}
              className={field}
              placeholder={c.placeholder ?? ""}
            />
          )}
        </div>
      ))}
    </>
  );
}
