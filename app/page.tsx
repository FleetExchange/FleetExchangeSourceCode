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
        <div className="container mx-auto flex items-center justify-between">
          <div className="navbar-start flex items-center gap-2">
            <Logo variant="icon" size="lg" href="/" />
            <span className="text-xl font-bold text-secondary hidden sm:inline">
              FleetExchange
            </span>
          </div>
          <div className="navbar-end flex items-center gap-3">
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
        <div className="container mx-auto px-4 py-8 lg:py-16">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 items-center lg:justify-between">
            {/* Left Content */}
            <div className="flex-1 space-y-5 lg:pr-8 z-10 lg:max-w-2xl">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
                <Zap className="w-4 h-4" />
                Free to Join
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-5xl xl:text-6xl font-extrabold text-base-content leading-tight">
                <span className="block">Every Truck Full</span>
                <span className="text-primary block">
                  Every Trip Affordable
                </span>
              </h1>
              <p className="text-lg lg:text-xl text-base-content/70 leading-relaxed">
                South Africa's most innovative logistics solution. The future of
                connecting transporters with clients through smart technology.
              </p>
              {/* Value Proposition */}
              <div className="bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 rounded-xl p-4">
                <h3 className="font-semibold text-primary mb-2">Our Promise</h3>
                <p className="text-base-content/80 italic">
                  "Fast, Instantaneous & Reliable logistics solutions ensuring
                  you have complete peace of mind"
                </p>
              </div>
              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/sign-up">
                  <button className="btn btn-primary btn-lg gap-2 group">
                    Start Free Today
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </Link>
                <a
                  href="tel:+27837840895"
                  className="btn btn-outline btn-lg flex items-center justify-center gap-2"
                >
                  <Phone className="w-5 h-5" />
                  Schedule a Demo
                </a>
              </div>
              {/* Social Proof */}
              <div className="flex flex-wrap items-center gap-6 pt-2">
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
                  500+ Verified Transporters
                </div>
              </div>
            </div>

            {/* Right Content - Enhanced Hero Mockup */}
            <div className="relative flex items-center justify-center flex-shrink-0">
              {/* Background decorative elements */}
              <div className="absolute inset-0 -z-10">
                {/* Primary glow - responsive sizing */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] lg:w-[600px] lg:h-[600px] bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full blur-3xl opacity-60" />

                {/* Floating elements */}
                <div className="absolute top-10 right-4 sm:top-20 sm:right-20 w-8 h-8 sm:w-16 sm:h-16 bg-primary/10 rounded-full animate-float hidden sm:block" />
                <div className="absolute bottom-16 left-2 sm:bottom-32 sm:left-8 w-6 h-6 sm:w-12 sm:h-12 bg-secondary/10 rounded-full animate-float animation-delay-1000 hidden sm:block" />
                <div className="absolute top-1/3 right-2 sm:right-8 w-4 h-4 sm:w-8 sm:h-8 bg-accent/10 rounded-full animate-float animation-delay-2000 hidden sm:block" />
              </div>

              {/* Main mockup container - fits to image size */}
              <div className="relative inline-block">
                {/* Enhanced shadow and glow effect - sized to image */}
                <div className="absolute -inset-4 sm:-inset-6 lg:-inset-8 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-2xl sm:rounded-3xl blur-xl sm:blur-2xl" />

                {/* Mockup image with improved sizing */}
                <div className="relative">
                  <Image
                    src="/mockup.png"
                    alt="FleetExchange Dashboard Interface"
                    width={600}
                    height={430}
                    className="w-full h-auto min-w-[280px] max-w-[95vw] sm:max-w-[400px] lg:max-w-[480px] xl:max-w-[520px] object-contain rounded-xl sm:rounded-2xl shadow-xl sm:shadow-2xl transform hover:scale-105 transition-transform duration-700 ease-out"
                    priority
                  />

                  {/* Subtle overlay for depth */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent rounded-xl sm:rounded-2xl pointer-events-none" />

                  {/* Animated border glow */}
                  <div className="absolute inset-0 rounded-xl sm:rounded-2xl ring-1 ring-primary/20 animate-pulse" />
                </div>

                {/* Floating UI elements for added realism - responsive positioning */}
                <div className="absolute -top-2 -right-2 sm:-top-4 sm:-right-4 bg-success/90 text-success-content px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs font-semibold shadow-lg ">
                  Instant Booking
                </div>

                <div className="absolute -bottom-2 -left-2 sm:-bottom-4 sm:-left-4 bg-primary/90 text-primary-content px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs font-semibold shadow-lg ">
                  Secure Payments
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
                  "Instant trip matching and real-time updates. List a route or book a trip all within seconds.",
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
              Get started in 4 simple steps
            </p>
          </div>
          <div className="grid md:grid-cols-4 gap-8 max-w-6xl mx-auto">
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
                  "Post your route or browse available transport services",
              },
              {
                step: "03",
                title: "Track & Deliver",
                description: "Monitor your shipment with real-time updates",
              },
              {
                step: "04",
                title: "Funds Managed Securely",
                description:
                  "Clients pay into escrow when booking & transporters get paid on verified delivery",
              },
            ].map((step, i) => (
              <div
                key={i}
                className="bg-base-50 rounded-2xl shadow-lg p-8 flex flex-col items-center hover:-translate-y-2 transition-transform duration-300 border border-base-200"
              >
                <div className="w-16 h-16 bg-primary text-white rounded-2xl flex items-center justify-center mb-6 text-xl font-bold shadow">
                  {step.step}
                </div>
                <h3 className="text-lg font-bold mb-2 text-base-content">
                  {step.title}
                </h3>
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
              No hidden fees. No subscriptions. Just pay when you succeed.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Client Pricing */}
            <div className="bg-base-50 rounded-2xl p-8 shadow-lg border border-base-200 flex flex-col items-center">
              <h3 className="text-2xl font-bold text-base-content mb-2">
                For Clients
              </h3>
              <div className="text-4xl font-bold text-primary mb-4">
                5% per Booking
              </div>
              <p className="text-base-content/70 mb-6 text-center">
                Book trucks instantly, track shipments, and manage logistics.
              </p>
              <ul className="space-y-3 mb-8 w-full">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-success" />
                  <span>Transporter fee + 5%</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-success" />
                  <span>Instant trip booking</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-success" />
                  <span>Escrow payment protection</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-success" />
                  <span>Real-time updates</span>
                </li>
              </ul>
              <Link href="/sign-up">
                <button className="btn btn-primary w-full">Book a Trip</button>
              </Link>
            </div>
            {/* Transporter Pricing */}
            <div className="bg-base-50 rounded-2xl p-8 shadow-lg border border-base-200 flex flex-col items-center">
              <h3 className="text-2xl font-bold text-base-content mb-2">
                For Transporters
              </h3>
              <div className="text-4xl font-bold text-primary mb-4">
                5% per Trip
              </div>
              <p className="text-base-content/70 mb-6 text-center">
                Only pay a commission when you successfully complete a trip. No
                monthly fees, no listing fees.
              </p>
              <ul className="space-y-3 mb-8 w-full">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-success" />
                  <span>Free to list routes</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-success" />
                  <span>Commission paid only on completed trips</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-success" />
                  <span>Fast payouts on verified delivery</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-success" />
                  <span>Guaranteed payouts</span>
                </li>
              </ul>
              <Link href="/sign-up">
                <button className="btn btn-primary w-full">
                  Start Earning
                </button>
              </Link>
            </div>
          </div>
          {/* Pricing Note */}
          <div className="mt-12 text-center">
            <div className="bg-info/10 border border-info/20 rounded-xl p-6 max-w-2xl mx-auto">
              <h4 className="font-semibold text-info mb-2">
                How commission works
              </h4>
              <p className="text-base-content/80 text-sm">
                We only benefit when you do, commission is only paid if there is
                a successful delivery. In the case of refunds or cancellation
                you will be refunded the full amount subject to our terms and
                conditions.
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
                q: "What exactly gets listed, cargo or trucks?",
                a: "Fleet Exchange is a marketplace for transporters to list their routes. It can be an empty-leg you are trying to fill or a popular route that you are wishing to capitalise on. Clients then book a suitable truck going where they need thier cargo to go.",
              },
              {
                q: "Who can join Fleet Exchange?",
                a: "Any verified transporter or business looking to move cargo or fill thier trucks in South Africa can join. We verify all users for safety and trust.",
              },
              {
                q: "How do I get paid as a transporter?",
                a: "Payments are processed securely through our platform. Once a trip is completed and confirmed, funds are released to your account.",
              },
              {
                q: "Is my cargo insured?",
                a: "Yes, all transporters listed on Fleet Exchange are verified and have 'Goods in Transit' insurance. Our platform is merely a marketplace and has no involvement in the physical shipping process.",
              },
              {
                q: "How do I track my shipment?",
                a: "You can track your shipment on the dashboard with status updates, or contact your transporter directly through the platform.",
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
                  Founded in 2025, Fleet Exchange was born from a simple
                  observation: South Africa's logistics industry needed a
                  modern, efficient way to connect transporters with clients.
                  Too many trucks were running empty, while businesses struggled
                  to find easy to book & reliable transport.
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
                    2025
                  </div>
                  <div className="text-sm text-base-content/70">Founded</div>
                </div>
                <div className="bg-base-100 rounded-xl p-6 text-center shadow-lg">
                  <div className="text-3xl font-bold text-success mb-2">9</div>
                  <div className="text-sm text-base-content/70">
                    Provinces Covered
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
                      "To eliminate trucks running empty while simultaneously providing affordable transport for businesses through smart technology.",
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
                      "Revolutionising logistics to be instant & accessible anywhere, breaking from the norm of archaic methods.",
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
              Where Technology Meets Logistics
            </h3>
            <div className="bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 rounded-2xl p-8 max-w-4xl mx-auto">
              <div className="space-y-6">
                <p className="text-base-content/80 text-lg">
                  Fleet Exchange was founded by a passionate technology expert
                  with a vision to revolutionize logistics in South Africa. Our
                  platform is built on cutting-edge tech, with deep insights
                  from experienced logistics advisors.
                </p>
                <div className="grid md:grid-cols-2 gap-8 mt-8">
                  <div className="space-y-2">
                    <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
                      <Award className="w-8 h-8 text-primary" />
                    </div>
                    <h4 className="font-semibold text-base-content">
                      Tech-Driven Innovation
                    </h4>
                    <p className="text-sm text-base-content/70">
                      Built by a software engineer with a passion for solving
                      real-world problems through technology.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="w-16 h-16 bg-success/20 rounded-full flex items-center justify-center mx-auto">
                      <Users className="w-8 h-8 text-success" />
                    </div>
                    <h4 className="font-semibold text-base-content">
                      Logistics Advisors
                    </h4>
                    <p className="text-sm text-base-content/70">
                      Supported by industry advisors who ensure our solutions
                      are practical, reliable, and relevant for the logistics
                      sector.
                    </p>
                  </div>
                </div>
                <div className="mt-8">
                  <p className="text-base-content/70 text-sm">
                    This intersection of technology and logistics expertise is
                    what makes Fleet Exchange unique, driving innovation and
                    trust for our users.
                  </p>
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
              <a
                href="tel:+27837840895"
                className="btn btn-outline btn-lg flex items-center justify-center gap-2"
              >
                <Phone className="w-5 h-5" />
                Schedule a Demo
              </a>
            </div>

            <div className="flex items-center justify-center gap-6 text-sm text-base-content/60 pt-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-success" />
                <span>No Hidden Fees</span>
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
