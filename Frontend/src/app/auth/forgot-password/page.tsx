import Image from "next/image";
import Link from "next/link";
import { ShieldAlert, ArrowLeft, MessageCircle } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Lupa Kata Sandi",
  description: "Reset kata sandi akun KOPMA Anda",
};

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4 dark:bg-[#020D1A]">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl dark:bg-boxdark sm:p-12">
        <div className="mb-8 flex justify-center">
          <Image
            src="/new-logo.PNG"
            alt="Logo KOPMA"
            width={64}
            height={64}
            className="h-auto w-auto"
            priority
          />
        </div>

        <div className="mb-6 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/30">
            <ShieldAlert className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
          </div>
        </div>

        <h1 className="mb-2 text-center text-2xl font-bold text-dark dark:text-white">
          Lupa Kata Sandi
        </h1>

        <div className="mb-6 rounded-lg border border-yellow-200 bg-yellow-50 p-5 text-center dark:border-yellow-800 dark:bg-yellow-900/20">
          <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
            Silahkan hubungi administrator untuk melakukan reset kata sandi
          </p>
        </div>

        <a
          href="https://wa.me/628137938270?text=Halo%20admin%20KOPMA%2C%20saya%20ingin%20mereset%20kata%20sandi%20akun%20saya."
          target="_blank"
          rel="noopener noreferrer"
          className="mb-3 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-green-700"
        >
          <MessageCircle className="h-4 w-4" />
          Hubungi Admin via WhatsApp
        </a>

        <Link
          href="/auth/sign-in"
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-stroke bg-white px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-strokedark dark:bg-boxdark dark:text-gray-300 dark:hover:bg-gray-800"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Halaman Masuk
        </Link>
      </div>
    </div>
  );
}
