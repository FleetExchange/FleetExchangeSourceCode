import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import logo from "@/images/logo.png";

function Header() {
  return (
    <div>
      <Link href="/" className="font-bold shrink-0 fixed top-4 left-12">
        <Image
          src={logo}
          alt="logo"
          width={100}
          height={100}
          className="w-24 lg:w-28"
        />
      </Link>
    </div>
  );
}

export default Header;
