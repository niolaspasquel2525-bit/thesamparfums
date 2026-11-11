import type { CSSProperties } from "react";
import { HERO_IMAGEN_DEFAULT } from "@/lib/apariencia";

export function PerfumeGlint({
  className = "",
  imagenUrl,
}: {
  className?: string;
  imagenUrl?: string | null;
}) {
  return (
    <div aria-hidden="true" className={`relative ${className}`}>
      <div className="absolute inset-0 -z-10 rounded-full bg-gold/14 blur-3xl" />

      <div className="glint-drift relative h-full w-full">
        <img
          src={imagenUrl || HERO_IMAGEN_DEFAULT}
          alt=""
          className="h-full w-full object-contain drop-shadow-[0_30px_50px_rgba(0,0,0,0.5)]"
        />

        {/* Etiqueta de marca, sobre el panel frontal del vidrio. */}
        <div className="absolute top-[50%] left-1/2 flex -translate-x-1/2 flex-col items-center">
          <span className="label-caps text-[0.62rem] text-gold-bright/90 sm:text-xs">The Sam Parfums</span>
          <span className="mt-0.5 text-[0.42rem] tracking-[0.32em] text-gold/70 sm:text-[0.5rem]">
            DECANTS
          </span>
        </div>

        {/* Nube del vaporizador y revelado del nombre, superpuestos a la foto. */}
        <svg
          viewBox="0 0 240 460"
          className="pointer-events-none absolute inset-0 h-full w-full"
          fill="none"
        >
          <defs>
            <filter id="mistBlur" x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur stdDeviation="1.1" />
            </filter>
          </defs>

          <g transform="translate(120,30)">
            {[
              { mx: -26, r: 2.6 },
              { mx: -13, r: 3.2 },
              { mx: -3, r: 2.4 },
              { mx: 7, r: 3.4 },
              { mx: 17, r: 2.5 },
              { mx: 27, r: 2.9 },
            ].map((p, i) => (
              <circle
                key={i}
                className="glint-mist"
                style={{ "--mx": `${p.mx}px` } as CSSProperties}
                cx="0"
                cy="0"
                r={p.r}
                fill="var(--gold-bright)"
                filter="url(#mistBlur)"
              />
            ))}
          </g>

          <g transform="translate(120,404)">
            <ellipse
              className="glint-ripple"
              cx="0"
              cy="0"
              rx="11"
              ry="4"
              fill="none"
              stroke="var(--gold-bright)"
              strokeWidth="1"
            />
          </g>

          <text
            x="120"
            y="442"
            textAnchor="middle"
            className="glint-word"
            style={{
              fontFamily: "var(--font-serif-display)",
              fontStyle: "italic",
              fontWeight: 400,
              fontSize: "30px",
              fill: "var(--gold-bright)",
            }}
          >
            The Sam Parfums
          </text>
        </svg>
      </div>
    </div>
  );
}
