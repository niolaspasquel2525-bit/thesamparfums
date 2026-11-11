import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

/**
 * Solo un modal puede estar abierto a la vez en todo el sitio. El carrito y
 * el modal de "Agendar" vivían con estado propio e independiente — nada
 * impedía que, en una carrera de clics o un doble tap en mobile, ambos
 * quedaran montados al mismo tiempo, cada uno con su propio fondo
 * semitransparente superpuesto ("una pantalla encima de otra"). Centralizar
 * el estado acá hace que abrir cualquier modal cierre automáticamente
 * cualquier otro, sin importar cuál lo dispare.
 */
type ModalId = "carrito" | "reserva" | "producto";

type ModalContextValue = {
  activo: ModalId | null;
  abrir: (id: ModalId) => void;
  /** Cierra el modal; resuelve cuando el historial ya volvió a la página previa. */
  cerrar: () => Promise<void>;
};

const ModalContext = createContext<ModalContextValue | null>(null);

export function ModalProvider({ children }: { children: ReactNode }) {
  const [activo, setActivo] = useState<ModalId | null>(null);
  // Al abrir un modal se agrega una entrada al historial del navegador: así el
  // botón "atrás" del celular cierra el modal en vez de sacar al usuario de la
  // página donde estaba.
  const empujado = useRef(false);
  const esperando = useRef<(() => void) | null>(null);

  useEffect(() => {
    const onPopState = () => {
      empujado.current = false;
      setActivo(null);
      esperando.current?.();
      esperando.current = null;
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const abrir = useCallback((id: ModalId) => {
    const estado = { ...(window.history.state ?? {}), __modal: id };
    if (empujado.current) {
      window.history.replaceState(estado, "");
    } else {
      window.history.pushState(estado, "");
      empujado.current = true;
    }
    setActivo(id);
  }, []);

  const cerrar = useCallback(() => {
    if (!empujado.current) {
      setActivo(null);
      return Promise.resolve();
    }
    return new Promise<void>((resolve) => {
      esperando.current = resolve;
      window.history.back();
      // Respaldo por si el navegador no emite popstate.
      window.setTimeout(() => {
        if (esperando.current !== resolve) return;
        esperando.current = null;
        empujado.current = false;
        setActivo(null);
        resolve();
      }, 400);
    });
  }, []);

  return (
    <ModalContext.Provider value={{ activo, abrir, cerrar }}>{children}</ModalContext.Provider>
  );
}

export function useModal() {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error("useModal debe usarse dentro de <ModalProvider>.");
  return ctx;
}
