import TransporterSidebar from "@/components/TransporterSidebar";

export default function TransporterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}

      <TransporterSidebar />

      {/* Main content area - THIS should take remaining space */}
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
