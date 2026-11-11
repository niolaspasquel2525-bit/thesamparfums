import { OG_IMAGE, SITE_URL } from "@/lib/site";
import { WHATSAPP_NUMBER } from "@/lib/thesamparfums";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Header } from "@/components/site/Header";
import { Confianza } from "@/components/site/Confianza";
import { SorteoPasos } from "@/components/site/SorteoPasos";
import { NuevosIngresos } from "@/components/site/NuevosIngresos";
import { Hero } from "@/components/site/Hero";
import { PromoBanner } from "@/components/site/PromoBanner";
import { CatalogoAccesos } from "@/components/site/CatalogoAccesos";
import { Ubicacion } from "@/components/site/Ubicacion";
import { Resenas } from "@/components/site/Resenas";
import { MasVendidos } from "@/components/site/MasVendidos";
import { Preguntas } from "@/components/site/Preguntas";
import { PREGUNTAS } from "@/lib/preguntas";
import { Footer } from "@/components/site/Footer";
import { CookieBar, PoliticaModal } from "@/components/site/Privacidad";
import { FloatingActions } from "@/components/site/FloatingActions";

const TITLE = "The Sam Parfums | Perfumes árabes, diseñador y nicho, Ecuador";
const DESC =
  "Perfumes árabes, de diseñador y nicho 100% originales. Decants de 3, 5 y 10 ml o frasco completo, con envíos a todo el Ecuador por WhatsApp.";

export const Route = createFileRoute("/")({
  head: () => ({
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: PREGUNTAS.map((p) => ({
            "@type": "Question",
            name: p.pregunta,
            acceptedAnswer: { "@type": "Answer", text: p.respuesta },
          })),
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Store",
          name: "The Sam Parfums",
          description: DESC,
          url: SITE_URL,
          image: OG_IMAGE,
          telephone: `+${WHATSAPP_NUMBER}`,
          priceRange: "$$",
          areaServed: { "@type": "Country", name: "Ecuador" },
          openingHoursSpecification: {
            "@type": "OpeningHoursSpecification",
            dayOfWeek: [
              "Monday",
              "Tuesday",
              "Wednesday",
              "Thursday",
              "Friday",
              "Saturday",
              "Sunday",
            ],
            opens: "00:00",
            closes: "23:59",
          },
        }),
      },
    ],
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { property: "og:image", content: OG_IMAGE },
      { property: "og:image:width", content: "1024" },
      { property: "og:image:height", content: "1024" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: OG_IMAGE },
    ],
  }),
  component: Index,
});

function Index() {
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
        <NuevosIngresos />
        <SorteoPasos />
        <Hero />
        <Confianza />
        <PromoBanner />
        <CatalogoAccesos />
        <MasVendidos />
        <Preguntas />
        <Ubicacion />
        <Resenas />
      </main>
      <Footer onVerPolitica={() => setPolitica(true)} />
      <FloatingActions />
      {!cookies && <CookieBar onVerPolitica={() => setPolitica(true)} />}
      <PoliticaModal open={politica} onClose={() => setPolitica(false)} />
    </div>
  );
}
