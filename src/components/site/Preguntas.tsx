import { ChevronDown } from "lucide-react";
import { PREGUNTAS } from "@/lib/preguntas";
import { Ornament } from "./Ornament";

export function Preguntas() {
  return (
    <section id="preguntas" className="border-t border-border bg-card/40">
      <div className="mx-auto max-w-2xl px-5 py-10 sm:px-8 sm:py-14">
        <Ornament />
        <h2 className="display-italic mt-5 text-center text-3xl text-foreground sm:text-4xl">
          Preguntas frecuentes
        </h2>
        <div className="mt-6 flex flex-col gap-2">
          {PREGUNTAS.map((p) => (
            <details
              key={p.pregunta}
              className="group rounded-xl border border-border bg-background shadow-sm"
            >
              <summary className="flex cursor-pointer list-none items-center gap-3 px-4 py-3 text-sm font-medium text-foreground [&::-webkit-details-marker]:hidden">
                <span className="flex-1">{p.pregunta}</span>
                <ChevronDown
                  aria-hidden="true"
                  className="h-4 w-4 shrink-0 text-gold transition-transform group-open:rotate-180"
                />
              </summary>
              <p className="px-4 pb-3.5 text-[0.82rem] leading-relaxed text-muted-foreground">
                {p.respuesta}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
