"use client";

import React from "react";
import { WithdrawalPaymentMethod } from "./WithdrawalPaymentMethodSelector";
import { Info } from "lucide-react";

interface WithdrawalMethodInfoProps {
  method: WithdrawalPaymentMethod;
}

export function WithdrawalMethodInfo({ method }: WithdrawalMethodInfoProps) {
  const getMethodInfo = () => {
    switch (method) {
      case "Cash":
        return {
          title: "Penarikan Tunai",
          description:
            "Dana akan disiapkan dalam bentuk tunai dan dapat diambil di kantor koperasi setelah persetujuan admin.",
          steps: [
            "Tunggu konfirmasi persetujuan dari admin",
            "Datang ke kantor koperasi dengan membawa KTM",
            "Ambil dana tunai di kasir",
          ],
        };
      case "Bank Transfer":
        return {
          title: "Transfer Bank",
          description:
            "Dana akan ditransfer langsung ke rekening bank Anda setelah persetujuan admin.",
          steps: [
            "Pastikan nomor rekening di profil Anda sudah benar",
            "Tunggu konfirmasi persetujuan dari admin",
            "Dana akan ditransfer dalam 1-2 hari kerja",
          ],
        };
      default:
        return null;
    }
  };

  const info = getMethodInfo();
  if (!info) return null;

  return (
    <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
      <div className="mb-3 flex items-start gap-2">
        <Info className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-400" />
        <div>
          <h4 className="font-semibold text-blue-900 dark:text-blue-300">
            {info.title}
          </h4>
          <p className="mt-1 text-sm text-blue-800 dark:text-blue-400">
            {info.description}
          </p>
        </div>
      </div>
      <div className="ml-7">
        <p className="mb-2 text-sm font-medium text-blue-900 dark:text-blue-300">
          Langkah-langkah:
        </p>
        <ol className="list-decimal space-y-1 pl-4 text-sm text-blue-800 dark:text-blue-400">
          {info.steps.map((step, index) => (
            <li key={index}>{step}</li>
          ))}
        </ol>
      </div>
    </div>
  );
}
