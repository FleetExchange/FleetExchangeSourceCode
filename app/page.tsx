import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-base-100">
      <div className="bg-base-200 p-8 rounded-xl shadow-lg flex flex-col gap-6 max-w-md w-full">
        <h1 className="text-3xl font-bold text-primary text-center">
          Welcome to FreightConnect
        </h1>
        <p className="text-base-content text-center">
          FreightConnect helps connect transporters & clients to manage trips,
          bookings, and fleet operations efficiently. Sign in or create an
          account to start tracking your business performance and streamline
          your logistics workflow.
        </p>
        <div className="flex flex-col gap-3 mt-4">
          <Link href="/sign-in">
            <button className="btn btn-primary w-full">Sign In</button>
          </Link>
          <Link href="/sign-up">
            <button className="btn btn-secondary w-full">Sign Up</button>
          </Link>
        </div>
      </div>
    </div>
  );
}
