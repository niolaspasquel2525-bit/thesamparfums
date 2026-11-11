import { useEffect, useRef, useState } from "react";
import { ShieldCheck, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";
import { Modal } from "./Modal";
import { PlusBotella } from "./PlusBotella";
import { toast } from "sonner";
import { textoUnidades, unidadesDe, useStockSellados } from "@/lib/stock-sellados";
import { useCart } from "@/contexts/CartContext";
import { volarAlCarrito } from "@/lib/volarAlCarrito";
import { ahorroDe, esPreventa, tiempoPreventa, type Perfume } from "@/lib/thesamparfums";

export type Opcion = { label: string; precio: number };

export function precio(v: number | null) {
  return v === null || v === undefined ? "—" : `$${Number(v).toFixed(2)}`;
}

export function opciones(p: Perfume): Opcion[] {
  const lista: Opcion[] = [];
  if (p.precio_3ml !== null) lista.push({ label: "3 ml", precio: p.precio_3ml });
  if (p.precio_5ml !== null) lista.push({ label: "5 ml", precio: p.precio_5ml });
  if (p.precio_10ml !== null) lista.push({ label: "10 ml", precio: p.precio_10ml });
  if (p.precio_frasco !== null) {
    lista.push({
      label: p.tamano_frasco ? `Frasco ${p.tamano_frasco}` : "Frasco completo",
      precio: p.precio_frasco,
    });
  }
  return lista;
}

export function ProductoModal({
  perfume,
  opcionInicial,
  onClose,
}: {
  perfume: Perfume | null;
  opcionInicial: number;
  onClose: () => void;
}) {
  const { agregar, items } = useCart();
  const [elegido, setElegido] = useState(opcionInicial);
  const botonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setElegido(opcionInicial);
  }, [perfume, opcionInicial]);

  const lista = perfume ? opciones(perfume) : [];
  const activa = lista[elegido];
  const acordes = (perfume?.acordes ?? "")
    .split(",")
    .map((a) => a.trim())
    .filter(Boolean);

  const { data: stock } = useStockSellados();
  const unidades = perfume?.es_frasco_completo ? unidadesDe(stock?.mapa, perfume.id) : Infinity;
  const aviso = perfume?.es_frasco_completo ? textoUnidades(unidades) : null;
  const agotado = perfume?.estado === "Agotado" || unidades <= 0;
  const esBotella =
    !!perfume && (perfume.es_frasco_completo || /^frasco/i.test(activa?.label ?? ""));
  const preventa = esPreventa(perfume?.estado);
  const entrega = tiempoPreventa(perfume?.estado);

  const onAgregar = () => {
    if (agotado) return;
    if (!perfume || !activa) return;
    const enCarrito = items.find((i) => i.id === `${perfume.id}__${activa.label}`)?.cantidad ?? 0;
    if (enCarrito >= unidades) {
      toast.info(
        unidades === 1
          ? "Solo hay 1 unidad de este perfume y ya está en tu carrito."
          : `Solo hay ${unidades} unidades de este perfume y ya están en tu carrito.`,
      );
      return;
    }
    const origen = botonRef.current?.getBoundingClientRect();
    agregar({
      perfumeId: perfume.id,
      marca: perfume.marca,
      nombre: perfume.nombre,
      opcion: preventa
        ? `${activa.label} · Preventa${entrega ? ` (entrega ${entrega})` : ""}`
        : activa.label,
      precio: activa.precio,
      imagen: perfume.imagen_url,
      categoria: perfume.categoria,
      maximo: perfume.es_frasco_completo ? unidades : undefined,
    });
    // Se cierra la ficha para que el usuario vea el producto viajar al carrito.
    onClose();
    if (origen) requestAnimationFrame(() => volarAlCarrito(origen, perfume.imagen_url));
  };

  return (
    <Modal open={perfume !== null} onClose={onClose} title={perfume?.nombre ?? ""}>
      {perfume && (
        <div className="flex flex-col gap-6">
          <div
            className={cn(
              "relative flex items-center justify-center overflow-hidden rounded-xl border border-border",
              perfume.imagen_url
                ? "aspect-[4/3] bg-white"
                : "aspect-[4/3] bg-gradient-to-br from-gold/15 via-card/40 to-transparent",
            )}
          >
            {perfume.imagen_url ? (
              <img
                src={perfume.imagen_url}
                alt={`${perfume.marca} ${perfume.nombre}`}
                className="h-full w-full object-contain p-4"
              />
            ) : (
              <span aria-hidden="true" className="display-italic text-8xl text-gold/20">
                {perfume.marca.charAt(0)}
              </span>
            )}
          </div>

          <div>
            <p className="label-caps text-gold">{perfume.marca}</p>
            <p className="label-caps mt-1 text-muted-foreground">
              {perfume.marca === "Combo" ? "Promoción · 4 perfumes" : perfume.categoria}
            </p>
            {perfume.marca === "Combo" && (
              <p className="mt-4 text-sm text-muted-foreground">
                Incluye 1 decant de cada perfume, en la presentación que elijas:
              </p>
            )}
            {acordes.length > 0 && (
              <ul className="mt-4 flex flex-wrap gap-2">
                {acordes.map((a) => (
                  <li
                    key={a}
                    className="rounded-full border border-gold/25 bg-gold/5 px-3 py-1 text-[0.7rem] tracking-wide text-muted-foreground"
                  >
                    {a}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {lista.length > 0 ? (
            <>
              <div
                role="radiogroup"
                aria-label={`Presentación de ${perfume.nombre}`}
                className="flex flex-wrap gap-2"
              >
                {lista.map((op, i) => (
                  <button
                    key={op.label}
                    type="button"
                    role="radio"
                    aria-checked={elegido === i}
                    onClick={() => setElegido(i)}
                    className={cn(
                      "flex min-w-[4.5rem] flex-1 flex-col items-center gap-1 rounded-lg border px-3 py-3 transition-all duration-200",
                      elegido === i
                        ? "border-gold bg-gold text-background shadow-[0_10px_28px_-10px_rgba(180,146,76,0.6)]"
                        : "border-border text-foreground hover:border-gold/50 hover:bg-gold/5",
                    )}
                  >
                    <span className="label-caps text-[0.62rem] opacity-80">{op.label}</span>
                    <span className="text-base font-medium tabular-nums">{precio(op.precio)}</span>
                  </button>
                ))}
              </div>

              {aviso && !agotado && (
                <p className="text-center text-sm font-semibold tracking-wide text-[#b4452b]">
                  {aviso}: pocas unidades disponibles
                </p>
              )}
              {esBotella && !agotado && <PlusBotella categoria={perfume.categoria} />}
              {ahorroDe(perfume, activa?.label) > 0 && (
                <p className="rounded-lg border border-gold/40 bg-gold/10 px-4 py-3 text-center text-sm font-semibold text-gold-bright">
                  {perfume.marca === "Combo"
                    ? `¡Ahorras ${precio(ahorroDe(perfume, activa?.label))} con este combo!`
                    : `¡Bajó de precio! Ahorras ${precio(ahorroDe(perfume, activa?.label))}`}
                </p>
              )}
              <button
                ref={botonRef}
                type="button"
                onClick={onAgregar}
                disabled={agotado}
                className="label-caps flex items-center justify-center gap-2 border border-gold bg-gold px-4 py-4 text-background transition-colors hover:border-gold-bright hover:bg-gold-bright disabled:cursor-not-allowed disabled:border-border disabled:bg-transparent disabled:text-muted-foreground disabled:hover:bg-transparent"
              >
                <ShoppingBag className="h-4 w-4" />
                {agotado
                  ? "Agotado por ahora"
                  : `${preventa ? "Reservar en preventa" : "Agregar al carrito"} · ${precio(activa?.precio ?? null)}`}
              </button>
              {preventa && (
                <p className="rounded-xl border border-gold/40 bg-gold/5 px-4 py-3 text-center text-sm text-foreground">
                  <span className="font-medium text-gold-bright">Preventa.</span>{" "}
                  {entrega
                    ? `Entrega estimada: ${entrega}.`
                    : "Te confirmamos la fecha de entrega por WhatsApp."}
                </p>
              )}
              {agotado && (
                <p className="text-center text-sm text-muted-foreground">
                  Este perfume está agotado. Escríbenos por WhatsApp y te avisamos cuando vuelva.
                </p>
              )}
            </>
          ) : (
            <p className="text-sm text-muted-foreground">Precio a consultar.</p>
          )}

          <div className="flex items-start gap-3 rounded-xl border border-gold/25 bg-gold/5 px-5 py-4">
            <ShieldCheck aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-gold" />
            <div>
              <p className="label-caps text-gold-bright">100% originales</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Todos nuestros perfumes son originales. Elige la presentación que prefieras y
                agrégala al carrito para hacer tu pedido por WhatsApp.
              </p>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
