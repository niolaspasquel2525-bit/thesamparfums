import { usePromo } from "@/hooks/use-promo";
import { textoRestante } from "@/lib/promo";

/**
 * Cinta animada arriba del encabezado: recuerda la promoción de apertura y
 * muestra cuánto falta para que cierre. Se oculta sola al terminar.
 */
export function PromoTicker() {
  const promo = usePromo();
  if (!promo.visible || !promo.listo) return null;

  const mensaje = (
    <span className="flex shrink-0 items-center gap-x-8 pr-8">
      <span>
        <span aria-hidden="true">🎁 </span>
        <strong className="font-medium">Promoción de apertura</strong>
      </span>
      <span className="text-[#D4B26A]" aria-hidden="true">
        ✦
      </span>
      <span>
        Compra decants y participas por el{" "}
        <strong className="font-medium text-[#D4B26A]">{promo.premio}</strong>
      </span>
      <span className="text-[#D4B26A]" aria-hidden="true">
        ✦
      </span>
      <span>
        Cierra en{" "}
        <strong className="font-medium tabular-nums text-[#D4B26A]">{textoRestante(promo)}</strong>
      </span>
      <span className="text-[#D4B26A]" aria-hidden="true">
        ✦
      </span>
    </span>
  );

  return (
    <a
      href="/#sorteo"
      aria-label={`Promoción de apertura: compra decants y participa en el sorteo del ${promo.premio}. Cierra en ${textoRestante(promo)}.`}
      className="promo-marquee-wrap block overflow-hidden border-b border-gold/30 bg-gradient-to-r from-[#1a1409] via-[#2a200d] to-[#1a1409] py-2 text-xs tracking-wide whitespace-nowrap text-[#F4EFE4]/90"
    >
      <div className="promo-marquee flex w-max" aria-hidden="true">
        {mensaje}
        {mensaje}
        {mensaje}
        {mensaje}
      </div>
    </a>
  );
}
