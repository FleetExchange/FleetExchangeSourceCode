import TransporterSidebar from "@/components/TransporterSidebar";

export default function TransporterLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex">
      <TransporterSidebar />
      <main className="flex-1">{children}</main>
    </div>
  );
}
