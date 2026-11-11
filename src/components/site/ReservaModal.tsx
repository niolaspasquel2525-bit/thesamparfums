import { useState } from "react";
import { Modal } from "./Modal";
import { CamposDinamicos, useCamposPedido } from "./CamposDinamicos";
import { irAWhatsApp } from "@/lib/thesamparfums";

export function ReservaModal({
  perfume,
  onClose,
}: {
  perfume: string | null;
  onClose: () => void;
}) {
  const campos = useCamposPedido();
  const [valores, setValores] = useState<Record<string, string>>({});
  const [acepta, setAcepta] = useState(false);
  const [enviando, setEnviando] = useState(false);

  const onChange = (clave: string, valor: string) => setValores((v) => ({ ...v, [clave]: valor }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!acepta || enviando) return;
    setEnviando(true);

    const lineasDatos = campos.map((c) => `${c.etiqueta}: ${valores[c.clave] ?? ""}`).join("\n");

    const mensaje = `Hola The Sam Parfums, quiero agendar una consulta.
${lineasDatos}
Perfume de interés: ${perfume ?? "Consulta general"}`;

    // Esta demo no tiene backend: no hay dónde guardar la reserva, así que se
    // va directo a WhatsApp.
    setEnviando(false);
    setValores({});
    setAcepta(false);
    onClose();

    // Navega la misma pestaña directo a WhatsApp — nada de pestañas en
    // blanco a la espera de una redirección diferida.
    irAWhatsApp(mensaje);
  };

  return (
    <Modal open={perfume !== null} onClose={onClose} title="Agendar / Consultar">
      {perfume && (
        <p className="-mt-2 mb-6 text-sm text-muted-foreground">
          Perfume de interés: <span className="text-gold">{perfume}</span>
        </p>
      )}
      <form onSubmit={onSubmit} className="flex flex-col gap-6">
        <CamposDinamicos campos={campos} valores={valores} onChange={onChange} />

        <label className="flex cursor-pointer items-start gap-3 text-sm text-muted-foreground">
          <input
            type="checkbox"
            required
            checked={acepta}
            onChange={(e) => setAcepta(e.target.checked)}
            className="mt-1 h-4 w-4 shrink-0 accent-[oklch(0.658_0.087_84)]"
          />
          <span>
            He leído y acepto la Política de Privacidad y autorizo el tratamiento de mis datos
            personales conforme a la LOPDP del Ecuador, únicamente para fines de contacto y
            agendamiento.
          </span>
        </label>

        <button
          type="submit"
          disabled={enviando}
          className="label-caps mt-2 border border-gold bg-gold px-8 py-4 text-background transition-colors hover:border-gold-bright hover:bg-gold-bright disabled:opacity-60"
        >
          {enviando ? "Enviando…" : "Enviar por WhatsApp"}
        </button>
      </form>
    </Modal>
  );
}
