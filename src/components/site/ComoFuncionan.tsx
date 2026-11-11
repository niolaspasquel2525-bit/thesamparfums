const TAMANOS = [
  { ml: "3 ml", pulsos: "≈ 33", dura: "Una semana", sirve: "Saber si te gusta y cómo evoluciona" },
  { ml: "5 ml", pulsos: "≈ 55", dura: "Dos semanas", sirve: "Viajar o rotar entre varios" },
  { ml: "10 ml", pulsos: "≈ 110", dura: "Un mes", sirve: "Usarlo de verdad sin comprar el frasco" },
];

/** Guía de tamaños de decant; vive en la página Conócenos. */
export function ComoFuncionan() {
  return (
    <div id="como-funciona" className="scroll-mt-32">
      <h2 className="display-italic text-2xl text-foreground sm:text-3xl">
        3, 5 o 10 ml: ¿cuál elegir?
      </h2>
      <p className="mt-3 text-muted-foreground">
        Es el mismo perfume original, en un atomizador más pequeño. Las pulsaciones son aproximadas.
      </p>
      <ul className="mt-5 divide-y divide-border border-y border-border">
        {TAMANOS.map((t) => (
          <li key={t.ml} className="flex items-baseline gap-4 py-4">
            <span className="display-italic w-16 shrink-0 text-2xl text-gold-bright">{t.ml}</span>
            <span className="min-w-0 text-sm">
              <span className="block text-foreground">
                {t.pulsos} pulsaciones · {t.dura} a diario
              </span>
              <span className="block text-muted-foreground">{t.sirve}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
