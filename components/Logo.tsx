// components/Logo.tsx
import Image from "next/image";
import Link from "next/link";

interface LogoProps {
  variant?: "full" | "icon";
  size?: "sm" | "md" | "lg";
  href?: string;
  className?: string;
}

const Logo = ({
  variant = "full",
  size = "md",
  href = "/",
  className = "",
}: LogoProps) => {
  const sizeClasses = {
    sm: "h-6 w-auto",
    md: "h-8 w-auto",
    lg: "h-12 w-auto",
  };

  const logoSrc = {
    full: "/images/logos/FleetExchangeLogo_Light.png",
    icon: "/images/logos/FleetExchangeIcon.png",
  };

  const LogoImage = () => (
    <Image
      src={logoSrc[variant]}
      alt="FleetExchange"
      width={120}
      height={32}
      className={`${sizeClasses[size]} ${className}`}
      priority
    />
  );

  if (href) {
    return (
      <Link href={href} className="flex items-center">
        <LogoImage />
      </Link>
    );
  }

  return <LogoImage />;
};

export default Logo;
