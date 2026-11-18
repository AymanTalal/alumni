import type { Metadata } from "next";
import { openApiSpec } from "@/lib/openapi";
import SwaggerView from "./SwaggerView";

// Route: "/api/swagger"  (file: app/api/swagger/page.tsx)
// Interactive API docs. The spec itself lives in lib/openapi.ts.

export const metadata: Metadata = {
  title: "API Docs", // shown as "API Docs · IU Alumni" (the title template in app/layout.tsx)
};

export default function SwaggerPage() {
  // Swagger UI is designed for a light background: the white surface and the main text color
  // come from the design tokens (BRAND.md), never a hex or a palette color
  return (
    <div className="flex-1 bg-surface text-ink">
      <SwaggerView spec={openApiSpec} />
    </div>
  );
}
