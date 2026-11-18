import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import SiteFooter from "@/lib/views/ui/SiteFooter";
import SiteHeader from "@/lib/views/ui/SiteHeader";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// The name and promise come from BRAND.md. A page can set its own title (e.g. "Job postings"),
// which the template turns into "Job postings · IU Alumni"; pages without one show "IU Alumni".
export const metadata: Metadata = {
  title: { default: "IU Alumni", template: "%s · IU Alumni" },
  description:
    "Every IU graduate, one step away. The alumni platform of Istanbul University for its graduates, students and staff.",
  applicationName: "IU Alumni",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      {/* Colors, fonts and the page background come from the theme tokens in ./globals.css */}
      <body className="min-h-full flex flex-col">
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
