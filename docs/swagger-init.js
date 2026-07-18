// Inizializzazione Swagger UI per /docs/. File esterno, non inline: la CSP
// dell'edge Cloudflare (script-src senza 'unsafe-inline') copre anche
// authweb. Lo spec è la copia locale sincronizzata da imgauth via
// sync-openapi.yml (zero chiamate passive al Worker); "servers" nello
// spec stesso punta a imgauth.spaziogenesi.org, quindi "Try it out"
// chiama comunque l'API reale.
window.onload = function () {
  window.ui = SwaggerUIBundle({
    url: "/docs/openapi.json",
    dom_id: "#swagger-ui",
    deepLinking: true,
    presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],
    plugins: [SwaggerUIBundle.plugins.DownloadUrl],
    layout: "StandaloneLayout",
  });
};
