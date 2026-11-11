import { Gift } from "lucide-react";

/** Beneficio de toda botella completa: un decant gratis de su categoría y el envío incluido. */
export function PlusBotella({
  categoria,
  compacto = false,
}: {
  categoria?: string | undefined;
  compacto?: boolean;
}) {
  const cat = categoria && categoria !== "Config" ? categoria.toLowerCase() : "su categoría";
  if (compacto) {
    return (
      <span className="mt-2 flex items-start gap-1.5 rounded-lg border border-gold/50 bg-gold/10 px-2 py-1.5 text-[0.68rem] leading-snug text-foreground">
        <Gift aria-hidden="true" className="mt-px h-3.5 w-3.5 shrink-0 text-gold" />
        <span>
          <strong className="font-semibold">Incluye</strong> 1 decant gratis y envío incluido
        </span>
      </span>
    );
  }
  return (
    <div className="flex items-start gap-3 rounded-xl border border-gold/50 bg-gold/10 px-4 py-3 text-sm text-foreground">
      <Gift aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-gold" />
      <p className="leading-snug">
        <strong className="font-semibold">Tu botella incluye un regalo:</strong> elige un decant
        gratis de cualquier perfume de {cat} que tengamos en stock, y el{" "}
        <strong>envío va incluido</strong>.
      </p>
    </div>
  );
}
