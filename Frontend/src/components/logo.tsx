import Image from "next/image";
import logo from "@/assets/logos/logo2.webp";

export function Logo() {
  return (
    <div className="flex items-center gap-2">
      <div className="relative h-10 w-10">
        <Image
          src={logo}
          width={50}
          height={50}
          className="object-contain"
          alt="KOPMA UAD Logo"
          role="presentation"
          quality={100}
        />
      </div>
      <div className="flex flex-col">
        <span className="text-lg font-bold text-dark dark:text-white">
          KOPMA
        </span>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          Koperasi Digital
        </span>
      </div>
    </div>
  );
}
