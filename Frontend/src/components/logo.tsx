import Image from "next/image";

export function Logo() {
  return (
    <div className="mt-4 flex items-center gap-3">
      <div className="relative w-20 flex-shrink-0">
        <Image
          src="/new-logo.PNG"
          width={64}
          height={64}
          className="object-contain"
          alt="KOPMA UAD Logo"
          role="presentation"
          quality={100}
        />
      </div>
      <div className="flex flex-col">
        <span className="text-lg font-bold leading-tight text-dark dark:text-white">
          KopmaPay
        </span>
        <span className="text-sm leading-tight text-gray-500 dark:text-gray-400">
          Koperasi Digital
        </span>
      </div>
    </div>
  );
}
