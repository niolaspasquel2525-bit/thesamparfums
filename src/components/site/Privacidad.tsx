import { Modal } from "./Modal";

export function PoliticaModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Modal open={open} onClose={onClose} title="Política de privacidad (LOPDP)">
      <div className="flex max-h-[60dvh] flex-col gap-5 overflow-y-auto pr-2 text-sm leading-relaxed text-muted-foreground">
        <p>
          The Sam Parfums es responsable del tratamiento de los datos personales recopilados a
          través de este sitio web.
        </p>
        <p>
          <span className="text-foreground">Datos que recopilamos:</span> nombre completo, número de
          celular/WhatsApp, correo electrónico.
        </p>
        <p>
          <span className="text-foreground">Finalidad:</span> agendar citas, responder consultas
          sobre el catálogo y gestionar pedidos.
        </p>
        <p>
          <span className="text-foreground">Base legal:</span> consentimiento expreso del titular,
          otorgado al marcar la casilla de aceptación en los formularios.
        </p>
        <p>
          <span className="text-foreground">Confidencialidad:</span> no vendemos ni compartimos tu
          información con terceros ajenos a la operación de The Sam Parfums.
        </p>
        <p>
          <span className="text-foreground">Conservación:</span> mientras exista una relación
          comercial activa, o hasta que el titular solicite su eliminación.
        </p>
        <p>
          <span className="text-foreground">Derechos del titular:</span> acceso, rectificación,
          actualización, eliminación y oposición al tratamiento de datos, ejercibles escribiendo al
          WhatsApp 099 734 9288.
        </p>
      </div>
    </Modal>
  );
}

export function CookieBar({ onVerPolitica }: { onVerPolitica: () => void }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-[70] border-t border-border bg-background/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <p className="max-w-3xl pr-16 text-xs leading-relaxed text-muted-foreground sm:pr-0">
          Usamos tus datos únicamente para contacto y agendamiento, conforme a la LOPDP del Ecuador.{" "}
          <button
            type="button"
            onClick={onVerPolitica}
            className="text-gold underline underline-offset-4 transition-colors hover:text-gold-bright"
          >
            Ver política completa
          </button>
        </p>
        <button
          type="button"
          onClick={() => {
            localStorage.setItem("thesamparfums-cookies", "1");
            window.dispatchEvent(new Event("thesamparfums-cookies"));
          }}
          className="label-caps shrink-0 border border-gold px-6 py-2.5 text-gold transition-colors hover:bg-gold hover:text-background"
        >
          Entendido
        </button>
      </div>
    </div>
  );
}
