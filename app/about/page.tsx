import PageContainer from "@/lib/views/ui/PageContainer";
import PageHeader from "@/lib/views/ui/PageHeader";

// Route: "/about"  (file: app/about/page.tsx)
// Temporary about page — will be built out later in the course.
export default function AboutPage() {
  return (
    <PageContainer width="narrow">
      <PageHeader
        title="About"
        description="This is the Alumni Tracking System, built for the Web Programming course project at Istanbul University."
      />
    </PageContainer>
  );
}
