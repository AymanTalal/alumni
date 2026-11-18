import { connection } from "next/server";
import * as ApplicationController from "@/lib/controllers/ApplicationController";
import ApplicationListView from "@/lib/views/applications/ApplicationListView";
import { ButtonLink } from "@/lib/views/ui/Button";
import { CheckIcon, ClipboardIcon, ClockIcon, CrossIcon } from "@/lib/views/ui/icons";
import PageBand from "@/lib/views/ui/PageBand";
import PageContainer from "@/lib/views/ui/PageContainer";
import Panel from "@/lib/views/ui/Panel";
import StatsStrip from "@/lib/views/ui/StatsStrip";
import { deleteApplicationAction, updateApplicationStatusAction } from "../jobs/actions";

// Route: "/applications"  (file: app/applications/page.tsx)
// GET /applications  → Page → ApplicationController.getAll → Model (applications joined with their
//                      users and job postings), rendered by ApplicationListView
// POST /applications → the same Server Actions as a job posting's page (../jobs/actions.ts):
//                      each row's Update → ApplicationController.updateStatus,
//                      Remove → ApplicationController.delete
// The page band, the counts by status (a small StatsStrip over the band) and the table in a Panel
// (DESIGN.md §9: a management list keeps the table). New applications are added on a job posting's
// page, so the one primary button is "Browse job postings" — in the band, or, when the list is
// empty, in the empty state and not in the band.

export const metadata = { title: "Applications" };

export default async function ApplicationsPage() {
  // Render on every request, so new applications and status changes show up
  await connection();

  const { applications } = await ApplicationController.getAll();

  // The counts by status, from the same list (no new query)
  const countOf = (status: string) => applications.filter((application) => application.status === status).length;

  return (
    <PageContainer
      overlap
      band={
        <PageBand
          overlap
          eyebrow="Management"
          title="Applications"
          description="Who applied to which job posting, and where each one stands."
          actions={
            applications.length > 0 ? (
              <ButtonLink href="/jobs" variant="onAction">
                Browse job postings
              </ButtonLink>
            ) : undefined
          }
        />
      }
    >
      {/* The counts by status, over the band's bottom edge */}
      <StatsStrip
        bare
        columns={3}
        items={[
          { label: "Pending", value: countOf("pending"), icon: <ClockIcon size={18} /> },
          { label: "Accepted", value: countOf("accepted"), icon: <CheckIcon size={18} /> },
          { label: "Rejected", value: countOf("rejected"), icon: <CrossIcon size={18} /> },
        ]}
      />

      <Panel
        title="All applications"
        icon={<ClipboardIcon />}
        count={applications.length === 1 ? "1 application" : `${applications.length} applications`}
      >
        <ApplicationListView
          applications={applications}
          statuses={ApplicationController.STATUSES}
          updateStatusAction={updateApplicationStatusAction}
          deleteAction={deleteApplicationAction}
        />
      </Panel>
    </PageContainer>
  );
}
