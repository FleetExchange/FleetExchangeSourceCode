import Link from "next/link";

export default function Home() {
  return (
    <div>
      <Link href="/sign-in">
        <button>Sign In</button>
      </Link>
      <Link href="/sign-up">
        <button>Sign Up</button>
      </Link>
    </div>
  );
}
