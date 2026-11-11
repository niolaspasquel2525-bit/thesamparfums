import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type ItemCarrito = {
  id: string;
  perfumeId: string;
  marca: string;
  nombre: string;
  opcion: string;
  precio: number;
  cantidad: number;
  /** Foto del perfume (puede faltar en carritos guardados antes de este cambio). */
  imagen?: string | null | undefined;
  /** Categoría del perfume (Árabes, Diseñador…): define de dónde se elige la muestra gratis. */
  categoria?: string | undefined;
  /** Unidades que hay de ese perfume sellado; no se puede pedir más que eso. */
  maximo?: number | undefined;
};

const STORAGE_KEY = "thesamparfums-carrito";

function leerStorage(): ItemCarrito[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ItemCarrito[]) : [];
  } catch {
    return [];
  }
}

type CartContextValue = {
  items: ItemCarrito[];
  agregar: (item: {
    perfumeId: string;
    marca: string;
    nombre: string;
    opcion: string;
    precio: number;
    imagen?: string | null | undefined;
    categoria?: string | undefined;
    maximo?: number | undefined;
  }) => void;
  quitar: (id: string) => void;
  cambiarCantidad: (id: string, cantidad: number) => void;
  vaciar: () => void;
  total: number;
  cantidadTotal: number;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ItemCarrito[]>([]);
  const [listo, setListo] = useState(false);

  useEffect(() => {
    setItems(leerStorage());
    setListo(true);
  }, []);

  useEffect(() => {
    if (!listo) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // localStorage puede fallar en modo privado; el carrito sigue
      // funcionando en memoria para el resto de la sesión igual.
    }
  }, [items, listo]);

  const agregar: CartContextValue["agregar"] = ({
    perfumeId,
    marca,
    nombre,
    opcion,
    precio,
    imagen,
    categoria,
    maximo,
  }) => {
    const id = `${perfumeId}__${opcion}`;
    setItems((actual) => {
      const existente = actual.find((i) => i.id === id);
      if (existente) {
        const tope = maximo ?? existente.maximo ?? Infinity;
        return actual.map((i) =>
          i.id === id
            ? {
                ...i,
                cantidad: Math.min(i.cantidad + 1, tope),
                imagen: i.imagen ?? imagen,
                categoria: i.categoria ?? categoria,
                maximo: maximo ?? i.maximo,
              }
            : i,
        );
      }
      return [
        ...actual,
        { id, perfumeId, marca, nombre, opcion, precio, cantidad: 1, imagen, categoria, maximo },
      ];
    });
  };

  const quitar = (id: string) => setItems((actual) => actual.filter((i) => i.id !== id));

  const cambiarCantidad = (id: string, cantidad: number) => {
    if (cantidad <= 0) {
      quitar(id);
      return;
    }
    setItems((actual) =>
      actual.map((i) =>
        i.id === id ? { ...i, cantidad: Math.min(cantidad, i.maximo ?? Infinity) } : i,
      ),
    );
  };

  const vaciar = () => setItems([]);

  const total = items.reduce((acc, i) => acc + i.precio * i.cantidad, 0);
  const cantidadTotal = items.reduce((acc, i) => acc + i.cantidad, 0);

  return (
    <CartContext.Provider
      value={{ items, agregar, quitar, cambiarCantidad, vaciar, total, cantidadTotal }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart debe usarse dentro de <CartProvider>.");
  return ctx;
}
