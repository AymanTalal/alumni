import Link from "next/link";

// Route: "/"  (file: app/page.tsx)
// Temporary homepage — will be replaced later in the course.
export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
      <h1 className="text-4xl font-bold">Alumni Tracking System</h1>
      <p className="text-lg text-gray-600">
        Keeping Istanbul University connected with its graduates.
      </p>
      <nav className="flex gap-6">
        <Link href="/users" className="text-blue-600 hover:underline">
          Users
        </Link>
        <Link href="/announcements" className="text-blue-600 hover:underline">
          Announcements
        </Link>
        <Link href="/jobs" className="text-blue-600 hover:underline">
          Jobs
        </Link>
      </nav>
    </main>
  );
}
