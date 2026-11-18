// Shared UI: the <main> wrapper of every page: centered, with generous white space, and narrow
// enough to read comfortably. Markup and styling only.
//   - without `band`: just the centered content (as before)
//   - with `band` (a PageBand, DESIGN.md §9): the full-width band first, then the content; with
//     `overlap`, the first card of the content sits over the band's bottom edge

type Props = {
  children: React.ReactNode;
  width?: "narrow" | "wide";
  band?: React.ReactNode;
  overlap?: boolean;
};

// The page's width and side margins, without the vertical padding — also used inside a full-width
// band (Hero, PageBand) so its content lines up with the page below it
export function pageWidthClasses(width: "narrow" | "wide" = "wide") {
  return `mx-auto w-full ${width === "narrow" ? "max-w-2xl" : "max-w-5xl"} px-4 sm:px-6`;
}

export default function PageContainer({ children, width = "wide", band, overlap = false }: Props) {
  if (!band) {
    return <main className={`${pageWidthClasses(width)} flex-1 py-8 sm:py-12`}>{children}</main>;
  }
  return (
    <main className="flex-1">
      {band}
      <div
        className={`${pageWidthClasses(width)} ${overlap ? "relative z-10 -mt-14 pb-10 sm:pb-12" : "py-10 sm:py-12"} flex flex-col gap-8`}
      >
        {children}
      </div>
    </main>
  );
}
