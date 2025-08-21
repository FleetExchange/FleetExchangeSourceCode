import Banner from "@/components/Banner";
import ClientSidebar from "@/components/ClientSidebar";
import MobileMenuClient from "@/components/MobileMenuClient";

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div>
      <Banner />
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <ClientSidebar />
      </div>

      {/* Mobile Menu */}
      <MobileMenuClient />

      {/* Main Content */}
      <main className="lg:ml-5">{children}</main>
    </div>
  );
}
