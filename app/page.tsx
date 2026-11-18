import { connection } from "next/server";
import * as HomeController from "@/lib/controllers/HomeController";
import HomeView from "@/lib/views/home/HomeView";

// Route: "/"  (file: app/page.tsx)
// GET / → Page → HomeController.getOverview (read-only: counts and the newest records from the
// Models) → rendered by HomeView: the name "IU Alumni" and its promise, one primary button
// ("Find a graduate"), a secondary way to the job postings, the numbers, the newest job postings
// and announcements, and the four sections. The browser tab shows "IU Alumni" (app/layout.tsx).

export default async function HomePage() {
  // Render on every request, so the numbers and lists are always current
  // (otherwise Next.js could render this page once at build time)
  await connection();

  const overview = await HomeController.getOverview();

  // HomeView renders the page's <main> itself: the full-width green hero band, then the content
  return <HomeView {...overview} />;
}
