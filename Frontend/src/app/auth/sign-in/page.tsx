import Signin from "@/components/Auth/Signin";
import SigninCarousel from "@/components/Auth/SigninCarousel";
import Image from "next/image";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Masuk KOPMA",
  description: "Masuk ke akun KOPMA Anda",
};

export default function SignIn() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4 dark:bg-[#020D1A]">
      {/* Main Container */}
      <div className="flex w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-boxdark">
        {/* Left Side - Login Form */}
        <div className="w-full p-8 sm:p-12 md:w-1/2 md:p-16">
          {/* Logo */}
          <div className="mb-8">
            <Image
              src="/new-logo.PNG"
              alt="Logo KOPMA"
              width={64}
              height={64}
              className="h-auto w-auto"
              priority
            />
          </div>

          {/* Title */}
          <div className="mb-8">
            <h1 className="mb-2 text-2xl font-bold text-dark dark:text-white">
              Masuk ke Akun Anda
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Selamat datang kembali! Silakan pilih metode masuk:
            </p>
          </div>

          {/* Sign In Form */}
          <Signin />
        </div>

        {/* Right Side - Carousel Branding (Desktop only) */}
        <SigninCarousel />
      </div>
    </div>
  );
}
