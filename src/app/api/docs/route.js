import { NextResponse } from "next/server";

export async function GET() {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>digital.HEROES — Interactive API Documentation</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg-dark: #08090C;
      --surface: #11141B;
      --border: rgba(255, 255, 255, 0.08);
      --gold: #F59E0B;
      --cyan: #06B6D4;
    }
    body {
      margin: 0;
      background-color: var(--bg-dark);
      color: #E2E8F0;
      font-family: 'Outfit', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    .custom-header {
      background: #0D1017;
      border-bottom: 1px solid var(--border);
      padding: 16px 28px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .brand-title {
      font-size: 20px;
      font-weight: 800;
      letter-spacing: -0.02em;
    }
    .brand-title span.accent {
      color: var(--gold);
    }
    .brand-badge {
      background: rgba(245, 158, 11, 0.15);
      border: 1px solid rgba(245, 158, 11, 0.3);
      color: #FBBF24;
      font-size: 11px;
      padding: 4px 10px;
      border-radius: 9999px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .links-group a {
      color: #94A3B8;
      text-decoration: none;
      font-size: 13px;
      margin-left: 16px;
      transition: color 0.15s;
    }
    .links-group a:hover {
      color: #FFF;
    }
    /* Swagger UI Theme Overrides */
    .swagger-ui .topbar { display: none !important; }
    .swagger-ui {
      color: #CBD5E1;
      max-width: 1440px;
      margin: 0 auto;
      padding: 24px 20px 80px;
    }
    .swagger-ui .info { margin: 20px 0 30px; }
    .swagger-ui .info .title {
      color: #F8FAFC !important;
      font-weight: 800;
      font-size: 32px;
      letter-spacing: -0.02em;
    }
    .swagger-ui .info p, .swagger-ui .info li {
      color: #94A3B8 !important;
      line-height: 1.6;
    }
    .swagger-ui .scheme-container {
      background: var(--surface) !important;
      box-shadow: none !important;
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 16px 20px;
      margin-bottom: 24px;
    }
    .swagger-ui .opblock {
      background: var(--surface) !important;
      border: 1px solid var(--border) !important;
      border-radius: 10px !important;
      box-shadow: none !important;
      margin-bottom: 12px !important;
    }
    .swagger-ui .opblock .opblock-summary {
      border: none !important;
      padding: 10px 16px;
    }
    .swagger-ui .opblock .opblock-summary-method {
      border-radius: 6px;
      font-weight: 700;
      font-family: 'JetBrains Mono', monospace;
      font-size: 12px;
    }
    .swagger-ui .opblock .opblock-summary-path {
      color: #F1F5F9 !important;
      font-family: 'JetBrains Mono', monospace;
      font-weight: 600;
      font-size: 14px;
    }
    .swagger-ui .opblock .opblock-summary-description {
      color: #94A3B8 !important;
    }
    .swagger-ui .opblock-body {
      background: #0B0E14 !important;
      border-top: 1px solid var(--border);
    }
    .swagger-ui table thead tr th {
      color: #E2E8F0 !important;
      border-bottom: 1px solid var(--border) !important;
    }
    .swagger-ui table tbody tr td {
      border-bottom: 1px solid var(--border) !important;
      color: #CBD5E1 !important;
    }
    .swagger-ui .response-col_status {
      color: #F8FAFC !important;
      font-weight: 700;
    }
    .swagger-ui select, .swagger-ui input[type="text"] {
      background: #19202D !important;
      border: 1px solid #334155 !important;
      color: #F8FAFC !important;
      border-radius: 6px;
    }
    .swagger-ui .btn {
      border-radius: 6px !important;
      border: 1px solid var(--border) !important;
      color: #E2E8F0 !important;
      background: #1E293B !important;
    }
    .swagger-ui .btn.execute {
      background: #0284C7 !important;
      border-color: #0369A1 !important;
      color: #FFF !important;
      font-weight: 700;
    }
    .swagger-ui .btn.authorize {
      color: var(--gold) !important;
      border-color: var(--gold) !important;
      background: transparent !important;
    }
    .swagger-ui .btn.authorize svg {
      fill: var(--gold) !important;
    }
    .swagger-ui section.models {
      border: 1px solid var(--border) !important;
      border-radius: 12px !important;
      background: var(--surface) !important;
      margin-top: 40px;
    }
    .swagger-ui section.models h4 {
      color: #F8FAFC !important;
      font-size: 18px;
      font-weight: 700;
      border-bottom: 1px solid var(--border);
    }
    .swagger-ui .model-box {
      background: #0B0E14 !important;
      border-radius: 8px;
      padding: 12px;
    }
    .swagger-ui .model-title {
      color: #F1F5F9 !important;
      font-family: 'JetBrains Mono', monospace;
    }
    .swagger-ui .prop-type {
      color: var(--cyan) !important;
    }
    .swagger-ui .prop-format {
      color: #94A3B8 !important;
    }
  </style>
</head>
<body>
  <div class="custom-header">
    <div style="display: flex; align-items: center; gap: 12px;">
      <div class="brand-title"><span class="accent">digital.</span>HEROES</div>
      <div class="brand-badge">OpenAPI 3.0</div>
    </div>
    <div class="links-group">
      <a href="/api/openapi.json" target="_blank">Raw JSON Spec</a>
      <a href="/" target="_blank">Platform Home</a>
    </div>
  </div>

  <div id="swagger-ui"></div>

  <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js" crossorigin></script>
  <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-standalone-preset.js" crossorigin></script>
  <script>
    window.onload = () => {
      window.ui = SwaggerUIBundle({
        url: '/api/openapi.json',
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIStandalonePreset
        ],
        layout: "StandaloneLayout",
        defaultModelsExpandDepth: 2,
        defaultModelExpandDepth: 2,
        docExpansion: "list",
      });
    };
  </script>
</body>
</html>`;

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
    },
  });
}
