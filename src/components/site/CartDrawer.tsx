import { useEffect, useRef, useState } from "react";
import { Check, Gift, MapPin, Minus, Plus, Ticket, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { Modal } from "./Modal";
import { FotoPerfume } from "./FotoPerfume";
import { IconoWhatsApp } from "./IconoWhatsApp";
import { CamposDinamicos, useCamposPedido } from "./CamposDinamicos";
import { PERFUMES } from "@/lib/perfumes-data";
import { irAWhatsApp } from "@/lib/thesamparfums";
import { costoEnvio, ENVIO_OTRAS_CIUDADES } from "@/lib/envio";
import { esCiudadConocida } from "@/lib/ciudades-ecuador";
import { cuposSorteo, faltaParaSiguienteCupo } from "@/lib/sorteo";
import { textoRestante } from "@/lib/promo";
import {
  cumpleMinimo,
  descuentoDe,
  textoCodigo,
  validarCodigo,
  type CodigoPromo,
} from "@/lib/codigos";
import { usePromo } from "@/hooks/use-promo";
import { useCart } from "@/contexts/CartContext";

function precio(v: number) {
  return `$${v.toFixed(2)}`;
}

function PasoTitulo({
  n,
  texto,
  icono,
  hecho,
}: {
  n: number;
  texto: string;
  icono?: React.ReactNode;
  hecho?: boolean;
}) {
  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center gap-3">
        <span className="rounded-full bg-gold px-4 py-1.5 text-base font-bold tracking-[0.18em] text-background uppercase shadow-[0_6px_18px_-6px_rgba(180,146,76,0.9)]">
          Paso {n} de 3
        </span>
        {hecho && (
          <span
            role="img"
            aria-label="Listo"
            className="flex h-7 w-7 items-center justify-center rounded-full bg-[#25D366] text-white"
          >
            <Check aria-hidden="true" className="h-4 w-4" />
          </span>
        )}
        <span aria-hidden="true" className="flex flex-1 gap-1.5">
          {[1, 2, 3].map((k) => (
            <span
              key={k}
              className={`h-1.5 flex-1 rounded-full ${k <= n ? "bg-gold" : "bg-gold/25"}`}
            />
          ))}
        </span>
      </div>
      <span className="flex items-center gap-2 font-display text-2xl font-semibold text-gold-bright">
        {icono}
        {texto}
      </span>
    </div>
  );
}

export function CartDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void | Promise<void>;
}) {
  const { items, quitar, cambiarCantidad, vaciar, total: subtotal } = useCart();
  // La ciudad es un campo fijo del carrito (define el envío), así que si el
  // admin tiene otro campo "ciudad" en el formulario lo ocultamos para no pedirla dos veces.
  // La foto guardada en el carrito puede estar vacía (se agregó antes de que el perfume
  // tuviera foto, o la lista estaba en caché), así que siempre consultamos la actual.
  const idsPerfumes = [...new Set(items.map((i) => i.perfumeId))].sort();
  const fotos: Record<string, string | null> = Object.fromEntries(
    PERFUMES.filter((p) => idsPerfumes.includes(p.id)).map((p) => [p.id, p.imagen_url ?? null]),
  );
  const campos = useCamposPedido().filter((c) => c.clave !== "ciudad");
  const [valores, setValores] = useState<Record<string, string>>({});
  const [ciudad, setCiudad] = useState("");
  const [codigoTexto, setCodigoTexto] = useState("");
  const [codigo, setCodigo] = useState<CodigoPromo | null>(null);
  const [validando, setValidando] = useState(false);
  const [errorCodigo, setErrorCodigo] = useState("");
  const [acepta, setAcepta] = useState(false);
  const [enviando, setEnviando] = useState(false);
  // Los pasos se desbloquean en orden: ciudad -> datos -> enviar por WhatsApp.
  const [paso1Ok, setPaso1Ok] = useState(false);
  const [formValido, setFormValido] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const paso2Ref = useRef<HTMLDivElement>(null);
  const paso3Ref = useRef<HTMLDivElement>(null);

  const promo = usePromo();
  // El sorteo es exclusivo de los decants: los sellados no suman cupos.
  const subtotalDecants = items
    .filter((i) => !/^frasco/i.test(i.opcion))
    .reduce((acc, i) => acc + i.precio * i.cantidad, 0);
  const cupos = promo.visible ? cuposSorteo(subtotalDecants) : 0;
  // Toda botella completa lleva el envío incluido y una muestra gratis de su categoría.
  const botellas = items.filter((i) => /^frasco/i.test(i.opcion));
  const envioBase = costoEnvio(ciudad);
  const envio = envioBase === null ? null : botellas.length > 0 ? 0 : envioBase;
  const ciudadDudosa =
    ciudad.trim().length >= 3 && envioBase === ENVIO_OTRAS_CIUDADES && !esCiudadConocida(ciudad);
  // El código solo cuenta si el pedido llega a su compra mínima.
  const codigoVale = codigo && cumpleMinimo(codigo, subtotal) ? codigo : null;
  const descuento = descuentoDe(codigoVale, subtotal);
  const total = subtotal - descuento + (envio ?? 0);

  const categoriasRegalo = [
    ...new Set(botellas.map((i) => i.categoria).filter((c): c is string => !!c)),
  ].sort();
  const muestrasDisponibles = PERFUMES.filter(
    (p) =>
      categoriasRegalo.includes(p.categoria) &&
      !p.es_frasco_completo &&
      p.estado === "Disponible" &&
      p.marca !== "Combo" &&
      p.precio_3ml !== null,
  )
    .map((p) => ({ id: p.id, categoria: p.categoria, marca: p.marca, nombre: p.nombre }))
    .sort((a, b) => a.marca.localeCompare(b.marca, "es") || a.nombre.localeCompare(b.nombre, "es"));
  const [muestras, setMuestras] = useState<Record<string, string>>({});
  // Un regalo por cada botella (si lleva 2 iguales, 2 muestras).
  const regalos = botellas.flatMap((i) =>
    i.categoria
      ? Array.from({ length: i.cantidad }, (_, k) => ({ clave: `${i.id}#${k}`, item: i, n: k + 1 }))
      : [],
  );
  const nombreMuestra = (id: string) => {
    const m = muestrasDisponibles?.find((x) => x.id === id);
    return m ? `${m.marca} ${m.nombre}` : "";
  };
  const muestrasListas = regalos.every((r) => !!muestras[r.clave]);

  const ciudadValida = ciudad.trim().length >= 3 && muestrasListas;
  const paso3Listo = paso1Ok && formValido && envio !== null;

  // Si borran la ciudad, el paso 2 vuelve a bloquearse.
  useEffect(() => {
    if (!ciudadValida) setPaso1Ok(false);
  }, [ciudadValida]);

  // Con cada cambio, revisa si lo obligatorio del formulario está completo.
  useEffect(() => {
    setFormValido(formRef.current?.checkValidity() ?? false);
  }, [valores, acepta, ciudad, paso1Ok, campos.length]);

  useEffect(() => {
    if (paso1Ok)
      setTimeout(
        () => paso2Ref.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }),
        80,
      );
  }, [paso1Ok]);

  useEffect(() => {
    if (paso3Listo)
      setTimeout(
        () => paso3Ref.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }),
        80,
      );
  }, [paso3Listo]);

  const continuarPaso1 = () => {
    if (ciudadValida) setPaso1Ok(true);
  };

  const aplicarCodigo = async () => {
    if (!codigoTexto.trim() || validando) return;
    setValidando(true);
    setErrorCodigo("");
    let error = "";
    try {
      const c = await validarCodigo(codigoTexto);
      if (!c) {
        error = "Ese código no existe o ya venció.";
      } else if (!cumpleMinimo(c, subtotal)) {
        error = `El pedido no cumple el monto mínimo para aplicar este código (desde ${precio(c.compra_minima)}).`;
      } else {
        setCodigo(c);
        setCodigoTexto("");
        toast.success(`Código ${c.codigo} aplicado`);
      }
    } catch {
      error = "No pudimos revisar el código. Intenta de nuevo.";
    }
    if (error) {
      setErrorCodigo(error);
      toast.error(error);
    }
    setValidando(false);
  };

  const onChange = (clave: string, valor: string) => setValores((v) => ({ ...v, [clave]: valor }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paso3Listo || !acepta || enviando || items.length === 0 || envio === null) return;
    setEnviando(true);

    const listaMensaje = items
      .map(
        (i, idx) =>
          `${idx + 1}. ${i.marca} — ${i.nombre} (${i.opcion}) x${i.cantidad} — ${precio(i.precio * i.cantidad)}`,
      )
      .join("\n");

    const resumenPerfumes = items
      .map((i) => `${i.marca} ${i.nombre} (${i.opcion}) x${i.cantidad}`)
      .join(", ");

    const lineasDatos = [
      ...campos.map((c) => `${c.etiqueta}: ${valores[c.clave] ?? ""}`),
      `Ciudad: ${ciudad.trim()}`,
    ].join("\n");

    const mensaje = `Hola The Sam Parfums, quiero hacer este pedido:

${listaMensaje}

Subtotal: ${precio(subtotal)}${codigoVale && descuento > 0 ? `\nDescuento (${codigoVale?.codigo}): -${precio(descuento)}` : ""}
Envío (${ciudad.trim()}): ${botellas.length > 0 ? "INCLUIDO (botella completa)" : envio === 0 ? "GRATIS" : precio(envio)}
Total: ${precio(total)}${codigoVale ? `\n\n🎁 Código ${codigoVale.codigo}: ${textoCodigo(codigoVale)}` : ""}${cupos > 0 ? `\n\n🎟️ Cupos para el sorteo: ${cupos}` : ""}

${regalos.length > 0 ? `🎁 Muestra gratis por botella:\n${regalos.map((r) => `• ${r.item.marca} ${r.item.nombre} (${r.item.categoria}): ${nombreMuestra(muestras[r.clave] ?? "") || "a elegir"}`).join("\n")}\n\n` : ""}${lineasDatos}`;

    // Esta demo no tiene backend: no hay dónde guardar el pedido, así que se
    // va directo a WhatsApp (igual que hacían las otras demos de este tipo).
    setEnviando(false);
    vaciar();
    setValores({});
    setCiudad("");
    setCodigo(null);
    setCodigoTexto("");
    setErrorCodigo("");
    setAcepta(false);
    setPaso1Ok(false);
    setMuestras({});
    // Esperamos a que el historial vuelva antes de salir hacia WhatsApp.
    await onClose();

    irAWhatsApp(mensaje);
  };

  return (
    <Modal open={open} onClose={onClose} title="Tu carrito">
      {items.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          Tu carrito está vacío. Elige un perfume del catálogo y agrégalo.
        </p>
      ) : (
        <div className="flex max-h-[75dvh] flex-col gap-5 overflow-y-auto pr-1">
          <ul className="flex flex-col">
            {items.map((raw) => {
              const i = { ...raw, imagen: fotos?.[raw.perfumeId] ?? raw.imagen };
              return (
                <li
                  key={i.id}
                  className="flex items-center gap-3 border-b border-border/70 py-4 first:pt-0"
                >
                  <div
                    className={`relative flex h-20 w-20 shrink-0 items-center justify-center self-start overflow-hidden rounded-lg border border-border ${i.imagen ? "bg-white" : "bg-gradient-to-br from-gold/15 via-card/40 to-transparent"}`}
                  >
                    {i.imagen ? (
                      <FotoPerfume
                        src={i.imagen}
                        alt={`${i.marca} ${i.nombre}`}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-contain p-1"
                      />
                    ) : (
                      <span aria-hidden="true" className="display-italic text-3xl text-gold/40">
                        {i.marca.charAt(0)}
                      </span>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[0.65rem] tracking-[0.2em] text-gold uppercase">
                      {i.marca}
                    </p>
                    <p className="font-display text-xl leading-tight font-medium text-foreground">
                      {i.nombre}
                    </p>
                    <p className="text-xs text-muted-foreground">{i.opcion}</p>
                    {/preventa/i.test(i.opcion) && (
                      <p className="mt-1 rounded-md border border-gold/50 bg-gold/10 px-2 py-1 text-xs leading-snug text-foreground">
                        <strong className="font-semibold">Preventa:</strong>{" "}
                        {i.opcion.match(/entrega ([^)]+)\)/)?.[1]
                          ? `llega en ${i.opcion.match(/entrega ([^)]+)\)/)?.[1]}`
                          : "te confirmamos la fecha de llegada"}
                      </p>
                    )}
                    <div className="mt-2 flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => cambiarCantidad(i.id, i.cantidad - 1)}
                        aria-label="Restar"
                        className="flex h-7 w-7 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-gold hover:text-gold-bright"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-6 text-center text-sm tabular-nums text-foreground">
                        {i.cantidad}
                      </span>
                      <button
                        type="button"
                        onClick={() => cambiarCantidad(i.id, i.cantidad + 1)}
                        aria-label="Sumar"
                        className="flex h-7 w-7 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-gold hover:text-gold-bright"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  </div>

                  <div className="shrink-0 text-right">
                    <p className="text-lg font-medium tabular-nums text-foreground">
                      {precio(i.precio * i.cantidad)}
                    </p>
                    <p className="text-xs tabular-nums text-muted-foreground">
                      {precio(i.precio)} c/u
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => quitar(i.id)}
                    aria-label={`Quitar ${i.nombre}`}
                    className="shrink-0 self-start text-muted-foreground transition-colors hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              );
            })}
          </ul>

          {promo.visible && (
            <div
              className={`flex items-center gap-3 rounded-lg border px-4 py-3 ${
                cupos > 0 ? "border-gold/40 bg-gold/10" : "border-border bg-card/40"
              }`}
            >
              <Ticket aria-hidden="true" className="h-5 w-5 shrink-0 text-gold" />
              <p className="text-sm leading-snug text-muted-foreground">
                {cupos > 0 ? (
                  <>
                    <span className="font-medium text-gold-bright">
                      ¡Tienes {cupos} {cupos === 1 ? "cupo" : "cupos"} para el sorteo!
                    </span>{" "}
                    Otro cupo por {precio(faltaParaSiguienteCupo(subtotalDecants))} más en decants.
                  </>
                ) : (
                  <>
                    Con{" "}
                    <span className="font-medium text-foreground">
                      {precio(faltaParaSiguienteCupo(subtotalDecants))}
                    </span>{" "}
                    más en decants entras al sorteo.
                  </>
                )}
                <span className="mt-1 block text-xs text-gold/80">
                  Cierra en {promo.listo ? textoRestante(promo) : "…"}
                </span>
              </p>
            </div>
          )}

          <div className="rounded-lg border border-gold/40 bg-gold/10 px-4 py-3">
            {codigo ? (
              <div className="flex items-center gap-3">
                <Gift aria-hidden="true" className="h-5 w-5 shrink-0 text-gold" />
                <span className="flex min-w-0 flex-1 flex-col leading-tight">
                  <span className="label-caps text-gold-bright">Código {codigo.codigo}</span>
                  <span className="font-display text-lg italic text-foreground">
                    {textoCodigo(codigo)}
                  </span>
                  {!codigoVale && (
                    <span className="mt-1 text-xs text-gold/80">
                      Aplica en pedidos desde {precio(codigo.compra_minima)}. Te faltan{" "}
                      {precio(codigo.compra_minima - subtotal)}.
                    </span>
                  )}
                </span>
                <button
                  type="button"
                  onClick={() => setCodigo(null)}
                  aria-label="Quitar código"
                  className="shrink-0 text-muted-foreground transition-colors hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <label htmlFor="carrito-codigo" className="label-caps text-gold-bright">
                  ¿Tienes un código?
                </label>
                <div className="flex gap-2">
                  <input
                    id="carrito-codigo"
                    type="text"
                    autoCapitalize="characters"
                    autoComplete="off"
                    value={codigoTexto}
                    onChange={(e) => {
                      setCodigoTexto(e.target.value.toUpperCase());
                      setErrorCodigo("");
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        aplicarCodigo();
                      }
                    }}
                    placeholder="Escríbelo aquí"
                    className="min-w-0 flex-1 rounded-lg border border-gold/50 bg-background/70 px-3 py-2.5 text-base text-foreground uppercase placeholder:text-muted-foreground/60 placeholder:normal-case focus:border-gold-bright focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={aplicarCodigo}
                    disabled={validando || !codigoTexto.trim()}
                    className="label-caps border border-gold px-4 text-gold transition-colors hover:bg-gold hover:text-background disabled:opacity-50"
                  >
                    {validando ? "…" : "Aplicar"}
                  </button>
                </div>
                {errorCodigo && (
                  <p role="alert" className="text-sm text-destructive">
                    {errorCodigo}
                  </p>
                )}
              </div>
            )}
          </div>

          <form ref={formRef} onSubmit={onSubmit} className="flex flex-col gap-5">
            {regalos.length > 0 && (
              <div className="rounded-xl border-2 border-gold/60 bg-gold/10 p-4">
                <p className="label-caps flex items-center gap-2 text-gold-bright">
                  <Gift aria-hidden="true" className="h-4 w-4" />
                  Tu regalo incluido
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Cada botella incluye <strong className="text-foreground">1 decant gratis</strong>{" "}
                  de su categoría y el{" "}
                  <strong className="text-foreground">envío va incluido</strong>. Elige tu muestra:
                </p>
                <div className="mt-3 flex flex-col gap-3">
                  {regalos.map((r) => {
                    const opciones = (muestrasDisponibles ?? []).filter(
                      (m) => m.categoria === r.item.categoria,
                    );
                    const marcas = [...new Set(opciones.map((m) => m.marca))];
                    return (
                      <div key={r.clave}>
                        <label
                          htmlFor={`muestra-${r.clave}`}
                          className="text-xs text-muted-foreground"
                        >
                          Con tu {r.item.marca} {r.item.nombre}
                          {r.item.cantidad > 1 ? ` (botella ${r.n})` : ""} · {r.item.categoria}
                        </label>
                        <select
                          id={`muestra-${r.clave}`}
                          required
                          value={muestras[r.clave] ?? ""}
                          onChange={(e) =>
                            setMuestras((m) => ({ ...m, [r.clave]: e.target.value }))
                          }
                          className="mt-1 w-full rounded-lg border border-gold/50 bg-background/70 px-3 py-3 text-base text-foreground focus:border-gold-bright focus:outline-none"
                        >
                          <option value="">Elige tu decant gratis…</option>
                          {marcas.map((marca) => (
                            <optgroup key={marca} label={marca}>
                              {opciones
                                .filter((m) => m.marca === marca)
                                .map((m) => (
                                  <option key={m.id} value={m.id}>
                                    {m.nombre}
                                  </option>
                                ))}
                            </optgroup>
                          ))}
                        </select>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="rounded-xl border-2 border-gold/60 bg-gold/10 p-4 shadow-[0_12px_32px_-16px_rgba(180,146,76,0.7)]">
              <PasoTitulo
                n={1}
                texto="¿A qué ciudad enviamos?"
                icono={<MapPin className="h-5 w-5" />}
                hecho={paso1Ok}
              />
              <input
                id="carrito-ciudad"
                required
                type="text"
                autoComplete="address-level2"
                aria-label="Ciudad de envío"
                value={ciudad}
                onChange={(e) => setCiudad(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    continuarPaso1();
                  }
                }}
                placeholder="Escribe tu ciudad"
                className="mt-3 w-full rounded-lg border border-gold/50 bg-background/70 px-4 py-3.5 text-lg text-foreground placeholder:text-muted-foreground/60 transition-colors focus:border-gold-bright focus:outline-none"
              />
              {ciudadDudosa && (
                <p className="mt-2 text-xs text-muted-foreground">
                  ¿Está bien escrita? Si es correcta, sigue: el envío será de{" "}
                  {precio(ENVIO_OTRAS_CIUDADES)}.
                </p>
              )}
              {!paso1Ok && (
                <button
                  type="button"
                  onClick={continuarPaso1}
                  disabled={!ciudadValida}
                  className="label-caps mt-3 w-full border border-gold bg-gold px-6 py-3.5 text-background transition-colors hover:border-gold-bright hover:bg-gold-bright disabled:opacity-50"
                >
                  Continuar
                </button>
              )}
            </div>

            <dl className="flex flex-col gap-1.5 rounded-lg border border-border bg-card/40 px-4 py-3 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <dt>Subtotal</dt>
                <dd className="tabular-nums">{precio(subtotal)}</dd>
              </div>
              {descuento > 0 && (
                <div className="flex justify-between text-gold-bright">
                  <dt>Descuento ({codigo?.codigo})</dt>
                  <dd className="tabular-nums">-{precio(descuento)}</dd>
                </div>
              )}
              <div className="flex justify-between text-muted-foreground">
                <dt>Envío</dt>
                <dd className="tabular-nums">
                  {envio === null ? (
                    "Ingresa tu ciudad"
                  ) : botellas.length > 0 ? (
                    <span className="font-medium text-gold-bright">Incluido</span>
                  ) : envio === 0 ? (
                    <span className="font-medium text-gold-bright">¡Gratis!</span>
                  ) : (
                    precio(envio)
                  )}
                </dd>
              </div>
              <div className="mt-1 flex items-baseline justify-between border-t border-border pt-2">
                <dt className="label-caps text-foreground">Total</dt>
                <dd className="font-display text-3xl font-medium tabular-nums text-gold-bright">
                  {precio(total)}
                </dd>
              </div>
            </dl>

            {paso1Ok && (
              <div
                ref={paso2Ref}
                className="flex scroll-mb-40 animate-in flex-col gap-5 duration-500 fade-in slide-in-from-bottom-3"
              >
                <div className="flex flex-col gap-4 border-t border-border pt-5">
                  <PasoTitulo n={2} texto="Tus datos" hecho={paso3Listo} />
                  <CamposDinamicos campos={campos} valores={valores} onChange={onChange} />
                </div>

                <label className="flex cursor-pointer items-start gap-3 text-xs leading-relaxed text-muted-foreground">
                  <input
                    type="checkbox"
                    required
                    checked={acepta}
                    onChange={(e) => setAcepta(e.target.checked)}
                    className="mt-0.5 h-4 w-4 shrink-0 accent-[oklch(0.658_0.087_84)]"
                  />
                  <span>
                    Acepto la Política de Privacidad y el uso de mis datos para gestionar mi pedido
                    y envío.
                  </span>
                </label>
              </div>
            )}

            {paso3Listo && (
              <div
                ref={paso3Ref}
                className="scroll-mb-40 animate-in duration-500 fade-in slide-in-from-bottom-3"
              >
                <div className="rounded-xl border-2 border-[#25D366]/60 bg-[#25D366]/10 p-4">
                  <PasoTitulo n={3} texto="Así pagas" />
                  <ol className="mt-3 flex flex-col gap-2 text-sm text-foreground">
                    {[
                      "Envías tu pedido por WhatsApp",
                      "Te confirmamos el total y cómo pagar",
                      "Pagas y mandas el comprobante",
                    ].map((paso, n) => (
                      <li key={paso} className="flex items-center gap-3">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-gold/60 text-xs font-semibold text-gold-bright">
                          {String.fromCharCode(97 + n)}
                        </span>
                        {paso}
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            )}

            <div className="sticky bottom-0 -mx-1 flex flex-col gap-2 border-t border-gold/40 bg-card/95 px-1 pt-3 pb-1 backdrop-blur-md">
              <div className="flex items-baseline justify-between">
                <span className="label-caps text-muted-foreground">
                  Total
                  {botellas.length > 0 ? " · envío incluido" : envio === 0 ? " · envío gratis" : ""}
                </span>
                <span className="font-display text-2xl font-medium tabular-nums text-gold-bright">
                  {precio(total)}
                </span>
              </div>
              {paso3Listo ? (
                <button
                  type="submit"
                  disabled={enviando}
                  className="animate-in flex items-center justify-center gap-3 rounded-full bg-[#25D366] px-8 py-4 text-base font-semibold tracking-wide text-white shadow-[0_10px_28px_-10px_rgba(37,211,102,0.9)] transition-colors duration-500 fade-in hover:bg-[#1ebe5b] disabled:opacity-60"
                >
                  <IconoWhatsApp className="h-6 w-6" />
                  {enviando ? "Enviando…" : "Enviar pedido por WhatsApp"}
                </button>
              ) : (
                <p className="py-2 text-center text-sm text-muted-foreground">
                  {!muestrasListas
                    ? "Elige tu muestra gratis para continuar"
                    : !paso1Ok
                      ? "Empieza por el paso 1: tu ciudad"
                      : "Completa tus datos para poder enviar tu pedido"}
                </p>
              )}
            </div>
          </form>
        </div>
      )}
    </Modal>
  );
}
