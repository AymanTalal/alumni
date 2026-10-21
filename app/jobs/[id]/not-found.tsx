import Link from "next/link";

// Shown (with HTTP 404) when app/jobs/[id]/page.tsx calls notFound() for an unknown id.
export default function JobPostingNotFound() {
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-12">
      <Link href="/jobs" className="text-blue-600 hover:underline">
        ← All job postings
      </Link>
      <h1 className="mt-6 text-3xl font-bold">Job posting not found</h1>
      <p className="mt-2 text-gray-600">There is no job posting with this id.</p>
    </main>
  );
}
