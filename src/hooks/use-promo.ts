import { useEffect, useState } from "react";
import { CONFIG_SITIO_DEFAULT } from "@/lib/apariencia";
import { calcularRestante, type TiempoRestante } from "@/lib/promo";

/**
 * Estado de la promoción de apertura: esta demo no tiene backend, así que el
 * interruptor y el premio son los de apariencia.ts (CONFIG_SITIO_DEFAULT).
 */
export function usePromo(): TiempoRestante & { premio: string; visible: boolean } {
  const [tiempo, setTiempo] = useState<TiempoRestante>({
    listo: false,
    activa: true,
    dias: 0,
    horas: 0,
    minutos: 0,
    segundos: 0,
  });

  useEffect(() => {
    const tick = () => setTiempo(calcularRestante(Date.now()));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  const encendida = CONFIG_SITIO_DEFAULT.promo_activo;
  const premio = CONFIG_SITIO_DEFAULT.promo_premio;

  return { ...tiempo, premio, visible: encendida && tiempo.activa };
}
