import { StudentDashboardShell } from "@/components/student-dashboard-shell"

export default function StudentDashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <StudentDashboardShell>{children}</StudentDashboardShell>
}
