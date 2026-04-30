"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

const slides = [
  {
    title: "Manajemen Keuangan Transparan",
    desc: "Sistem cerdas untuk mengelola segala aspek finansial KOPMA dengan akurasi dan keterbukaan penuh.",
    image: "/manajemen-keuangan.png",
  },
  {
    title: "Akses Simpanan & Penarikan",
    desc: "Pantau saldo, ajukan penarikan, dan monitor transaksi harian anggota hanya dari satu dashboard interaktif.",
    image: "/simpan-penarikan.png",
  },
  {
    title: "Pelaporan Data Waktu Nyata",
    desc: "Dapatkan rekapitulasi data anggota dan pergerakan kas secara cepat, aman, serta terdigitalisasi rapi.",
    image: "/pelaporan-realtime.png",
  },
];

export default function SigninCarousel() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 4000);
    // Cleanup interval on unmount
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative hidden w-1/2 overflow-hidden bg-white p-12 dark:bg-boxdark md:flex md:flex-col">
      {/* Decorative Circles */}
      <div className="absolute right-0 top-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-blue-100/50 blur-3xl dark:bg-blue-900/20"></div>
      <div className="absolute bottom-0 left-0 -mb-16 -ml-16 h-64 w-64 rounded-full bg-blue-100/50 blur-3xl dark:bg-blue-900/20"></div>

      {/* Content Container with proper spacing */}
      <div className="relative z-10 flex h-full flex-col">
        {/* Image Container - Takes up most space */}
        <div className="flex flex-1 items-center justify-center py-8">
          <div className="relative h-full max-h-[400px] w-full overflow-hidden rounded-2xl">
            {slides.map((slide, idx) => (
              <div
                key={idx}
                className={`absolute inset-0 transform transition-all duration-700 ${
                  current === idx
                    ? "scale-100 opacity-100"
                    : "scale-95 opacity-0"
                }`}
              >
                <Image
                  src={slide.image}
                  alt={slide.title}
                  fill
                  className="object-contain p-8"
                  priority={idx === 0}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Text Area - Fixed height at bottom */}
        <div className="relative h-[180px] text-center">
          {slides.map((slide, idx) => (
            <div
              key={idx}
              className={`absolute inset-x-0 top-0 transform transition-all duration-700 ${
                current === idx
                  ? "pointer-events-auto translate-y-0 opacity-100"
                  : "pointer-events-none translate-y-4 opacity-0"
              }`}
            >
              <h3 className="mb-3 text-2xl font-bold tracking-wide text-blue-700 dark:text-blue-400">
                {slide.title}
              </h3>
              <p className="px-4 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                {slide.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Carousel Dots - At the very bottom */}
        <div className="flex items-center justify-center gap-3 pb-4 pt-6">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrent(idx)}
              suppressHydrationWarning
              className={`h-2.5 rounded-full transition-all duration-300 ${
                current === idx
                  ? "w-8 bg-blue-600 dark:bg-blue-500"
                  : "w-2.5 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500"
              }`}
              aria-label={`Buka slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
