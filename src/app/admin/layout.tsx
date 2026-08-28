import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin — SPECTRA",
  description: "SPECTRA Store Admin Dashboard",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-[#0a0a0a] text-neutral-100 font-sans">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden bg-[#080808]">
        <AdminHeader />
        <main className="flex-1 overflow-y-auto p-6 lg:p-8 bg-[#0a0a0a]">
          {children}
        </main>
      </div>
    </div>
  );
}
