import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import { AdminNavProvider } from "@/components/admin/AdminNavContext";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { ADMIN_COOKIE_NAME, isValidSessionToken } from "@/lib/adminAuth";

export const metadata: Metadata = {
  title: "Admin — SPECTRA",
  description: "SPECTRA Store Admin Dashboard",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  const isAuthenticated = Boolean(token && isValidSessionToken(token));

  // If not authenticated (such as on the login screen), render cleanly without sidebar
  if (!isAuthenticated) {
    return <div className="min-h-screen bg-[#070707] text-neutral-100 font-sans">{children}</div>;
  }

  return (
    <AdminNavProvider>
      <div className="flex h-screen overflow-hidden bg-[#0a0a0a] text-neutral-100 font-sans">
        {/* Sidebar */}
        <AdminSidebar />

        {/* Main Content Area */}
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden bg-[#080808]">
          <AdminHeader />
          <main className="flex-1 overflow-y-auto no-scrollbar p-3.5 sm:p-6 lg:p-8 bg-[#0a0a0a]">
            {children}
          </main>
        </div>
      </div>
    </AdminNavProvider>
  );
}
