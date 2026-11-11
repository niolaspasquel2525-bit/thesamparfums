import { BadgeCheck, MessageCircle, Sparkles, Truck } from "lucide-react";
import { COBERTURA } from "@/lib/thesamparfums";

// Franja de confianza bajo la portada. Solo datos reales de la tienda.
const PUNTOS = [
  { icono: BadgeCheck, titulo: "100% originales", texto: "Árabes, diseñador y nicho" },
  { icono: Truck, titulo: "Envíos a todo el país", texto: COBERTURA },
  { icono: Sparkles, titulo: "Decant o frasco", texto: "Prueba antes de llevarte el frasco" },
  {
    icono: MessageCircle,
    titulo: "Pedido por WhatsApp",
    texto: "Te confirmamos el total y el pago",
  },
] as const;

export function Confianza() {
  return (
    <section aria-label="Por qué comprar con nosotros" className="border-b border-border">
      <ul className="mx-auto grid max-w-5xl grid-cols-2 gap-x-4 gap-y-6 px-5 py-8 sm:px-8 lg:grid-cols-4">
        {PUNTOS.map(({ icono: Icono, titulo, texto }) => (
          <li key={titulo} className="flex flex-col items-center gap-1.5 text-center">
            <Icono aria-hidden="true" className="h-6 w-6 text-gold" />
            <p className="label-caps text-[0.62rem] text-gold-bright">{titulo}</p>
            <p className="text-xs leading-snug text-muted-foreground">{texto}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
