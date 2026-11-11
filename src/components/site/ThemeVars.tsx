import { CONFIG_SITIO_DEFAULT, FONT_PRESETS, type FontPresetKey } from "@/lib/apariencia";

/** Esta demo no tiene backend: el tema siempre usa la configuración de apariencia.ts. */
export function ThemeVars() {
  const config = CONFIG_SITIO_DEFAULT;
  const fuente = FONT_PRESETS[config.tipografia as FontPresetKey] ?? FONT_PRESETS.cormorant_jost;

  const css = `:root {
  --background: ${config.color_fondo};
  --foreground: ${config.color_texto};
  --gold: ${config.color_dorado};
  --primary: ${config.color_dorado};
  --accent: ${config.color_dorado};
  --gold-bright: ${config.color_dorado_claro};
  --ring: ${config.color_dorado_claro};
  --font-serif-display: ${fuente.display};
  --font-ui-sans: ${fuente.sans};
}`;

  return <style id="theme-vars" dangerouslySetInnerHTML={{ __html: css }} />;
}
