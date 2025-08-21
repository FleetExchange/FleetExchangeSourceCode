import Banner from "@/components/Banner";
import MobileMenuTransporter from "@/components/MobileMenuTransporter";
import TransporterSidebar from "@/components/TransporterSidebar";

export default function TransporterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <Banner />
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <TransporterSidebar />
      </div>

      {/* Mobile Menu */}
      <MobileMenuTransporter />

      {/* Main Content */}
      <main className="lg:ml-5">{children}</main>
    </div>
  );
}
