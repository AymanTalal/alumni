// Shared UI: the <main> wrapper of every page: centered, with generous white space, and narrow
// enough to read comfortably. Markup and styling only.

type Props = { children: React.ReactNode; width?: "narrow" | "wide" };

export default function PageContainer({ children, width = "wide" }: Props) {
  const max = width === "narrow" ? "max-w-2xl" : "max-w-5xl";
  return <main className={`mx-auto w-full ${max} flex-1 px-4 py-8 sm:px-6 sm:py-12`}>{children}</main>;
}
