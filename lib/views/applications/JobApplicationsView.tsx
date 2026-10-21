import Link from "next/link";
import type { ApplicationStatus, ApplicationWithUser } from "@/lib/models/application";
import type { User } from "@/lib/models/user";
import { formatDate } from "../announcements/formatDate";
import ApplicationCreateForm, { type ApplicationFormState } from "./ApplicationCreateForm";
import ApplicationStatusForm from "./ApplicationStatusForm";
import DeleteApplicationButton, { type DeleteApplicationState } from "./DeleteApplicationButton";

// View: the "Applications" section of a job posting's page: a table of the applicants (name,
// email, status, date) with a status form and a Remove button for each, and the "Add application"
// form. Markup and styling only, no data logic: the page gets the applications (already joined with
// their users) from ApplicationController and passes them in, with the users and the Server Actions.

type Props = {
  jobPostingId: number;
  applications: ApplicationWithUser[];
  users: User[];
  statuses: readonly ApplicationStatus[];
  createAction: (
    jobPostingId: number,
    state: ApplicationFormState,
    formData: FormData,
  ) => Promise<ApplicationFormState>;
  updateStatusAction: (
    applicationId: number,
    state: ApplicationFormState,
    formData: FormData,
  ) => Promise<ApplicationFormState>;
  deleteAction: (
    applicationId: number,
    state: DeleteApplicationState,
    formData: FormData,
  ) => Promise<DeleteApplicationState>;
};

// Text color for each status
const STATUS_STYLE: Record<ApplicationStatus, string> = {
  pending: "text-gray-700",
  accepted: "text-green-700",
  rejected: "text-red-600",
};

export default function JobApplicationsView({
  jobPostingId,
  applications,
  users,
  statuses,
  createAction,
  updateStatusAction,
  deleteAction,
}: Props) {
  return (
    <section className="mt-10">
      <h2 className="text-2xl font-semibold">Applications</h2>
      <p className="mt-1 text-gray-600">{applications.length} application(s)</p>

      {applications.length === 0 ? (
        <p className="mt-4 text-gray-600">No applications yet. Add one with the form below.</p>
      ) : (
        <table className="mt-4 w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-gray-300">
              <th className="py-2 pr-4">Applicant</th>
              <th className="py-2 pr-4">Status</th>
              <th className="py-2 pr-4">Applied</th>
              <th className="py-2 pr-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {applications.map((application) => (
              <tr key={application.id} className="border-b border-gray-200 align-top">
                <td className="py-2 pr-4">
                  <Link
                    href={`/users/${application.user.id}`}
                    className="font-medium text-blue-600 hover:underline"
                  >
                    {application.user.name}
                  </Link>
                  <div className="text-sm text-gray-600">{application.user.email || "—"}</div>
                </td>
                <td className={`py-2 pr-4 font-medium ${STATUS_STYLE[application.status]}`}>
                  {application.status}
                </td>
                <td className="py-2 pr-4 text-sm text-gray-600">
                  {formatDate(application.createdAt)}
                </td>
                <td className="py-2 pr-4">
                  <div className="flex items-start gap-3">
                    <ApplicationStatusForm
                      applicationId={application.id}
                      status={application.status}
                      statuses={statuses}
                      action={updateStatusAction}
                    />
                    <DeleteApplicationButton
                      applicationId={application.id}
                      applicantName={application.user.name}
                      action={deleteAction}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <ApplicationCreateForm jobPostingId={jobPostingId} users={users} action={createAction} />
    </section>
  );
}
