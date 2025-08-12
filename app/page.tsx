import Link from "next/link";
import Image from "next/image";
import Logo from "@/components/Logo";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-base-100 to-base-200">
      {/* Navigation */}
      <nav className="navbar bg-base-100/80 backdrop-blur-sm sticky top-0 z-50 border-b border-base-300">
        <div className="navbar-start">
          <Logo variant="icon" size="md" href="/" />
        </div>

        <div className="navbar-end gap-2">
          <Link href="/sign-in">
            <button className="btn btn-ghost">Log In</button>
          </Link>
          <Link href="/sign-up">
            <button className="btn btn-primary">Sign Up</button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl lg:text-6xl font-bold text-base-content leading-tight">
                Free Fleet
                <span className="text-primary block">Exchange</span>
              </h1>
              <p className="text-xl text-base-content/70 leading-relaxed max-w-lg">
                Connect transporters & clients to exchange freight services
                efficiently. Streamline your logistics workflow with powerful
                tools.
              </p>

              {/* Mission Statement */}
              <div className="bg-primary/10 border-l-4 border-primary p-4 rounded-r-lg">
                <p className="text-base font-medium text-primary italic">
                  "Our mission is to provide Fast, Instantaneous & reliable
                  logistic solutions ensuring you have peace of mind"
                </p>
              </div>
            </div>

            {/* CTA Section */}
            <div className="space-y-4">
              <Link href="/sign-up">
                <button className="btn btn-primary btn-lg text-lg px-8">
                  Get started
                </button>
              </Link>
              <div className="flex items-center gap-2 text-sm text-base-content/60">
                <span>Free Forever.</span>
                <span>No Credit Card.</span>
              </div>
            </div>

            {/* Rating Section */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-warning text-lg">
                    ★
                  </span>
                ))}
              </div>
              <span className="text-sm text-base-content/60">
                4.8+ reviews from freight companies
              </span>
            </div>

            {/* Trusted By */}
            <div className="space-y-4">
              <p className="text-sm text-base-content/60">
                Trusted by 500+ logistics teams
              </p>
              <div className="flex flex-wrap items-center gap-8 opacity-60">
                {/* Logo placeholders - replace with actual client logos */}
                <div className="bg-base-300 rounded px-4 py-2 text-xs font-medium">
                  Company 1
                </div>
                <div className="bg-base-300 rounded px-4 py-2 text-xs font-medium">
                  Company 2
                </div>
                <div className="bg-base-300 rounded px-4 py-2 text-xs font-medium">
                  Company 3
                </div>
                <div className="bg-base-300 rounded px-4 py-2 text-xs font-medium">
                  Company 4
                </div>
              </div>
            </div>
          </div>

          {/* Right Content - Dashboard Preview */}
          <div className="relative">
            <div className="bg-base-100 rounded-2xl shadow-2xl border border-base-300 overflow-hidden">
              {/* Mock Dashboard Header */}
              <div className="bg-primary/5 p-4 border-b border-base-300">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Logo variant="icon" size="sm" href="/" />
                    <span className="font-semibold">
                      FleetExchange Dashboard
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <div className="w-3 h-3 bg-success rounded-full"></div>
                    <div className="w-3 h-3 bg-warning rounded-full"></div>
                    <div className="w-3 h-3 bg-error rounded-full"></div>
                  </div>
                </div>
              </div>

              {/* Mock Dashboard Content */}
              <div className="p-6 space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-primary/10 rounded-lg p-4">
                    <div className="text-2xl font-bold text-primary">24</div>
                    <div className="text-xs text-base-content/60">
                      Active Trips
                    </div>
                  </div>
                  <div className="bg-success/10 rounded-lg p-4">
                    <div className="text-2xl font-bold text-success">R45k</div>
                    <div className="text-xs text-base-content/60">Revenue</div>
                  </div>
                  <div className="bg-warning/10 rounded-lg p-4">
                    <div className="text-2xl font-bold text-warning">12</div>
                    <div className="text-xs text-base-content/60">Trucks</div>
                  </div>
                </div>

                {/* Trip List */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-sm">Recent Trips</h3>
                  {[
                    {
                      from: "Cape Town",
                      to: "Johannesburg",
                      status: "Dispatched",
                    },
                    { from: "Durban", to: "Pretoria", status: "Delivered" },
                    {
                      from: "Port Elizabeth",
                      to: "Bloemfontein",
                      status: "Booked",
                    },
                  ].map((trip, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 bg-base-200/50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
                          <span className="text-xs">🚛</span>
                        </div>
                        <div>
                          <div className="font-medium text-sm">
                            {trip.from} → {trip.to}
                          </div>
                          <div className="text-xs text-base-content/60">
                            2 hours ago
                          </div>
                        </div>
                      </div>
                      <div
                        className={`badge badge-sm ${
                          trip.status === "Delivered"
                            ? "badge-success"
                            : trip.status === "Dispatched"
                              ? "badge-warning"
                              : "badge-primary"
                        }`}
                      >
                        {trip.status}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Floating Elements */}
            <div className="absolute -top-4 -right-4 bg-success rounded-xl p-3 shadow-lg">
              <div className="text-white text-sm font-medium">
                Real-time Updates
              </div>
            </div>
            <div className="absolute -bottom-4 -left-4 bg-primary rounded-xl p-3 shadow-lg">
              <div className="text-white text-sm font-medium">
                Payment Tracking
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mission Values Section */}
      <div className="bg-base-100 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-8">
            <h2 className="text-3xl font-bold text-base-content">
              Built for Peace of Mind
            </h2>

            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="text-center space-y-3">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-2xl">⚡</span>
                </div>
                <h3 className="text-xl font-bold text-primary">Fast</h3>
                <p className="text-base-content/70">
                  Quick booking and instant trip matching
                </p>
              </div>

              <div className="text-center space-y-3">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-2xl">⏱️</span>
                </div>
                <h3 className="text-xl font-bold text-primary">
                  Instantaneous
                </h3>
                <p className="text-base-content/70">
                  Real-time updates and immediate responses
                </p>
              </div>

              <div className="text-center space-y-3">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-2xl">🛡️</span>
                </div>
                <h3 className="text-xl font-bold text-primary">Reliable</h3>
                <p className="text-base-content/70">
                  Trusted platform with secure transactions
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-base-200/50 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl font-bold text-base-content">
              Everything you need to manage freight
            </h2>
            <p className="text-xl text-base-content/70 max-w-2xl mx-auto">
              From trip booking to payment processing, FreightConnect handles it
              all
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: "📋",
                title: "Trip Management",
                description:
                  "Create, track, and manage freight trips with real-time status updates",
              },
              {
                icon: "💳",
                title: "Secure Payments",
                description:
                  "Integrated payment processing with automated transfers to transporters",
              },
              {
                icon: "🚛",
                title: "Fleet Tracking",
                description:
                  "Monitor your entire fleet and optimize routes for maximum efficiency",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="bg-base-100 rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-base-content/70">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-base-300 py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-base-content/60">
            © 2025 FreightConnect. Built for the South African logistics
            industry.
          </p>
        </div>
      </footer>
    </div>
  );
}
