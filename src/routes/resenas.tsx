import { OG_IMAGE } from "@/lib/site";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ImagePlus } from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Ornament } from "@/components/site/Ornament";
import { CookieBar, PoliticaModal } from "@/components/site/Privacidad";
import { FloatingActions } from "@/components/site/FloatingActions";
import { cargarResenas, enviarResena } from "@/lib/resenas";

const TITLE = "Deja tu reseña | The Sam Parfums";
const DESC = "Cuéntanos cómo te fue con tu pedido: sube la foto y tu comentario.";

export const Route = createFileRoute("/resenas")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:image", content: OG_IMAGE },
    ],
  }),
  component: ResenasPage,
});

const MAX_TEXTO = 400;

function ResenasPage() {
  const [politica, setPolitica] = useState(false);
  const [cookies, setCookies] = useState(true);
  const [foto, setFoto] = useState<File | null>(null);
  const [vista, setVista] = useState<string | null>(null);
  const [texto, setTexto] = useState("");
  const [sitio, setSitio] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [listo, setListo] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["resenas"],
    queryFn: cargarResenas,
    staleTime: 60_000,
  });

  useEffect(() => {
    const sync = () => setCookies(localStorage.getItem("thesamparfums-cookies") === "1");
    sync();
    window.addEventListener("thesamparfums-cookies", sync);
    return () => window.removeEventListener("thesamparfums-cookies", sync);
  }, []);

  useEffect(() => {
    if (!foto) return setVista(null);
    const url = URL.createObjectURL(foto);
    setVista(url);
    return () => URL.revokeObjectURL(url);
  }, [foto]);

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!foto) return setError("Adjunta la foto de tu pedido.");
    if (texto.trim().length < 3) return setError("Escribe tu comentario.");
    setError(null);
    setEnviando(true);
    const err = await enviarResena(foto, texto.trim(), sitio);
    setEnviando(false);
    if (err) setError(err);
    else setListo(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <section className="mx-auto max-w-xl px-5 py-16 sm:px-8 sm:py-24">
          <Ornament />
          <h1 className="display-italic mt-7 text-center text-4xl text-foreground sm:text-5xl">
            Deja tu reseña
          </h1>
          <p className="mx-auto mt-4 max-w-md text-center text-muted-foreground">
            Sube la foto de lo que te enviamos y cuéntanos cómo te fue. Tu opinión ayuda a otros
            clientes.
          </p>

          {isLoading ? (
            <div className="mt-10 h-40" />
          ) : !data?.configurada ? (
            <p className="mt-10 rounded-xl border border-border bg-card/60 p-5 text-center text-sm text-muted-foreground">
              Muy pronto podrás dejar tu reseña aquí. Mientras tanto, cuéntanos tu experiencia por
              WhatsApp.
            </p>
          ) : listo ? (
            <div className="mt-10 rounded-xl border border-gold/40 bg-gold/5 p-6 text-center">
              <p className="display-italic text-2xl text-foreground">¡Gracias por tu reseña!</p>
              <p className="mt-2 text-sm text-muted-foreground">
                La revisaremos y se publicará en la página muy pronto.
              </p>
              <Link
                to="/"
                className="label-caps mt-6 inline-block border border-gold bg-gold px-8 py-3 text-background transition-colors hover:border-gold-bright hover:bg-gold-bright"
              >
                Volver al inicio
              </Link>
            </div>
          ) : (
            <form onSubmit={enviar} className="mt-10 flex flex-col gap-5">
              <label
                htmlFor="foto-resena"
                className="flex cursor-pointer flex-col items-center justify-center gap-2 overflow-hidden rounded-2xl border border-dashed border-gold/60 bg-card/60 p-4 text-center transition-colors hover:border-gold"
              >
                {vista ? (
                  <img src={vista} alt="Tu foto" className="max-h-72 rounded-xl object-contain" />
                ) : (
                  <>
                    <ImagePlus aria-hidden="true" className="h-8 w-8 text-gold" />
                    <span className="text-sm text-foreground">Toca para elegir la foto</span>
                    <span className="text-xs text-muted-foreground">
                      Tu pedido o la captura de tu mensaje
                    </span>
                  </>
                )}
                <input
                  id="foto-resena"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="sr-only"
                  onChange={(e) => setFoto(e.target.files?.[0] ?? null)}
                />
              </label>

              <div>
                <label htmlFor="texto-resena" className="label-caps text-muted-foreground">
                  Tu comentario
                </label>
                <textarea
                  id="texto-resena"
                  value={texto}
                  maxLength={MAX_TEXTO}
                  onChange={(e) => setTexto(e.target.value)}
                  rows={4}
                  placeholder="¿Cómo fue tu experiencia?"
                  className="mt-2 w-full rounded-xl border border-input bg-background px-4 py-3 text-base text-foreground placeholder:text-muted-foreground/60 focus:border-gold focus:outline-none"
                />
                <p className="mt-1 text-right text-xs text-muted-foreground">
                  {texto.length}/{MAX_TEXTO}
                </p>
              </div>

              {/* Campo trampa contra bots: las personas no lo ven. */}
              <input
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                value={sitio}
                onChange={(e) => setSitio(e.target.value)}
                className="absolute -left-[9999px] h-0 w-0 opacity-0"
              />

              {error && (
                <p role="alert" className="text-sm text-destructive">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={enviando}
                className="label-caps border border-gold bg-gold px-9 py-4 text-background transition-colors hover:border-gold-bright hover:bg-gold-bright disabled:opacity-60"
              >
                {enviando ? "Enviando…" : "Enviar reseña"}
              </button>
              <p className="text-center text-xs text-muted-foreground">
                Tu reseña se publica sin nombre, después de que la revisemos.
              </p>
            </form>
          )}
        </section>
      </main>
      <Footer onVerPolitica={() => setPolitica(true)} />
      <FloatingActions />
      {!cookies && <CookieBar onVerPolitica={() => setPolitica(true)} />}
      <PoliticaModal open={politica} onClose={() => setPolitica(false)} />
    </div>
  );
}
