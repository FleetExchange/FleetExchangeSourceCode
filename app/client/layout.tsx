import ClientSidebar from "@/components/ClientSidebar";

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex">
      <ClientSidebar />
      <main className="flex-1">{children}</main>
    </div>
  );
}
