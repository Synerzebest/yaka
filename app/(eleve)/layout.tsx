import { getStudentData } from '@/lib/student-data';
import { StudentProvider } from '@/components/student/provider';
import { StudentShell } from '@/components/student/shell';
export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const data = await getStudentData();
  return (
    <StudentProvider
      key={data.profile.id}
      initialProfile={data.profile}
      initialProgress={data.progress}
      courses={data.courses}
      contentError={data.contentError}
    >
      <StudentShell>{children}</StudentShell>
    </StudentProvider>
  );
}
