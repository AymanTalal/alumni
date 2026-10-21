import Link from "next/link";
import type { ApplicationWithJobPosting } from "@/lib/models/application";
import { formatDate } from "../announcements/formatDate";

// View: the read-only "Applications" section of a user's page: the job postings this user applied
// to (title, company, status, date), each linking to /jobs/{id}. Markup and styling only, no data
// logic: the page gets the applications (already joined with their job postings) from
// ApplicationController and passes them in. Applications are changed on the job posting's page.

type Props = {
  applications: ApplicationWithJobPosting[];
};

export default function UserApplicationsView({ applications }: Props) {
  return (
    <section className="mt-10">
      <h2 className="text-2xl font-semibold">Applications</h2>

      {applications.length === 0 ? (
        <p className="mt-2 text-gray-600">This user hasn&apos;t applied to any job postings yet.</p>
      ) : (
        <table className="mt-4 w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-gray-300">
              <th className="py-2 pr-4">Job posting</th>
              <th className="py-2 pr-4">Company</th>
              <th className="py-2 pr-4">Status</th>
              <th className="py-2 pr-4">Applied</th>
            </tr>
          </thead>
          <tbody>
            {applications.map((application) => (
              <tr key={application.id} className="border-b border-gray-200 align-top">
                <td className="py-2 pr-4">
                  <Link
                    href={`/jobs/${application.jobPosting.id}`}
                    className="font-medium text-blue-600 hover:underline"
                  >
                    {application.jobPosting.title}
                  </Link>
                </td>
                <td className="py-2 pr-4">{application.jobPosting.company || "—"}</td>
                <td className="py-2 pr-4">{application.status}</td>
                <td className="py-2 pr-4 text-sm text-gray-600">
                  {formatDate(application.createdAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
