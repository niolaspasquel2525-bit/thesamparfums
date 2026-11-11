import { useEffect, useMemo, useRef, useState } from "react";
import { Clock, PackageSearch, Search, TrendingDown, X } from "lucide-react";
import { PERFUMES, SUBCATEGORIAS } from "@/lib/perfumes-data";
import { FotoPerfume } from "./FotoPerfume";
import { CategoriasNav } from "./CategoriasNav";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { useCart } from "@/contexts/CartContext";
import { useModal } from "@/contexts/ModalContext";
import {
  BAJO_PEDIDO,
  BOTELLAS_COMPLETAS,
  ETIQUETA_SELLADOS,
  COMBOS,
  ahorroDe,
  esPreventa,
  tiempoPreventa,
  TODAS,
  CATEGORIAS,
  TABS_CATALOGO,
  coincideCategoria,
  waLink,
  type Perfume,
} from "@/lib/thesamparfums";
import { lleva, useAjustesNuevo } from "@/lib/nuevo-marcas";
import { volarAlCarrito } from "@/lib/volarAlCarrito";
import { CONFIG_SITIO_DEFAULT } from "@/lib/apariencia";
import { Ornament } from "./Ornament";
import { PlusBotella } from "./PlusBotella";
import { textoUnidades, unidadesDe, useStockSellados } from "@/lib/stock-sellados";
import { toast } from "sonner";
import { ProductoModal, opciones, precio, type Opcion } from "./ProductoModal";

function normalizar(texto: string) {
  return texto.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

const TIPOS = ["Árabes", "Diseñador", "Nicho", "Artesanal", "Testers"] as const;
const GENEROS = ["Mujer", "Hombre", "Unisex"] as const;

const ORDENES = [
  { id: "recientes", etiqueta: "Más nuevos primero" },
  { id: "nombre", etiqueta: "Nombre (A–Z)" },
  { id: "menor", etiqueta: "Precio: menor a mayor" },
  { id: "mayor", etiqueta: "Precio: mayor a menor" },
] as const;

function precioDesde(p: Perfume) {
  const o = opciones(p);
  return o.length > 0 ? Math.min(...o.map((x) => x.precio)) : Infinity;
}

function TarjetaSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      <Skeleton className="aspect-square w-full rounded-xl bg-gold/5" />
      <Skeleton className="h-3 w-16 bg-gold/10" />
      <Skeleton className="h-4 w-28 bg-foreground/10" />
      <Skeleton className="h-4 w-20 bg-foreground/10" />
    </div>
  );
}

function Tarjeta({ p, onVer }: { p: Perfume; onVer: (opcionInicial: number) => void }) {
  const lista = useMemo(() => opciones(p), [p]);
  const [elegido, setElegido] = useState(0);
  const activa = lista[elegido];
  const { agregar, items } = useCart();
  const botonRef = useRef<HTMLButtonElement>(null);
  const { data: stock } = useStockSellados();
  // Los sellados tienen unidades limitadas: sin número anotado, hay una sola.
  const unidades = p.es_frasco_completo ? unidadesDe(stock?.mapa, p.id) : Infinity;
  const aviso = p.es_frasco_completo ? textoUnidades(unidades) : null;
  const agotado = p.estado === "Agotado" || unidades <= 0;
  const preventa = esPreventa(p.estado);
  const { data: ajustesNuevo } = useAjustesNuevo();
  const nuevo =
    lleva(p.id, p.created_at, ajustesNuevo) && p.marca !== "Combo" && !esPreventa(p.estado);
  const entrega = tiempoPreventa(p.estado);
  const bajoPrecio =
    p.marca !== "Combo" &&
    [p.ahorro_3ml, p.ahorro_5ml, p.ahorro_10ml].some((v) => Number(v ?? 0) > 0);

  const onAgregarCarrito = () => {
    if (!activa || agotado) return;
    const enCarrito = items.find((i) => i.id === `${p.id}__${activa.label}`)?.cantidad ?? 0;
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
      perfumeId: p.id,
      marca: p.marca,
      nombre: p.nombre,
      opcion: preventa
        ? `${activa.label} · Preventa${entrega ? ` (entrega ${entrega})` : ""}`
        : activa.label,
      precio: activa.precio,
      imagen: p.imagen_url,
      categoria: p.categoria,
      maximo: p.es_frasco_completo ? unidades : undefined,
    });
    if (origen) volarAlCarrito(origen, p.imagen_url);
  };

  return (
    <article className="group flex flex-col">
      <button
        type="button"
        onClick={() => onVer(elegido)}
        aria-label={`Ver detalles de ${p.marca} ${p.nombre}`}
        className="block w-full cursor-pointer text-left"
      >
        <span
          className={cn(
            "relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-xl border border-border",
            p.imagen_url ? "bg-white" : "bg-gradient-to-br from-gold/15 via-card/40 to-transparent",
          )}
        >
          {p.marca === "Combo" && (
            <span className="label-caps absolute top-2 left-2 z-10 rounded-full bg-gold px-2.5 py-1 text-[0.55rem] text-background shadow">
              Combo
            </span>
          )}
          {nuevo && (
            <span className="label-caps absolute top-2 left-2 z-10 rounded-full bg-gold px-2.5 py-1 text-[0.55rem] text-background shadow">
              Nuevo
            </span>
          )}
          {bajoPrecio && !agotado && (
            <span className="label-caps absolute bottom-2 left-2 z-10 flex items-center gap-1 rounded-full bg-[#1f7a4d] px-2.5 py-1 text-[0.55rem] text-white shadow">
              <TrendingDown aria-hidden="true" className="h-3 w-3" />
              Bajó de precio
            </span>
          )}
          {agotado && (
            <span className="label-caps absolute top-2 right-2 z-10 rounded-full bg-foreground px-2.5 py-1 text-[0.55rem] text-background shadow">
              Agotado
            </span>
          )}
          {preventa && (
            <span className="label-caps absolute top-2 right-2 z-10 rounded-full bg-gold px-2.5 py-1 text-[0.55rem] text-background shadow">
              Preventa
            </span>
          )}
          {p.imagen_url ? (
            <FotoPerfume
              src={p.imagen_url}
              alt={`${p.marca} ${p.nombre}`}
              loading="lazy"
              decoding="async"
              className={cn(
                "absolute inset-0 h-full w-full object-contain p-3 transition-transform duration-500 group-hover:scale-105",
                agotado && "opacity-45 grayscale",
              )}
            />
          ) : (
            <span aria-hidden="true" className="display-italic text-6xl text-gold/20 select-none">
              {p.marca.charAt(0)}
            </span>
          )}
        </span>
        <span className="label-caps mt-3 block text-[0.62rem] text-muted-foreground">
          {p.marca}
        </span>
        <span className="mt-1 block text-[0.95rem] leading-snug font-medium text-foreground sm:text-base">
          {p.nombre}
        </span>
        {preventa && (
          <span className="mt-1.5 flex items-start gap-1.5 rounded-lg border border-gold/50 bg-gold/10 px-2 py-1.5 text-[0.7rem] leading-snug text-foreground">
            <Clock aria-hidden="true" className="mt-px h-3.5 w-3.5 shrink-0 text-gold" />
            <span>
              <strong className="font-semibold">Preventa:</strong>{" "}
              {entrega ? `llega en ${entrega}` : "te confirmamos la fecha de llegada"}
            </span>
          </span>
        )}
        {aviso && !agotado && (
          <span className="mt-1 block text-[0.72rem] font-semibold tracking-wide text-[#b4452b]">
            {aviso}
          </span>
        )}
      </button>

      {lista.length > 0 ? (
        <>
          <div
            role="radiogroup"
            aria-label={`Presentación de ${p.nombre}`}
            className="mt-2.5 flex gap-1"
          >
            {lista.map((op, i) => (
              <button
                key={op.label}
                type="button"
                role="radio"
                aria-checked={elegido === i}
                onClick={() => setElegido(i)}
                disabled={agotado}
                className={cn(
                  agotado && "opacity-50",
                  "min-w-0 flex-1 rounded-md border px-0.5 py-1.5 text-center text-[0.65rem] font-medium whitespace-nowrap transition-colors",
                  elegido === i
                    ? "border-gold bg-gold text-background"
                    : "border-border text-foreground hover:border-gold/60",
                )}
              >
                {op.label.startsWith("Frasco") ? "Frasco" : op.label}
              </button>
            ))}
          </div>
          {(p.es_frasco_completo || /^frasco/i.test(activa?.label ?? "")) && !agotado && (
            <PlusBotella categoria={p.categoria} compacto />
          )}
          {ahorroDe(p, activa?.label) > 0 && (
            <p className="mt-2 text-center text-[0.72rem] font-semibold tracking-wide text-gold-bright">
              Ahorras {precio(ahorroDe(p, activa?.label))}
            </p>
          )}
          <button
            ref={botonRef}
            type="button"
            onClick={onAgregarCarrito}
            disabled={agotado}
            className="label-caps mt-2.5 w-full border border-gold bg-gold px-1 py-3 text-[0.62rem] font-semibold tracking-[0.1em] whitespace-nowrap text-background transition-colors hover:border-gold-bright hover:bg-gold-bright disabled:cursor-not-allowed disabled:border-border disabled:bg-transparent disabled:text-muted-foreground disabled:hover:bg-transparent"
          >
            {agotado
              ? "Agotado"
              : `${preventa ? "Reservar" : "Agregar"} · ${precio(activa?.precio ?? null)}`}
          </button>
        </>
      ) : (
        <p className="mt-2 text-sm text-muted-foreground">Precio a consultar</p>
      )}
    </article>
  );
}

function PedidoEspecial({ ejemplos }: { ejemplos: Perfume[] }) {
  const [busqueda, setBusqueda] = useState("");

  const mensaje = busqueda.trim()
    ? `Hola The Sam Parfums, quiero pedir "${busqueda.trim()}" en botella sellada (bajo pedido, no decant).`
    : "Hola The Sam Parfums, quiero consultar sobre un perfume específico en botella sellada, bajo pedido.";

  return (
    <div className="mx-auto max-w-xl rounded-2xl border border-border bg-card/30 px-8 py-14 text-center">
      <PackageSearch aria-hidden="true" className="mx-auto h-8 w-8 text-gold" />
      <p className="display-italic mt-5 text-2xl text-foreground">Perfumes bajo pedido</p>
      <p className="mt-4 text-sm text-muted-foreground">
        ¿Buscas una fragancia que no vendemos en decant? La traemos para ti en su botella sellada
        original — bajo pedido, sin decant.
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          window.open(waLink(mensaje), "_blank", "noopener,noreferrer");
        }}
        className="mt-8 flex flex-col gap-4 sm:flex-row"
      >
        <input
          type="text"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="¿Qué perfume buscas? (marca y nombre)"
          className="min-w-0 flex-1 rounded-lg border border-input bg-background/60 px-4 py-3 text-base text-foreground placeholder:text-muted-foreground/60 transition-colors focus:border-gold focus:outline-none"
        />
        <button
          type="submit"
          className="label-caps shrink-0 border border-gold bg-gold px-6 py-3 text-background transition-colors hover:border-gold-bright hover:bg-gold-bright"
        >
          Consultar por WhatsApp
        </button>
      </form>

      {ejemplos.length > 0 && (
        <div className="mt-10 border-t border-border pt-8">
          <p className="label-caps text-muted-foreground">Algunas marcas que sí podemos traer</p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {ejemplos.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setBusqueda(`${p.marca} ${p.nombre}`)}
                className="rounded-full border border-gold/25 bg-gold/5 px-3 py-1.5 text-[0.75rem] text-muted-foreground transition-colors hover:border-gold/60 hover:text-gold-bright"
              >
                {p.marca} — {p.nombre}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const REJILLA = "grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4";

/**
 * Lista de perfumes; si `agrupar`, separada por marca con un subtítulo (A–Z) y, dentro de cada
 * marca, los perfumes en el orden recibido.
 */
function ListaPorMarca({
  items,
  agrupar,
  onVer,
}: {
  items: Perfume[];
  agrupar: boolean;
  onVer: (p: Perfume, opcion: number) => void;
}) {
  if (!agrupar) {
    return (
      <div className={REJILLA}>
        {items.map((p) => (
          <Tarjeta key={p.id} p={p} onVer={(o) => onVer(p, o)} />
        ))}
      </div>
    );
  }
  const grupos = new Map<string, Perfume[]>();
  for (const p of items) {
    const clave = p.marca.trim();
    grupos.set(clave, [...(grupos.get(clave) ?? []), p]);
  }
  const marcas = [...grupos.keys()].sort((a, b) =>
    a.localeCompare(b, "es", { sensitivity: "base" }),
  );
  return (
    <div className="flex flex-col gap-10">
      {marcas.map((m) => {
        const lista = grupos.get(m) ?? [];
        return (
          <section key={m} aria-label={m === "Combo" ? "Combos" : m}>
            <h4 className="mb-4 flex items-baseline gap-3 border-b border-border pb-2">
              <span className="font-display text-2xl font-medium text-foreground sm:text-3xl">
                {m === "Combo" ? "Combos" : m}
              </span>
              <span className="label-caps text-[0.62rem] text-muted-foreground">
                {lista.length} {lista.length === 1 ? "perfume" : "perfumes"}
              </span>
            </h4>
            <div className={REJILLA}>
              {lista.map((p) => (
                <Tarjeta key={p.id} p={p} onVer={(o) => onVer(p, o)} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

/** Los enlaces antiguos (?categoria=Mujer) se convierten en: todo el catálogo + filtro de género. */
function vistaInicial(c: string | undefined) {
  if ((GENEROS as readonly string[]).includes(c ?? ""))
    return { categoria: TODAS as string, genero: c as string };
  return { categoria: c ?? (TODAS as string), genero: "todos" };
}

export function Catalogo({
  categoriaInicial,
  ordenInicial,
  busquedaInicial,
  onCategoriaChange,
}: {
  categoriaInicial?: string | undefined;
  ordenInicial?: "recientes" | undefined;
  busquedaInicial?: string | undefined;
  onCategoriaChange?: (categoria: string) => void;
} = {}) {
  const inicial = vistaInicial(categoriaInicial);
  const [categoria, setCategoriaState] = useState<string>(inicial.categoria);
  const [genero, setGenero] = useState<string>(inicial.genero);
  const [seleccionado, setSeleccionado] = useState<{ perfume: Perfume; opcion: number } | null>(
    null,
  );
  const [subTab, setSubTab] = useState<string>("todos");
  const [busqueda, setBusqueda] = useState(busquedaInicial ?? "");
  const [soloDisponibles, setSoloDisponibles] = useState(false);
  const [orden, setOrden] = useState<(typeof ORDENES)[number]["id"]>(
    ordenInicial === "recientes" ? "recientes" : "nombre",
  );
  const { activo, abrir, cerrar } = useModal();
  const productoAbierto = activo === "producto" ? seleccionado : null;

  useEffect(() => {
    if (!categoriaInicial) return;
    const v = vistaInicial(categoriaInicial);
    if (v.categoria !== categoria) setCategoriaState(v.categoria);
    if (v.genero !== "todos") setGenero(v.genero);
    // Solo re-sincroniza cuando cambia la fuente externa (ej. navegación con atrás/adelante).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoriaInicial]);

  const setCategoria = (c: string) => {
    setCategoriaState(c);
    setSubTab("todos");
    setBusqueda("");
    onCategoriaChange?.(c);
  };

  const subcategorias = SUBCATEGORIAS;
  const subcategoriasDeCategoria = subcategorias.filter((s) => s.categoria === categoria);

  const mostrarOtros = CONFIG_SITIO_DEFAULT.catalogo_mostrar_otros;

  useEffect(() => {
    if (!mostrarOtros && subTab === "otros") setSubTab("todos");
  }, [mostrarOtros, subTab]);

  const data = PERFUMES.filter((p) => p.estado === "Disponible" || p.estado === "Agotado" || p.estado.startsWith("Preventa"));
  const isLoading = false;
  const isError = false;
  const isRefetching = false;
  const refetch = () => {};

  const termino = normalizar(busqueda.trim());
  const coincide = (p: Perfume) =>
    !termino || normalizar(`${p.marca} ${p.nombre}`).includes(termino);

  const esTodas = categoria === TODAS;
  const nombreCategoria = categoria === BOTELLAS_COMPLETAS ? ETIQUETA_SELLADOS : categoria;

  const coincideGenero = (p: Perfume) => genero === "todos" || coincideCategoria(p, genero);

  const coincideDisponible = (p: Perfume) => !soloDisponibles || p.estado !== "Agotado";

  const listaBase =
    categoria === BOTELLAS_COMPLETAS
      ? (data ?? [])
          .filter((p) => p.es_frasco_completo && coincideGenero(p))
          .filter(coincide)
          .filter(coincideDisponible)
      : (data ?? [])
          .filter((p) => {
            if (p.es_frasco_completo) return false;
            if (categoria === COMBOS) return p.marca === "Combo";
            if (esTodas) return true;
            return p.categoria === categoria;
          })
          .filter(coincideGenero)
          .filter(coincide)
          .filter(coincideDisponible)
          .filter((p) => {
            if (subTab === "todos") return true;
            if (subTab === "otros") return !p.subcategoria_id;
            return p.subcategoria_id === subTab;
          });

  // En "Todos" el catálogo se agrupa por estilo (Árabes, Diseñador, Nicho, Artesanal).
  const conteoPorTipo = Object.fromEntries(
    TIPOS.map((t) => [t, listaBase.filter((p) => p.categoria === t).length]),
  ) as Record<(typeof TIPOS)[number], number>;
  const tiposDisponibles = TIPOS.filter((t) => conteoPorTipo[t] > 0);
  // Los agotados se quedan en su categoría; solo van al final cuando el orden no es alfabético.
  const alFinal = (arr: Perfume[]) => [
    ...arr.filter((p) => p.estado !== "Agotado"),
    ...arr.filter((p) => p.estado === "Agotado"),
  ];
  const listaFiltrada = listaBase;
  const lista =
    orden === "nombre"
      ? [...listaFiltrada].sort((x, y) =>
          x.nombre.localeCompare(y.nombre, "es", { sensitivity: "base", numeric: true }),
        )
      : alFinal(
          orden === "recientes"
            ? [...listaFiltrada].sort((x, y) =>
                (y.created_at ?? "").localeCompare(x.created_at ?? ""),
              )
            : [...listaFiltrada].sort((x, y) =>
                orden === "menor"
                  ? precioDesde(x) - precioDesde(y)
                  : precioDesde(y) - precioDesde(x),
              ),
        );

  // Separado por marca, salvo cuando se ordena por novedad (ahí manda la fecha).
  const agruparPorMarca = orden !== "recientes";
  const abrirProducto = (perfume: Perfume, opcion: number) => {
    setSeleccionado({ perfume, opcion });
    abrir("producto");
  };

  const ejemplosBajoPedido = (data ?? []).filter((p) => p.es_bajo_pedido);

  return (
    <section id="catalogo" className="relative mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-28">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[32rem] bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(180,146,76,0.09),transparent_70%)]"
      />

      <Ornament />
      <h2 className="display-italic mt-7 text-center text-4xl text-foreground sm:text-5xl">
        Catálogo
      </h2>
      <p className="mx-auto mt-4 max-w-md text-center text-sm text-muted-foreground">
        Elige una categoría, filtra por género y agrega tus perfumes al carrito.
      </p>

      <CategoriasNav categoria={categoria} onSelect={setCategoria} />

      <div className="mt-2 flex flex-col items-center gap-3">
        {categoria !== TODAS && categoria !== BAJO_PEDIDO && (
          <button
            type="button"
            onClick={() => setCategoria(TODAS)}
            className="label-caps text-[0.65rem] text-gold transition-colors hover:text-gold-bright"
          >
            ← Ver todo el catálogo
          </button>
        )}
        {categoria === TODAS && (
          <p className="text-xs text-muted-foreground">
            También:{" "}
            {["Artesanal", BAJO_PEDIDO].map((c, i) => (
              <span key={c}>
                {i > 0 && " · "}
                <button
                  type="button"
                  onClick={() => setCategoria(c)}
                  className="text-gold underline-offset-2 transition-colors hover:text-gold-bright hover:underline"
                >
                  {c}
                </button>
              </span>
            ))}
          </p>
        )}
        {categoria !== BAJO_PEDIDO && (
          <div
            role="radiogroup"
            aria-label="Filtrar por género"
            className="flex items-center gap-1 rounded-full border border-border p-1"
          >
            {["todos", ...GENEROS].map((g) => (
              <button
                key={g}
                type="button"
                role="radio"
                aria-checked={genero === g}
                onClick={() => setGenero(g)}
                className={cn(
                  "rounded-full px-4 py-1.5 text-sm transition-colors",
                  genero === g
                    ? "bg-gold font-medium text-background"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {g === "todos" ? "Todos" : g}
              </button>
            ))}
          </div>
        )}
      </div>

      {categoria !== BAJO_PEDIDO && (
        <div className="mt-4 overflow-x-auto pb-1">
          <div
            role="group"
            aria-label="Disponibilidad"
            className="mx-auto flex w-max min-w-full items-center justify-center gap-2"
          >
            <button
              type="button"
              aria-pressed={soloDisponibles}
              onClick={() => setSoloDisponibles((v) => !v)}
              className={cn(
                "shrink-0 rounded-full border px-3.5 py-1.5 text-xs transition-colors",
                soloDisponibles
                  ? "border-gold/70 bg-gold/10 text-gold-bright"
                  : "border-border/60 text-muted-foreground hover:border-gold/30 hover:text-foreground",
              )}
            >
              Solo disponibles
            </button>
          </div>
        </div>
      )}

      {(CATEGORIAS as readonly string[]).includes(categoria) &&
        subcategoriasDeCategoria.length > 0 && (
          <div className="mt-5 overflow-x-auto pb-2">
            <div
              role="tablist"
              aria-label="Subcategorías"
              className="mx-auto flex w-max min-w-full justify-start gap-2 sm:justify-center"
            >
              <button
                type="button"
                role="tab"
                aria-selected={subTab === "todos"}
                onClick={() => setSubTab("todos")}
                className={cn(
                  "label-caps whitespace-nowrap rounded-full border px-4 py-1.5 text-xs transition-colors duration-300",
                  subTab === "todos"
                    ? "border-gold/60 text-gold-bright"
                    : "border-border/60 text-muted-foreground hover:border-gold/30 hover:text-foreground",
                )}
              >
                Todos
              </button>
              {subcategoriasDeCategoria.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  role="tab"
                  aria-selected={subTab === s.id}
                  onClick={() => setSubTab(s.id)}
                  className={cn(
                    "label-caps whitespace-nowrap rounded-full border px-4 py-1.5 text-xs transition-colors duration-300",
                    subTab === s.id
                      ? "border-gold/60 text-gold-bright"
                      : "border-border/60 text-muted-foreground hover:border-gold/30 hover:text-foreground",
                  )}
                >
                  {s.nombre}
                </button>
              ))}
              {mostrarOtros && (
                <button
                  type="button"
                  role="tab"
                  aria-selected={subTab === "otros"}
                  onClick={() => setSubTab("otros")}
                  className={cn(
                    "label-caps whitespace-nowrap rounded-full border px-4 py-1.5 text-xs transition-colors duration-300",
                    subTab === "otros"
                      ? "border-gold/60 text-gold-bright"
                      : "border-border/60 text-muted-foreground hover:border-gold/30 hover:text-foreground",
                  )}
                >
                  Otros
                </button>
              )}
            </div>
          </div>
        )}

      {categoria !== BAJO_PEDIDO && (
        <div className="relative mx-auto mt-8 max-w-md">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="search"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder={esTodas ? "Buscar perfume" : `Buscar perfume en ${nombreCategoria}`}
            aria-label="Buscar perfume por nombre"
            className="w-full rounded-full border border-input bg-background/60 py-3 pr-10 pl-11 text-base text-foreground placeholder:text-muted-foreground/60 transition-colors focus:border-gold focus:outline-none [&::-webkit-search-cancel-button]:appearance-none"
          />
          {busqueda && (
            <button
              type="button"
              onClick={() => setBusqueda("")}
              aria-label="Borrar búsqueda"
              className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground transition-colors hover:text-gold-bright"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      )}

      {categoria !== BAJO_PEDIDO && !isLoading && !isError && lista.length > 0 && (
        <div className="mt-8 flex items-center justify-between gap-3 border-b border-border pb-3">
          <p className="shrink-0 text-sm whitespace-nowrap text-muted-foreground">
            {lista.length} {lista.length === 1 ? "perfume" : "perfumes"}
          </p>
          <label className="flex min-w-0 items-center gap-2 text-sm text-muted-foreground">
            <span className="label-caps text-[0.62rem]">Ordenar</span>
            <select
              value={orden}
              onChange={(e) => setOrden(e.target.value as (typeof ORDENES)[number]["id"])}
              className="min-w-0 rounded-lg border border-input bg-background px-3 py-2 text-base text-foreground focus:border-gold focus:outline-none"
            >
              {ORDENES.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.etiqueta}
                </option>
              ))}
            </select>
          </label>
        </div>
      )}

      <div className="mt-8">
        {categoria === BAJO_PEDIDO ? (
          <PedidoEspecial ejemplos={ejemplosBajoPedido} />
        ) : isLoading ? (
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <TarjetaSkeleton key={i} />
            ))}
          </div>
        ) : isError ? (
          <div className="mx-auto max-w-lg rounded-2xl border border-border px-8 py-14 text-center">
            <p className="display-italic text-2xl text-foreground">
              No pudimos cargar el catálogo.
            </p>
            <p className="mt-4 text-sm text-muted-foreground">
              Puede ser tu conexión o un problema momentáneo de nuestro lado.
            </p>
            <button
              type="button"
              onClick={() => refetch()}
              disabled={isRefetching}
              className="label-caps mt-8 border border-gold px-7 py-3.5 text-gold transition-colors hover:bg-gold hover:text-background disabled:opacity-60"
            >
              {isRefetching ? "Reintentando…" : "Reintentar"}
            </button>
          </div>
        ) : lista.length > 0 ? (
          esTodas ? (
            <div className="flex flex-col gap-16">
              {tiposDisponibles.map((t) => (
                <div key={t}>
                  <div className="mb-6 flex items-end justify-between gap-4 border-b border-gold/30 pb-3">
                    <h3 className="display-italic text-3xl text-foreground sm:text-4xl">
                      {t === "Artesanal" ? "Artesanales" : t}
                    </h3>
                    <button
                      type="button"
                      onClick={() => setCategoria(t)}
                      className="label-caps text-gold transition-colors hover:text-gold-bright"
                    >
                      Ver solo {t === "Artesanal" ? "artesanales" : t} ({conteoPorTipo[t]})
                    </button>
                  </div>
                  <ListaPorMarca
                    items={lista.filter((p) => p.categoria === t)}
                    agrupar={agruparPorMarca}
                    onVer={abrirProducto}
                  />
                </div>
              ))}
            </div>
          ) : (
            <ListaPorMarca
              items={lista}
              agrupar={agruparPorMarca && categoria !== COMBOS}
              onVer={abrirProducto}
            />
          )
        ) : (
          <div className="mx-auto max-w-lg rounded-2xl border border-border px-8 py-14 text-center">
            <p className="display-italic text-2xl text-foreground">
              {termino
                ? `No encontramos "${busqueda.trim()}" en ${nombreCategoria}.`
                : categoria === BOTELLAS_COMPLETAS
                  ? "Por ahora no hay sellados en stock."
                  : "Estamos organizando esta categoría."}
            </p>
            <p className="mt-4 text-sm text-muted-foreground">
              Escríbenos por WhatsApp y te confirmamos disponibilidad.
            </p>
            <a
              href={waLink(
                categoria === BOTELLAS_COMPLETAS
                  ? "Hola The Sam Parfums, quisiera saber qué perfumes sellados tienen disponibles."
                  : `Hola The Sam Parfums, quisiera saber qué tienen disponible en la categoría ${nombreCategoria}.`,
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="label-caps mt-8 inline-block border border-gold px-7 py-3.5 text-gold transition-colors hover:bg-gold hover:text-background"
            >
              Consultar por WhatsApp
            </a>
          </div>
        )}
      </div>

      <ProductoModal
        perfume={productoAbierto?.perfume ?? null}
        opcionInicial={productoAbierto?.opcion ?? 0}
        onClose={() => {
          setSeleccionado(null);
          cerrar();
        }}
      />
    </section>
  );
}
