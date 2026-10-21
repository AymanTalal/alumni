import { connection } from "next/server";
import * as ApplicationController from "@/lib/controllers/ApplicationController";
import ApplicationListView from "@/lib/views/applications/ApplicationListView";
import PageContainer from "@/lib/views/ui/PageContainer";
import PageHeader from "@/lib/views/ui/PageHeader";
import { deleteApplicationAction, updateApplicationStatusAction } from "../jobs/actions";

// Route: "/applications"  (file: app/applications/page.tsx)
// GET /applications  → Page → ApplicationController.getAll → Model (applications joined with their
//                      users and job postings), rendered by ApplicationListView
// POST /applications → the same Server Actions as a job posting's page (../jobs/actions.ts):
//                      each row's Update → ApplicationController.updateStatus,
//                      Remove → ApplicationController.delete
// New applications are added on a job posting's page (/jobs/{id}).

export default async function ApplicationsPage() {
  // Render on every request, so new applications and status changes show up
  await connection();

  const { applications } = await ApplicationController.getAll();

  return (
    <PageContainer>
      <PageHeader
        title="Applications"
        description={`${applications.length} application(s) — users applying to job postings`}
      />

      <ApplicationListView
        applications={applications}
        statuses={ApplicationController.STATUSES}
        updateStatusAction={updateApplicationStatusAction}
        deleteAction={deleteApplicationAction}
      />
    </PageContainer>
  );
}
