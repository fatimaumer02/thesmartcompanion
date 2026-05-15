import React from 'react';
import Sidebar from "../../components/Sidebar"

export default function DashboardLayout({ children }: React.PropsWithChildren<{}>) {
  return (
    <div className="flex">
      <Sidebar />

      {/* Main Content */}
      <main className="lg:ml-64 flex-1 p-4 sm:p-6 pt-20 lg:pt-6">
        {children}
      </main>
    </div>
  )
}