// Dominio público del sitio. En Vercel se toma de VERCEL_PROJECT_PRODUCTION_URL (inyectado en el build
// desde vite.config.ts) para que la imagen de vista previa siempre apunte al dominio que sirve este proyecto.
declare const __SITE_URL__: string;

export const SITE_URL = __SITE_URL__;
export const OG_IMAGE = `${SITE_URL}/og-image.jpg`;
