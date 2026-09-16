"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";

export default function DocsPage() {
  const containerRef = useRef(null);

  useEffect(() => {
    // Dynamic import to avoid SSR issues with swagger-ui-dist
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/swagger-ui-dist@5/swagger-ui.css";
    document.head.appendChild(link);

    const scriptBundle = document.createElement("script");
    scriptBundle.src = "https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js";
    scriptBundle.crossOrigin = "anonymous";
    document.body.appendChild(scriptBundle);

    const scriptPreset = document.createElement("script");
    scriptPreset.src = "https://unpkg.com/swagger-ui-dist@5/swagger-ui-standalone-preset.js";
    scriptPreset.crossOrigin = "anonymous";
    document.body.appendChild(scriptPreset);

    scriptBundle.onload = () => {
      const checkLoaded = setInterval(() => {
        if (window.SwaggerUIBundle && window.SwaggerUIStandalonePreset) {
          clearInterval(checkLoaded);
          window.SwaggerUIBundle({
            url: "/api/openapi.json",
            dom_id: "#swagger-container",
            deepLinking: true,
            presets: [
              window.SwaggerUIBundle.presets.apis,
              window.SwaggerUIStandalonePreset,
            ],
            layout: "StandaloneLayout",
            defaultModelsExpandDepth: 2,
            defaultModelExpandDepth: 2,
            docExpansion: "list",
          });
        }
      }, 100);
    };

    return () => {
      // Cleanup injected scripts on unmount
      if (link.parentNode) link.parentNode.removeChild(link);
      if (scriptBundle.parentNode) scriptBundle.parentNode.removeChild(scriptBundle);
      if (scriptPreset.parentNode) scriptPreset.parentNode.removeChild(scriptPreset);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#08090C] text-slate-200">
      <header className="border-b border-white/10 bg-[#0D1017] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-black tracking-tight">
            <span className="text-amber-400">digital.</span>HEROES
          </h1>
          <span className="text-[11px] font-semibold tracking-wider uppercase px-2.5 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-300">
            Swagger Docs
          </span>
        </div>
        <div className="flex items-center gap-4 text-xs text-slate-400">
          <a
            href="/api/openapi.json"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition"
          >
            Raw OpenAPI JSON
          </a>
          <Link
            href="/"
            className="hover:text-white transition"
          >
            Back to Platform
          </Link>
        </div>
      </header>

      <main className="p-4 md:p-8 max-w-7xl mx-auto">
        <div id="swagger-container" ref={containerRef} />
      </main>
    </div>
  );
}
