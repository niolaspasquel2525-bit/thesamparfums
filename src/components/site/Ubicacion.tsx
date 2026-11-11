import { Ornament } from "./Ornament";
import { COBERTURA, WHATSAPP_DISPLAY, waLink } from "@/lib/thesamparfums";

export function Ubicacion() {
  return (
    <section id="ubicacion" className="border-t border-border">
      <div className="mx-auto max-w-3xl px-5 py-14 sm:px-8 sm:py-20">
        <Ornament />
        <h2 className="display-italic mt-7 text-center text-4xl text-foreground sm:text-5xl">
          Cobertura
        </h2>

        <div className="mt-10 flex flex-col gap-8 text-center">
          <div>
            <p className="label-caps text-muted-foreground">Envíos</p>
            <p className="display-italic mt-3 text-2xl text-foreground sm:text-3xl">{COBERTURA}</p>
          </div>

          <div>
            <p className="label-caps text-muted-foreground">Teléfono / WhatsApp</p>
            <a
              href={waLink("Hola The Sam Parfums, quisiera hacer una consulta.")}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 block text-xl text-gold transition-colors hover:text-gold-bright"
            >
              {WHATSAPP_DISPLAY}
            </a>
          </div>

          <div>
            <p className="label-caps text-muted-foreground">Cómo pedir</p>
            <p className="mx-auto mt-3 max-w-md text-base text-foreground">
              Escríbenos por WhatsApp, elige tu producto del catálogo y coordinamos el envío a
              cualquier ciudad del Ecuador.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
