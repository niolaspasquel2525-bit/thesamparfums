import { Ornament } from "./Ornament";
import { Logo } from "./Logo";
import { COBERTURA, WHATSAPP_DISPLAY, waLink } from "@/lib/thesamparfums";

export function Footer({ onVerPolitica }: { onVerPolitica: () => void }) {
  return (
    <footer id="contacto" className="border-t border-border">
      <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
        <Ornament />

        <div className="mt-12 grid gap-12 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <Logo size={52} />
            <p className="label-caps mt-4 text-foreground">The Sam Parfums</p>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              Perfumes árabes, de diseñador y nicho, 100% originales. Decants o frasco completo,
              con envíos a todo el Ecuador.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <p className="label-caps text-muted-foreground">Contacto</p>
            <a
              href={waLink("Hola The Sam Parfums, quisiera hacer una consulta.")}
              target="_blank"
              rel="noopener noreferrer"
              className="text-base text-foreground transition-colors hover:text-gold-bright"
            >
              WhatsApp {WHATSAPP_DISPLAY}
            </a>
            <p className="max-w-xs text-base text-foreground">{COBERTURA}</p>
            <p className="text-sm text-muted-foreground">Abierto las 24 horas</p>
          </div>

          <div className="flex flex-col gap-4">
            <p className="label-caps text-muted-foreground">Navegación</p>
            {[
              ["#catalogo", "Catálogo"],
              ["#ubicacion", "Cobertura"],
            ].map(([href, label]) => (
              <a
                key={href}
                href={href}
                className="text-base text-foreground transition-colors hover:text-gold-bright"
              >
                {label}
              </a>
            ))}
            <button
              type="button"
              onClick={onVerPolitica}
              className="text-left text-base text-gold transition-colors hover:text-gold-bright"
            >
              Política de privacidad (LOPDP)
            </button>
          </div>
        </div>

        <p className="mt-16 border-t border-border pt-8 text-xs text-muted-foreground">
          © {new Date().getFullYear()} The Sam Parfums — Ecuador.
        </p>
      </div>
    </footer>
  );
}
