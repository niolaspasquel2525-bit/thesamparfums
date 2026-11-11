import { OG_IMAGE } from "@/lib/site";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { ComoFuncionan } from "@/components/site/ComoFuncionan";
import { Ornament } from "@/components/site/Ornament";
import { CookieBar, PoliticaModal } from "@/components/site/Privacidad";
import { FloatingActions } from "@/components/site/FloatingActions";
import { COBERTURA, INSTAGRAM_URL, USUARIO_REDES, waLink } from "@/lib/thesamparfums";

const TITLE = "Conócenos | The Sam Parfums";
const DESC = "The Sam Parfums: perfumes árabes, de diseñador y nicho 100% originales en Ecuador.";

export const Route = createFileRoute("/conocenos")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { property: "og:image", content: OG_IMAGE },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: OG_IMAGE },
    ],
  }),
  component: ConocenosPage,
});

const BLOQUES = [
  {
    titulo: "Quiénes somos",
    parrafos: [
      "Empezamos vendiendo cara a cara, en ferias y puntos de venta directos, para que cada cliente pudiera oler y comparar antes de llevarse su fragancia. Hoy llevamos esa misma cercanía a todo el país por WhatsApp.",
    ],
  },
  {
    titulo: "Qué nos diferencia",
    parrafos: [
      "Todo lo que vendemos es 100% original: perfumes árabes, de diseñador y de nicho, en decant o en frasco completo.",
      "Hablas directo con nosotros, por WhatsApp y sin intermediarios. Te asesoramos para que elijas la fragancia que de verdad te conviene.",
    ],
  },
  {
    titulo: "Qué hacemos",
    parrafos: [
      "Vendemos perfumes 100% originales y decants de 3, 5 y 10 ml en perfumería árabe, de diseñador y de nicho. Un decant sale del mismo frasco original: solo cambia el envase, para que pruebes antes de comprometerte con el frasco entero. Si ya sabes cuál quieres, también tenemos sellados.",
    ],
  },
  {
    titulo: "Cómo trabajamos",
    parrafos: [
      `Armas tu pedido en la web y lo envías por WhatsApp. Te confirmamos el total y cómo pagar. ${COBERTURA}.`,
    ],
  },
];

function ConocenosPage() {
  const [politica, setPolitica] = useState(false);
  const [cookies, setCookies] = useState(true);

  useEffect(() => {
    const sync = () => setCookies(localStorage.getItem("thesamparfums-cookies") === "1");
    sync();
    window.addEventListener("thesamparfums-cookies", sync);
    return () => window.removeEventListener("thesamparfums-cookies", sync);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <section className="mx-auto max-w-3xl px-5 py-16 sm:px-8 sm:py-24">
          <Ornament />
          <h1 className="display-italic mt-7 text-center text-4xl text-foreground sm:text-6xl">
            Conócenos
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-center text-base leading-relaxed text-muted-foreground sm:text-lg">
            Somos The Sam Parfums: perfumes árabes, de diseñador y nicho 100% originales.
          </p>

          <div className="mt-14 flex flex-col gap-12">
            {BLOQUES.map((b) => (
              <div key={b.titulo}>
                <h2 className="display-italic text-2xl text-foreground sm:text-3xl">{b.titulo}</h2>
                {b.parrafos.map((t) => (
                  <p key={t} className="mt-3 leading-relaxed text-muted-foreground">
                    {t}
                  </p>
                ))}
              </div>
            ))}
            <ComoFuncionan />
            <div>
              <h2 className="display-italic text-2xl text-foreground sm:text-3xl">Síguenos</h2>
              <p className="mt-3 text-muted-foreground">@{USUARIO_REDES}</p>
              <div className="mt-4 flex flex-wrap gap-3">
                <a
                  href={INSTAGRAM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="label-caps border border-border px-6 py-3 text-foreground transition-colors hover:border-gold hover:text-gold-bright"
                >
                  Instagram
                </a>
              </div>
            </div>
            <div>
              <h2 className="display-italic text-2xl text-foreground sm:text-3xl">Cobertura</h2>
              <p className="mt-3 text-lg text-foreground">{COBERTURA}</p>
            </div>
          </div>

          <div className="mt-14 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              to="/catalogo"
              className="label-caps w-full border border-gold bg-gold px-9 py-4 text-center text-background transition-colors hover:border-gold-bright hover:bg-gold-bright sm:w-auto"
            >
              Ver catálogo
            </Link>
            <a
              href={waLink("Hola The Sam Parfums, quisiera más información.")}
              target="_blank"
              rel="noopener noreferrer"
              className="label-caps w-full border border-border px-9 py-4 text-center text-foreground transition-colors hover:border-gold hover:text-gold-bright sm:w-auto"
            >
              Escríbenos
            </a>
          </div>
        </section>
      </main>
      <Footer onVerPolitica={() => setPolitica(true)} />
      <FloatingActions />
      {!cookies && <CookieBar onVerPolitica={() => setPolitica(true)} />}
      <PoliticaModal open={politica} onClose={() => setPolitica(false)} />
    </div>
  );
}
