"use client"

import Dashboard from "@/components/dashboard/Dashboard"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({
  children,
}: DashboardLayoutProps): React.ReactElement {
  return <Dashboard>{children}</Dashboard>
}
