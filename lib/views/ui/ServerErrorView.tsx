import EmptyState from "./EmptyState";
import PageBand from "./PageBand";
import PageContainer from "./PageContainer";

// Shared UI: the page people see when a page fails on the server (HTTP 500) — used by
// app/error.tsx (inside the normal layout) and app/global-error.tsx (when even the layout fails).
// DESIGN.md §9: the page band with the title, then the shared empty state over it (illustration).
// Text in the BRAND.md voice: say what happened, then what to do next; no "Something went wrong",
// no technical details. One primary button ("Try again", which re-renders the page) and a link
// home. The JSON API keeps its own 500 / 503 answers (lib/http/serverError.ts). Markup only.

type Props = {
  onRetry: () => void;
  digest?: string; // the error's reference, to match it with the server log
};

export default function ServerErrorView({ onRetry, digest }: Props) {
  return (
    <PageContainer
      width="narrow"
      overlap
      band={<PageBand width="narrow" overlap eyebrow="Something on our side" title="We couldn't load this page." />}
    >
      <EmptyState
        title="The problem is on our side, not with your link."
        action={{ onClick: onRetry, label: "Try again" }}
        secondary={{ href: "/", label: "Go to the home page" }}
      >
        <p>Please try again in a moment. If it keeps happening, go back to the home page and try later.</p>
        {digest && (
          <p className="mt-3 text-xs">
            If you contact the alumni office about this, mention this reference: <code>{digest}</code>
          </p>
        )}
      </EmptyState>
    </PageContainer>
  );
}
