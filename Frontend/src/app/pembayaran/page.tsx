"use client";

import React, { useState, useCallback } from "react";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { ProtectedRoute } from "@/components/protected-route";
import { paymentsApi } from "@/lib/api";

type PaymentType = "" | "Simpanan Pokok" | "Simpanan Wajib" | "Simpanan Sukarela";

interface FormState {
  paymentType: PaymentType;
  amount: string;
  proofFile: File | null;
}

export default function PembayaranPage() {
  return (
    <ProtectedRoute allowedRoles={["ANGGOTA"]}>
      <PembayaranContent />
    </ProtectedRoute>
  );
}

function PembayaranContent() {
  const [form, setForm] = useState<FormState>({
    paymentType: "",
    amount: "",
    proofFile: null,
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const formatRupiah = (value: string): string => {
    const numeric = value.replace(/\D/g, "");
    return numeric.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setForm((prev) => ({ ...prev, amount: formatRupiah(raw) }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      if (!file.type.startsWith("image/")) {
        setMessage({ type: "error", text: "File harus berupa gambar (JPG, PNG, dll)." });
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setMessage({ type: "error", text: "Ukuran file maksimal 5MB." });
        return;
      }
      setForm((prev) => ({ ...prev, proofFile: file }));
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setMessage(null);

      if (!form.paymentType) {
        setMessage({ type: "error", text: "Silakan pilih jenis pembayaran." });
        return;
      }
      if (!form.amount || parseInt(form.amount.replace(/\./g, ""), 10) === 0) {
        setMessage({ type: "error", text: "Silakan masukkan jumlah pembayaran." });
        return;
      }
      if (!form.proofFile) {
        setMessage({ type: "error", text: "Silakan unggah bukti pembayaran." });
        return;
      }

      setLoading(true);

      try {
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(form.proofFile!);
        });
        const proofBase64 = await base64Promise;

        const payload = {
          type: form.paymentType,
          amount: parseInt(form.amount.replace(/\./g, ""), 10),
          proof: proofBase64,
          fileName: form.proofFile.name,
        };

        await paymentsApi.create(payload);

        setMessage({ type: "success", text: "Pembayaran berhasil dikirim! Menunggu konfirmasi admin." });
        setForm({ paymentType: "", amount: "", proofFile: null });
        setPreviewUrl(null);
      } catch (error: any) {
        const errorMsg = error?.message || "Terjadi kesalahan. Silakan coba lagi.";
        setMessage({ type: "error", text: errorMsg });
      } finally {
        setLoading(false);
      }
    },
    [form]
  );

  return (
    <div className="mx-auto max-w-4xl">
      <Breadcrumb pageName="Pembayaran" />

      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="border-b border-stroke px-6 py-4 dark:border-strokedark">
          <h3 className="text-lg font-semibold text-dark dark:text-white">Form Pembayaran</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Isi formulir di bawah untuk melakukan pembayaran simpanan.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {message && (
            <div
              className={`mb-6 rounded-md border p-4 ${
                message.type === "success"
                  ? "border-green-300 bg-green-50 text-green-700 dark:border-green-600 dark:bg-green-900/20 dark:text-green-400"
                  : "border-red-300 bg-red-50 text-red-700 dark:border-red-600 dark:bg-red-900/20 dark:text-red-400"
              }`}
            >
              {message.text}
            </div>
          )}

          {/* Payment Type */}
          <div className="mb-5">
            <label className="mb-2 block font-medium text-dark dark:text-white" htmlFor="paymentType">
              Jenis Pembayaran <span className="text-red-500">*</span>
            </label>
            <select
              id="paymentType"
              value={form.paymentType}
              onChange={(e) => setForm((prev) => ({ ...prev, paymentType: e.target.value as PaymentType }))}
              className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 text-dark outline-none transition focus:border-primary dark:border-strokedark dark:text-white dark:focus:border-primary"
              disabled={loading}
            >
              <option value="" disabled>
                -- Pilih Jenis Pembayaran --
              </option>
              <option value="Simpanan Pokok">Simpanan Pokok</option>
              <option value="Simpanan Wajib">Simpanan Wajib</option>
              <option value="Simpanan Sukarela">Simpanan Sukarela</option>
            </select>
          </div>

          {/* Amount */}
          <div className="mb-5">
            <label className="mb-2 block font-medium text-dark dark:text-white" htmlFor="amount">
              Jumlah Pembayaran (Rp) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">Rp</span>
              <input
                id="amount"
                type="text"
                inputMode="numeric"
                value={form.amount}
                onChange={handleAmountChange}
                placeholder="0"
                className="w-full rounded-lg border border-stroke bg-transparent py-3 pl-12 pr-4 text-dark outline-none transition focus:border-primary dark:border-strokedark dark:text-white dark:focus:border-primary"
                disabled={loading}
              />
            </div>
          </div>

          {/* File Upload */}
          <div className="mb-6">
            <label className="mb-2 block font-medium text-dark dark:text-white" htmlFor="proofFile">
              Bukti Pembayaran <span className="text-red-500">*</span>
            </label>
            <div className="rounded-lg border-2 border-dashed border-stroke p-6 text-center dark:border-strokedark">
              <input
                id="proofFile"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                disabled={loading}
              />
              <label htmlFor="proofFile" className="cursor-pointer">
                {previewUrl ? (
                  <div>
                    <img
                      src={previewUrl}
                      alt="Preview bukti pembayaran"
                      className="mx-auto mb-3 max-h-48 rounded-md object-contain"
                    />
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Klik untuk mengganti file: <span className="font-medium text-primary">{form.proofFile?.name}</span>
                    </p>
                  </div>
                ) : (
                  <div>
                    <svg
                      className="mx-auto mb-3 h-12 w-12 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Klik untuk unggah atau seret file ke sini
                    </p>
                    <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">PNG, JPG, JPEG (maks. 5MB)</p>
                  </div>
                )}
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className={`inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 font-medium text-white transition ${
                loading
                  ? "cursor-not-allowed opacity-70"
                  : "hover:bg-primary/90"
              }`}
            >
              {loading ? (
                <>
                  <svg
                    className="mr-2 h-5 w-5 animate-spin"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Mengirim...
                </>
              ) : (
                "Kirim Pembayaran"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
