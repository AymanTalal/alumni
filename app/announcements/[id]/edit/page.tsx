import { notFound } from "next/navigation";
import { connection } from "next/server";
import * as AnnouncementController from "@/lib/controllers/AnnouncementController";
import AnnouncementEditForm from "@/lib/views/announcements/AnnouncementEditForm";
import { updateAnnouncementAction } from "../../actions";

// Route: "/announcements/:id/edit"  (file: app/announcements/[id]/edit/page.tsx)
// GET → Page → AnnouncementController.getById → Model, rendered by AnnouncementEditForm.
// Submitting the form runs updateAnnouncementAction (../../actions.ts) → AnnouncementController.update.

export default async function EditAnnouncementPage({
  params,
}: PageProps<"/announcements/[id]/edit">) {
  // Render on every request, so the form is pre-filled with the current data
  await connection();

  const { id } = await params;
  const result = await AnnouncementController.getById(id);

  // Unknown or invalid id → 404 status and the "Announcement not found" page in ../not-found.tsx
  if ("error" in result) notFound();

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-12">
      <h1 className="text-3xl font-bold">Edit announcement</h1>
      <AnnouncementEditForm announcement={result.announcement} action={updateAnnouncementAction} />
    </main>
  );
}
