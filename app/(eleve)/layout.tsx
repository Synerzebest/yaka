import { Suspense } from 'react';
import { getStudentData } from '@/lib/student-data';
import { StudentProvider } from '@/components/student/provider';
import { StudentShell } from '@/components/student/shell';
import { StudentPageSkeleton, StudentShellSkeleton } from '@/components/skeletons';

// The data is loaded inside a Suspense boundary: a loading.tsx never wraps the layout of its own
// segment, so without it the screen would stay blank until the profile and progress arrive.
export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <StudentShellSkeleton>
          <StudentPageSkeleton />
        </StudentShellSkeleton>
      }
    >
      <StudentArea>{children}</StudentArea>
    </Suspense>
  );
}

async function StudentArea({ children }: { children: React.ReactNode }) {
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
