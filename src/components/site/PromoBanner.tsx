import { Link } from "@tanstack/react-router";
import { Sparkles, Ticket } from "lucide-react";
import { usePromo } from "@/hooks/use-promo";
import { dosDigitos } from "@/lib/promo";

function Caja({ valor, etiqueta, tick }: { valor: string; etiqueta: string; tick?: boolean }) {
  return (
    <div
      className={`flex w-[4.4rem] flex-col items-center rounded-xl border border-gold/40 bg-gradient-to-b from-gold/15 to-background/60 px-2 py-3 shadow-[0_12px_30px_-14px_rgba(180,146,76,0.6)] sm:w-24 sm:py-4 ${
        tick ? "promo-tick" : ""
      }`}
    >
      <span className="font-display text-4xl leading-none font-medium tabular-nums text-gold-bright sm:text-5xl">
        {valor}
      </span>
      <span className="label-caps mt-2 text-[0.55rem] text-muted-foreground sm:text-[0.6rem]">
        {etiqueta}
      </span>
    </div>
  );
}

export function PromoBanner() {
  const promo = usePromo();
  if (!promo.visible) return null;

  const val = (n: number) => (promo.listo ? dosDigitos(n) : "--");

  return (
    <section
      id="sorteo"
      className="relative overflow-hidden border-y border-gold/40 bg-[radial-gradient(ellipse_70%_90%_at_50%_0%,rgba(180,146,76,0.18),transparent_70%)]"
    >
      <div className="mx-auto max-w-4xl px-5 py-14 text-center sm:px-8 sm:py-16">
        <p className="label-caps flex items-center justify-center gap-3 text-gold">
          <Sparkles aria-hidden="true" className="h-3.5 w-3.5" />
          Promoción de apertura
          <Sparkles aria-hidden="true" className="h-3.5 w-3.5" />
        </p>

        <h2 className="display-italic mt-5 text-4xl text-foreground sm:text-5xl">
          Participa por un
        </h2>
        <p className="promo-shimmer-text display-italic mt-2 text-5xl sm:text-6xl">
          {promo.premio}
        </p>

        <ul className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <li className="flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-4 py-2 text-sm text-foreground">
            <Ticket aria-hidden="true" className="h-4 w-4 text-gold" />1 cupo por cada $20 en
            decants
          </li>
        </ul>
        <p className="mt-3 text-xs text-muted-foreground">
          Exclusivo para compras de decants (3, 5 y 10 ml).
        </p>

        <p className="label-caps mt-10 text-muted-foreground">La promoción cierra en</p>
        <div
          role="timer"
          aria-label="Tiempo restante de la promoción"
          className="mt-4 flex items-center justify-center gap-2 sm:gap-3"
        >
          <Caja valor={val(promo.dias)} etiqueta="Días" />
          <Caja valor={val(promo.horas)} etiqueta="Horas" />
          <Caja valor={val(promo.minutos)} etiqueta="Min" />
          <Caja valor={val(promo.segundos)} etiqueta="Seg" tick />
        </div>

        <Link
          to="/catalogo"
          className="label-caps mt-10 inline-block border border-gold bg-gold px-8 py-4 text-background transition-colors hover:border-gold-bright hover:bg-gold-bright"
        >
          Ver catálogo
        </Link>

        <p className="mx-auto mt-8 max-w-xl text-xs leading-relaxed text-muted-foreground/80 italic">
          Válida hasta el 31 de octubre de 2026, 23:59 (hora de Ecuador). Por cada $20 en compras de
          decants recibes una participación; los sellados no participan en el sorteo.
        </p>
      </div>
    </section>
  );
}
