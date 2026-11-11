import { OG_IMAGE } from "@/lib/site";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { Header } from "@/components/site/Header";
import { Catalogo } from "@/components/site/Catalogo";
import { Footer } from "@/components/site/Footer";
import { CookieBar, PoliticaModal } from "@/components/site/Privacidad";
import { FloatingActions } from "@/components/site/FloatingActions";
import { TABS_CATALOGO, TODAS } from "@/lib/thesamparfums";

const TITLE = "Catálogo | The Sam Parfums";
const DESC =
  "Explora todo el catálogo de decants de The Sam Parfums: nicho, diseñador, árabes y más. Elige la presentación y agenda por WhatsApp.";

const searchSchema = z.object({
  categoria: z.enum([...TABS_CATALOGO, TODAS]).optional(),
  orden: z.enum(["recientes"]).optional(),
  buscar: z.string().max(80).optional(),
});

export const Route = createFileRoute("/catalogo")({
  validateSearch: searchSchema,
  head: () => ({
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
  component: CatalogoPage,
});

function CatalogoPage() {
  const { categoria, orden, buscar } = Route.useSearch();
  const navigate = Route.useNavigate();
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
        <Catalogo
          categoriaInicial={categoria}
          ordenInicial={orden}
          busquedaInicial={buscar}
          onCategoriaChange={(c) =>
            navigate({
              search: { categoria: c as (typeof TABS_CATALOGO)[number] | typeof TODAS },
              replace: true,
            })
          }
        />
      </main>
      <Footer onVerPolitica={() => setPolitica(true)} />
      <FloatingActions />
      {!cookies && <CookieBar onVerPolitica={() => setPolitica(true)} />}
      <PoliticaModal open={politica} onClose={() => setPolitica(false)} />
    </div>
  );
}
