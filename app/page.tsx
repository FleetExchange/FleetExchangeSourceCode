import Link from "next/link";
import Image from "next/image";
import Logo from "@/components/Logo";
import {
  Truck,
  Shield,
  Zap,
  Users,
  ArrowRight,
  CheckCircle,
  MapPin,
  Clock,
  Star,
  Phone,
  Mail,
  Award,
  Target,
  Heart,
  TrendingUp,
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-base-100">
      {/* Navigation */}
      <nav className="navbar bg-base-100/95 backdrop-blur-md sticky top-0 z-50 border-b border-base-200 shadow-sm">
        <div className="container mx-auto">
          <div className="navbar-start">
            <Logo variant="full" size="lg" href="/" />
          </div>

          <div className="navbar-end gap-3">
            <Link href="/sign-in">
              <button className="btn btn-ghost btn-sm">Log In</button>
            </Link>
            <Link href="/sign-up">
              <button className="btn btn-primary btn-sm">Get Started</button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-base-100 to-secondary/5">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="container mx-auto px-4 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <div className="space-y-8 lg:pr-8">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
                  <Zap className="w-4 h-4" />
                  Free Forever Platform
                </div>

                <h1 className="text-4xl lg:text-6xl font-bold text-base-content leading-tight">
                  Connect. Ship.
                  <span className="text-primary block">Deliver.</span>
                </h1>

                <p className="text-xl text-base-content/70 leading-relaxed">
                  South Africa's leading freight exchange platform. Connect
                  transporters with clients for seamless, efficient logistics
                  solutions.
                </p>

                {/* Value Proposition */}
                <div className="bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 rounded-xl p-6">
                  <h3 className="font-semibold text-primary mb-2">
                    Our Promise
                  </h3>
                  <p className="text-base-content/80 italic">
                    "Fast, instantaneous & reliable logistics solutions ensuring
                    you have complete peace of mind"
                  </p>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/sign-up">
                  <button className="btn btn-primary btn-lg gap-2 group">
                    Start Free Today
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </Link>
                <button className="btn btn-outline btn-lg">Watch Demo</button>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap items-center gap-6 pt-4">
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-4 h-4 fill-warning text-warning"
                      />
                    ))}
                  </div>
                  <span className="text-sm text-base-content/70">
                    4.9/5 from 200+ reviews
                  </span>
                </div>
                <div className="text-sm text-base-content/70">
                  500+ Active Transporters
                </div>
              </div>
            </div>

            {/* Right Content - Hero Graphic */}
            <div className="relative">
              {/* Main Dashboard Mockup */}
              <div className="relative bg-base-100 rounded-3xl shadow-2xl border border-base-200 overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-primary to-secondary p-4">
                  <div className="flex items-center justify-between text-white">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                        <Truck className="w-4 h-4" />
                      </div>
                      <span className="font-semibold">Fleet Exchange</span>
                    </div>
                    <div className="flex gap-2">
                      <div className="w-3 h-3 bg-white/30 rounded-full"></div>
                      <div className="w-3 h-3 bg-white/30 rounded-full"></div>
                      <div className="w-3 h-3 bg-white/30 rounded-full"></div>
                    </div>
                  </div>
                </div>

                {/* Dashboard Content */}
                <div className="p-6 space-y-6">
                  {/* Quick Stats */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-success/10 rounded-xl">
                      <div className="text-2xl font-bold text-success">42</div>
                      <div className="text-xs text-base-content/60">
                        Active Trips
                      </div>
                    </div>
                    <div className="text-center p-4 bg-primary/10 rounded-xl">
                      <div className="text-2xl font-bold text-primary">
                        R89k
                      </div>
                      <div className="text-xs text-base-content/60">
                        Revenue
                      </div>
                    </div>
                    <div className="text-center p-4 bg-warning/10 rounded-xl">
                      <div className="text-2xl font-bold text-warning">18</div>
                      <div className="text-xs text-base-content/60">
                        Fleet Size
                      </div>
                    </div>
                  </div>

                  {/* Live Trip Updates */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm flex items-center gap-2">
                      <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                      Live Trip Updates
                    </h4>

                    {[
                      {
                        route: "CPT → JHB",
                        status: "In Transit",
                        time: "2h ago",
                        progress: "60%",
                      },
                      {
                        route: "DBN → PLZ",
                        status: "Delivered",
                        time: "4h ago",
                        progress: "100%",
                      },
                      {
                        route: "PE → BFN",
                        status: "Loading",
                        time: "6h ago",
                        progress: "20%",
                      },
                    ].map((trip, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-3 bg-base-50 rounded-lg border"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                            <Truck className="w-4 h-4 text-primary" />
                          </div>
                          <div>
                            <div className="font-medium text-sm">
                              {trip.route}
                            </div>
                            <div className="text-xs text-base-content/60">
                              {trip.time}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div
                            className={`badge badge-sm ${
                              trip.status === "Delivered"
                                ? "badge-success"
                                : trip.status === "In Transit"
                                  ? "badge-warning"
                                  : "badge-info"
                            }`}
                          >
                            {trip.status}
                          </div>
                          <div className="text-xs text-base-content/60 mt-1">
                            {trip.progress}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-6 -right-6 bg-success text-white rounded-2xl p-4 shadow-lg animate-bounce">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium text-sm">Trip Completed!</span>
                </div>
              </div>

              <div className="absolute -bottom-6 -left-6 bg-primary text-white rounded-2xl p-4 shadow-lg">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  <span className="font-medium text-sm">
                    Real-time Tracking
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-base-50">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-base-content">
              Why Choose Fleet Exchange?
            </h2>
            <p className="text-xl text-base-content/70 max-w-2xl mx-auto">
              Built specifically for the South African logistics industry
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Zap className="w-8 h-8" />,
                title: "Lightning Fast",
                description:
                  "Instant trip matching and real-time updates. Book and track shipments in seconds.",
                color: "warning",
              },
              {
                icon: <Shield className="w-8 h-8" />,
                title: "Secure & Reliable",
                description:
                  "Bank-grade security with verified transporters and secure payment processing.",
                color: "success",
              },
              {
                icon: <Users className="w-8 h-8" />,
                title: "Trusted Network",
                description:
                  "Join 500+ verified transporters and clients across South Africa.",
                color: "primary",
              },
            ].map((feature, i) => (
              <div key={i} className="group">
                <div className="bg-base-100 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:-translate-y-2 border border-base-200">
                  <div
                    className={`w-16 h-16 bg-${feature.color}/10 rounded-2xl flex items-center justify-center mb-6 text-${feature.color}`}
                  >
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-base-content">
                    {feature.title}
                  </h3>
                  <p className="text-base-content/70 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-base-100">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-base-content">
              How It Works
            </h2>
            <p className="text-xl text-base-content/70">
              Get started in 3 simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                step: "01",
                title: "Sign Up & Verify",
                description:
                  "Create your account and get verified in under 24 hours",
              },
              {
                step: "02",
                title: "Post or Find Trips",
                description:
                  "Post your cargo or browse available transport services",
              },
              {
                step: "03",
                title: "Track & Deliver",
                description:
                  "Monitor your shipment in real-time until delivery",
              },
            ].map((step, i) => (
              <div key={i} className="text-center relative">
                {i < 2 && (
                  <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-primary to-transparent"></div>
                )}
                <div className="w-16 h-16 bg-primary text-white rounded-2xl flex items-center justify-center mx-auto mb-6 text-xl font-bold">
                  {step.step}
                </div>
                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                <p className="text-base-content/70">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-base-100">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-base-content">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-base-content/70 max-w-2xl mx-auto">
              No hidden fees, no monthly subscriptions. Pay only when you
              succeed.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Free Plan */}
            <div className="bg-base-100 rounded-2xl p-8 shadow-lg border border-base-200">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-base-content mb-2">
                  Free Forever
                </h3>
                <div className="text-4xl font-bold text-primary mb-4">R0</div>
                <p className="text-base-content/70">
                  Perfect for getting started
                </p>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-success" />
                  <span className="text-base-content/80">Platform access</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-success" />
                  <span className="text-base-content/80">Basic matching</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-success" />
                  <span className="text-base-content/80">Standard support</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-success" />
                  <span className="text-base-content/80">Basic analytics</span>
                </div>
              </div>

              <Link href="/sign-up">
                <button className="btn btn-outline w-full">
                  Get Started Free
                </button>
              </Link>
            </div>

            {/* Commission Plan - Popular */}
            <div className="bg-gradient-to-b from-primary/5 to-secondary/5 rounded-2xl p-8 shadow-xl border-2 border-primary relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-primary text-white px-4 py-2 rounded-full text-sm font-medium">
                  Most Popular
                </span>
              </div>

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-base-content mb-2">
                  Success Commission
                </h3>
                <div className="text-4xl font-bold text-primary mb-4">5%</div>
                <p className="text-base-content/70">
                  Only pay when you complete trips
                </p>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-success" />
                  <span className="text-base-content/80">
                    Everything in Free
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-success" />
                  <span className="text-base-content/80">
                    Priority matching
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-success" />
                  <span className="text-base-content/80">
                    Real-time tracking
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-success" />
                  <span className="text-base-content/80">
                    Payment protection
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-success" />
                  <span className="text-base-content/80">
                    Advanced analytics
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-success" />
                  <span className="text-base-content/80">Priority support</span>
                </div>
              </div>

              <Link href="/sign-up">
                <button className="btn btn-primary w-full">
                  Start Earning
                </button>
              </Link>
            </div>

            {/* Enterprise Plan */}
            <div className="bg-base-100 rounded-2xl p-8 shadow-lg border border-base-200">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-base-content mb-2">
                  Enterprise
                </h3>
                <div className="text-4xl font-bold text-secondary mb-4">
                  Custom
                </div>
                <p className="text-base-content/70">
                  For large fleets & businesses
                </p>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-success" />
                  <span className="text-base-content/80">
                    Everything in Commission
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-success" />
                  <span className="text-base-content/80">
                    Custom integration
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-success" />
                  <span className="text-base-content/80">
                    Dedicated support
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-success" />
                  <span className="text-base-content/80">Custom reporting</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-success" />
                  <span className="text-base-content/80">API access</span>
                </div>
              </div>

              <button className="btn btn-outline w-full">Contact Sales</button>
            </div>
          </div>

          {/* Pricing FAQ */}
          <div className="mt-16 text-center">
            <div className="bg-info/10 border border-info/20 rounded-xl p-6 max-w-3xl mx-auto">
              <h4 className="font-semibold text-info mb-3">
                💡 How Commission Works
              </h4>
              <p className="text-base-content/80 text-sm">
                Our 5% commission is only charged on successful trip
                completions. No upfront costs, no monthly fees, no hidden
                charges. You only pay when you earn. Commission includes payment
                processing, insurance coverage, and platform maintenance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-base-100">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-base-content">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-base-content/70 max-w-2xl mx-auto">
              Everything you need to know about Fleet Exchange
            </p>
          </div>
          <div className="max-w-3xl mx-auto space-y-6">
            {[
              {
                q: "How much does it cost to use Fleet Exchange?",
                a: "Fleet Exchange is free to join and use. We only charge a 5% commission on successful trip completions. There are no monthly fees or hidden charges.",
              },
              {
                q: "Who can join Fleet Exchange?",
                a: "Any verified transporter or business looking to move cargo in South Africa can join. We verify all users for safety and trust.",
              },
              {
                q: "How do I get paid as a transporter?",
                a: "Payments are processed securely through our platform. Once a trip is completed and confirmed, funds are released to your account.",
              },
              {
                q: "Is my cargo insured?",
                a: "Yes, all shipments booked through Fleet Exchange include basic insurance. For high-value cargo, additional coverage can be arranged.",
              },
              {
                q: "How do I track my shipment?",
                a: "You can track your shipment in real-time from your dashboard, with live updates and notifications at every stage.",
              },
              {
                q: "How do I contact support?",
                a: "You can reach our support team 24/7 via email at support@fleetexchange.co.za or call us at +27 (0) 83 784 0895.",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="bg-base-50 border border-base-200 rounded-xl p-6 shadow-sm"
              >
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary mt-1" />
                  <div>
                    <h4 className="font-semibold text-base-content mb-2">
                      {item.q}
                    </h4>
                    <p className="text-base-content/70">{item.a}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section className="py-20 bg-base-50">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-base-content">
              About Fleet Exchange
            </h2>
            <p className="text-xl text-base-content/70 max-w-2xl mx-auto">
              Transforming South African logistics through technology and trust
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-16 items-center mb-16">
            {/* Left Content */}
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-base-content">
                  Our Story
                </h3>
                <p className="text-base-content/80 leading-relaxed">
                  Founded in 2024, Fleet Exchange was born from a simple
                  observation: South Africa's logistics industry needed a
                  modern, efficient way to connect transporters with clients.
                  Too many trucks were running empty, while businesses struggled
                  to find reliable transport.
                </p>
                <p className="text-base-content/80 leading-relaxed">
                  We built Fleet Exchange to solve this problem, creating a
                  platform that makes freight booking as easy as ordering a
                  meal. Our technology connects the right cargo with the right
                  transport, at the right time.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="bg-base-100 rounded-xl p-6 text-center shadow-lg">
                  <div className="text-3xl font-bold text-primary mb-2">
                    2024
                  </div>
                  <div className="text-sm text-base-content/70">Founded</div>
                </div>
                <div className="bg-base-100 rounded-xl p-6 text-center shadow-lg">
                  <div className="text-3xl font-bold text-success mb-2">
                    500+
                  </div>
                  <div className="text-sm text-base-content/70">
                    Active Users
                  </div>
                </div>
              </div>
            </div>

            {/* Right Content - Values */}
            <div className="space-y-8">
              <div className="grid gap-6">
                {[
                  {
                    icon: <Target className="w-6 h-6" />,
                    title: "Mission",
                    description:
                      "To make freight logistics accessible, efficient, and transparent for every business in South Africa.",
                    color: "primary",
                  },
                  {
                    icon: <Heart className="w-6 h-6" />,
                    title: "Values",
                    description:
                      "Trust, transparency, and reliability form the foundation of everything we do.",
                    color: "success",
                  },
                  {
                    icon: <TrendingUp className="w-6 h-6" />,
                    title: "Vision",
                    description:
                      "To become Africa's leading digital logistics ecosystem, connecting every mile of cargo movement.",
                    color: "warning",
                  },
                ].map((value, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-4 p-6 bg-base-100 rounded-xl shadow-lg"
                  >
                    <div
                      className={`w-12 h-12 bg-${value.color}/10 rounded-xl flex items-center justify-center text-${value.color} flex-shrink-0`}
                    >
                      {value.icon}
                    </div>
                    <div>
                      <h4 className="font-semibold text-base-content mb-2">
                        {value.title}
                      </h4>
                      <p className="text-base-content/70 text-sm leading-relaxed">
                        {value.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Team Section */}
          <div className="text-center">
            <h3 className="text-2xl font-bold text-base-content mb-8">
              Built by Logistics Experts
            </h3>
            <div className="bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 rounded-2xl p-8 max-w-4xl mx-auto">
              <div className="grid md:grid-cols-3 gap-8 text-center">
                <div className="space-y-4">
                  <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
                    <Award className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-base-content">
                      Industry Experience
                    </h4>
                    <p className="text-sm text-base-content/70">
                      20+ years combined logistics experience
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="w-16 h-16 bg-success/20 rounded-full flex items-center justify-center mx-auto">
                    <Shield className="w-8 h-8 text-success" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-base-content">
                      Local Focus
                    </h4>
                    <p className="text-sm text-base-content/70">
                      Built specifically for South African needs
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="w-16 h-16 bg-warning/20 rounded-full flex items-center justify-center mx-auto">
                    <Users className="w-8 h-8 text-warning" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-base-content">
                      Community First
                    </h4>
                    <p className="text-sm text-base-content/70">
                      Supporting transporters and businesses
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-secondary text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { number: "500+", label: "Active Transporters" },
              { number: "10k+", label: "Trips Completed" },
              { number: "R50M+", label: "Cargo Value Moved" },
              { number: "99.8%", label: "On-Time Delivery" },
            ].map((stat, i) => (
              <div key={i} className="space-y-2">
                <div className="text-3xl lg:text-4xl font-bold">
                  {stat.number}
                </div>
                <div className="text-white/80">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-base-50">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto space-y-8">
            <h2 className="text-3xl lg:text-4xl font-bold text-base-content">
              Ready to Transform Your Logistics?
            </h2>
            <p className="text-xl text-base-content/70">
              Join thousands of transporters and clients who trust Fleet
              Exchange
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/sign-up">
                <button className="btn btn-primary btn-lg gap-2">
                  Start Free Account
                  <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
              <button className="btn btn-outline btn-lg">Schedule Demo</button>
            </div>

            <div className="flex items-center justify-center gap-6 text-sm text-base-content/60 pt-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-success" />
                <span>Free Forever</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-success" />
                <span>No Setup Fees</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-success" />
                <span>24/7 Support</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
