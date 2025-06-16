import Sidebar from "@/components/Sidebar";

export default function TransporterLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="corporate">
      <body>
        <div className="flex">
          <Sidebar />
          <main className="flex-1">{children}</main>
        </div>
      </body>
    </html>
  );
}
