"use client";

import React from "react";
import Image from "next/image";
import { PaymentMethod } from "./PaymentMethodSelector";

interface PaymentMethodInfoProps {
  method: PaymentMethod | null;
}

export function PaymentMethodInfo({ method }: PaymentMethodInfoProps) {
  if (!method) {
    return null;
  }

  if (method === "Cash") {
    return (
      <div className="rounded-lg border border-stroke bg-white p-6 dark:border-strokedark dark:bg-boxdark">
        <h3 className="mb-3 text-lg font-semibold text-dark dark:text-white">
          Instruksi Pembayaran Tunai
        </h3>
        <p className="text-body dark:text-bodydark">
          Silakan datang langsung ke kopmart untuk melakukan pembayaran tunai.
          Pastikan Anda membawa bukti pembayaran yang telah diunggah sebagai
          referensi.
        </p>
        <p className="text-body dark:text-bodydark mt-3">
          Atau hubungi kami via WhatsApp:{" "}
          <a
            href="https://wa.me/6208137938270"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-medium text-blue-600 hover:underline dark:text-blue-400"
          >
            0813-7938-270
          </a>
        </p>
      </div>
    );
  }

  if (method === "QRIS") {
    return (
      <div className="rounded-lg border border-stroke bg-white p-6 dark:border-strokedark dark:bg-boxdark">
        <h3 className="mb-3 text-lg font-semibold text-dark dark:text-white">
          Scan QRIS untuk Pembayaran
        </h3>
        <div className="flex justify-center">
          <Image
            src="/qris.jpeg"
            alt="QRIS Payment Code"
            width={300}
            height={300}
            className="rounded-lg"
          />
        </div>
      </div>
    );
  }

  if (method === "Bank Transfer") {
    return (
      <div className="rounded-lg border border-stroke bg-white p-6 dark:border-strokedark dark:bg-boxdark">
        <h3 className="mb-3 text-lg font-semibold text-dark dark:text-white">
          Informasi Transfer Bank
        </h3>
        <p className="mb-3 text-sm text-gray-500 dark:text-gray-400">
          Silakan transfer ke salah satu rekening berikut:
        </p>
        <div className="space-y-3">
          <div className="dark:bg-meta-4 rounded-md bg-gray-2 p-4">
            <p className="mb-1 text-xs font-medium text-gray-500 dark:text-gray-400">
              Bank BNI
            </p>
            <p className="text-center text-2xl font-bold text-dark dark:text-white">
              1931879879
            </p>
            <p className="mt-1 text-center text-sm text-gray-500 dark:text-gray-400">
              a.n. KOPMA UAD
            </p>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
