import Sidebar from "@/components/AdminSidebar";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex">
      <Sidebar loggedInRole="admin" />
      <main className="flex-1">{children}</main>
    </div>
  );
}
