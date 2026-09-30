"use client";

import { useEffect, useRef } from "react";
import "swagger-ui-dist/swagger-ui.css";

// Uses "swagger-ui-dist" (the official pre-built Swagger UI) instead of "swagger-ui-react".
// It ships with its own copy of React and draws itself into the empty <div> below, so its
// old internal components never render inside our app's React Strict Mode tree
// (which caused the "UNSAFE_componentWillReceiveProps ... ModelCollapse" warning).
export default function SwaggerView({ spec }: { spec: object }) {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;

    // Swagger UI needs the browser, so load it only here (useEffect never runs on the server)
    import("swagger-ui-dist").then(({ SwaggerUIBundle }) => {
      if (cancelled || !container.current) return;
      SwaggerUIBundle({ domNode: container.current, spec });
    });

    return () => {
      cancelled = true;
    };
  }, [spec]);

  return <div ref={container} />;
}
