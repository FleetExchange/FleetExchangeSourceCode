import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import logo from "@/images/logo.png";

function Header() {
  return (
    <div>
      <Link href="/" className="font-bold shrink-0 fixed top-4 left-12"></Link>
    </div>
  );
}

export default Header;
