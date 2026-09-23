// Route: "/about"  (file: app/about/page.tsx)
// Temporary about page — will be built out later in the course.
export default function AboutPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
      <h1 className="text-4xl font-bold">About</h1>
      <p className="max-w-xl text-lg text-gray-600">
        This is the Alumni Tracking System, built for the Web Programming course
        project at Istanbul University.
      </p>
    </main>
  );
}
