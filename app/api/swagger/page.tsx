import type { Metadata } from "next";
import { openApiSpec } from "@/lib/openapi";
import SwaggerView from "./SwaggerView";

// Route: "/api/swagger"  (file: app/api/swagger/page.tsx)
// Interactive API docs. The spec itself lives in lib/openapi.ts.

export const metadata: Metadata = {
  title: "API Docs | Alumni Tracking System",
};

export default function SwaggerPage() {
  // Swagger UI is designed for a light background, so keep it light even in dark mode
  return (
    <div className="flex-1 bg-white text-black">
      <SwaggerView spec={openApiSpec} />
    </div>
  );
}
