import AdminSidebar from "@/components/AdminSidebar";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex">
      <AdminSidebar />
      <main className="flex-1 w-full">{children}</main>
    </div>
  );
}
