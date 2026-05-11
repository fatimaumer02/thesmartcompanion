import React from 'react';
import Sidebar from "../../components/Sidebar"

export default function DashboardLayout({ children }: React.PropsWithChildren<{}>) {
  return (
    <div className="flex">
      <Sidebar />

      {/* Main Content */}
      <main className="ml-64 flex-1 p-6">
        {children}
      </main>
    </div>
  )
}