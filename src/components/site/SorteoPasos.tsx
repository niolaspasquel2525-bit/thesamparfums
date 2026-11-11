import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronRight, Gift } from "lucide-react";
import { Modal } from "./Modal";
import { usePromo } from "@/hooks/use-promo";
import { textoRestante } from "@/lib/promo";
import { MONTO_POR_CUPO } from "@/lib/sorteo";

const PASOS = [
  {
    titulo: "Elige tus decants",
    texto: "Escoge decants de 3, 5 o 10 ml en el catálogo y agrégalos al carrito.",
  },
  {
    titulo: "Junta tus cupos",
    texto: `Ganas 1 cupo por cada $${MONTO_POR_CUPO} en decants (desde $19.99 ya cuenta el primero). Los sellados no suman cupos.`,
  },
  {
    titulo: "Envía tu pedido por WhatsApp",
    texto: "En el carrito verás cuántos cupos tienes. Completa tus datos y envíalo.",
  },
  {
    titulo: "Paga y confirma",
    texto: "Te confirmamos el total y cómo pagar; envía tu comprobante y tus cupos quedan listos.",
  },
];

/** Franja visible al entrar a la portada que abre los pasos para participar en el sorteo. */
export function SorteoPasos() {
  const [abierto, setAbierto] = useState(false);
  const promo = usePromo();
  if (!promo.visible) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setAbierto(true)}
        className="group flex w-full items-center justify-center gap-2 bg-gold px-4 py-2.5 text-center text-sm font-medium text-background transition-colors hover:bg-gold-bright"
      >
        <Gift aria-hidden="true" className="h-4 w-4 shrink-0" />
        <span>
          Gana un <strong className="font-semibold">{promo.premio}</strong>
          <span className="hidden sm:inline"> · Mira los pasos para participar</span>
        </span>
        <span className="label-caps flex shrink-0 items-center gap-0.5 text-[0.62rem]">
          Ver pasos
          <ChevronRight
            aria-hidden="true"
            className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
          />
        </span>
      </button>

      <Modal open={abierto} onClose={() => setAbierto(false)} title={`Gana un ${promo.premio}`}>
        <p className="text-sm text-muted-foreground">
          Sigue estos pasos para participar en el sorteo de apertura.
        </p>

        <ol className="mt-6 flex flex-col gap-5">
          {PASOS.map((p, i) => (
            <li key={p.titulo} className="flex gap-4">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold text-base font-bold text-background">
                {i + 1}
              </span>
              <span>
                <span className="block text-lg font-medium text-foreground">{p.titulo}</span>
                <span className="mt-0.5 block text-sm leading-relaxed text-muted-foreground">
                  {p.texto}
                </span>
              </span>
            </li>
          ))}
        </ol>

        <p className="mt-6 rounded-xl border border-gold/40 bg-gold/10 px-4 py-3 text-center text-sm text-foreground">
          La promoción cierra en{" "}
          <strong className="font-semibold text-gold-bright">
            {promo.listo ? textoRestante(promo) : "…"}
          </strong>
        </p>
        <p className="mt-3 text-center text-xs text-muted-foreground">
          Válida hasta el 31 de octubre de 2026, 23:59 (hora de Ecuador).
        </p>

        <Link
          to="/catalogo"
          onClick={() => setAbierto(false)}
          className="label-caps mt-6 block border border-gold bg-gold px-8 py-4 text-center text-background transition-colors hover:border-gold-bright hover:bg-gold-bright"
        >
          Ver catálogo
        </Link>
      </Modal>
    </>
  );
}
