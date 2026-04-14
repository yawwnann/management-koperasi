"use client";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { ProtectedRoute } from "@/components/protected-route";
import { useState, useEffect } from "react";
import { savingsApi, withdrawalsApi } from "@/lib/api";
import { formatCurrency } from "@/lib/api-helpers";

export default function WithdrawalPage() {
  return (
    <ProtectedRoute allowedRoles={["ANGGOTA"]}>
      <WithdrawalContent />
    </ProtectedRoute>
  );
}

function WithdrawalContent() {
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(false);
  const [fetchingBalance, setFetchingBalance] = useState(true);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    loadBalance();
  }, []);

  async function loadBalance() {
    setFetchingBalance(true);
    try {
      const response = await savingsApi.getMySavings();
      if (response.success) {
        setBalance(Number(response.data.total) || 0);
      }
    } catch (err) {
      console.error("Failed to load balance:", err);
    } finally {
      setFetchingBalance(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    const numAmount = parseInt(amount.replace(/\./g, ""));
    if (isNaN(numAmount) || numAmount <= 0) {
      setMessage({ type: "error", text: "Jumlah tidak valid" });
      return;
    }

    if (numAmount > balance) {
      setMessage({ type: "error", text: "Saldo tidak mencukupi" });
      return;
    }

    if (!reason.trim()) {
      setMessage({ type: "error", text: "Alasan penarikan harus diisi" });
      return;
    }

    setLoading(true);
    try {
      const response = await withdrawalsApi.create({ nominal: numAmount, reason: reason.trim() });
      if (response.success) {
        setMessage({ type: "success", text: "Permintaan penarikan berhasil diajukan! Menunggu konfirmasi admin." });
        setAmount("");
        setReason("");
        loadBalance();
      } else {
        setMessage({ type: "error", text: "Gagal mengajukan penarikan" });
      }
    } catch (err: any) {
      const errorMsg = err?.message || "Terjadi kesalahan saat mengajukan penarikan";
      setMessage({ type: "error", text: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  const formatInputNumber = (value: string) => {
    return value.replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatInputNumber(e.target.value);
    setAmount(formatted);
  };

  const numAmount = parseInt(amount.replace(/\./g, "")) || 0;
  const exceedsBalance = numAmount > balance;
  const availableBalance = balance - numAmount;

  return (
    <div className="mx-auto max-w-4xl">
      {/* Header Section */}
      <div className="mb-6">
        <Breadcrumb pageName="Request Penarikan" />
      </div>

      {/* Balance Card */}
      <div className="mb-6 rounded-2xl border border-stroke bg-gradient-to-br from-primary to-primary/80 p-6 shadow-default dark:border-strokedark">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/20 text-white">
              <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-white/80">Saldo Tersedia</p>
              {fetchingBalance ? (
                <div className="mt-2 h-8 w-40 animate-pulse rounded bg-white/20" />
              ) : (
                <p className="mt-1 text-3xl font-bold text-white">{formatCurrency(balance)}</p>
              )}
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-white/80">Sisa Setelah Penarikan</p>
            <p className="mt-1 text-xl font-semibold text-white">
              {formatCurrency(Math.max(0, availableBalance))}
            </p>
          </div>
        </div>
      </div>

      {/* Form Card */}
      <div className="rounded-2xl border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
        {/* Card Header */}
        <div className="mb-6 border-b border-stroke pb-4 dark:border-strokedark">
          <h3 className="text-lg font-semibold text-dark dark:text-white">Form Penarikan</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Isi formulir di bawah untuk mengajukan penarikan simpanan.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Message */}
          {message && (
            <div
              className={`mb-6 rounded-lg border p-4 ${
                message.type === "success"
                  ? "border-green-300 bg-green-50 text-green-700 dark:border-green-600 dark:bg-green-900/20 dark:text-green-400"
                  : "border-red-300 bg-red-50 text-red-700 dark:border-red-600 dark:bg-red-900/20 dark:text-red-400"
              }`}
            >
              {message.text}
            </div>
          )}

          {/* Amount */}
          <div className="mb-5">
            <label className="mb-2 block text-sm font-medium text-dark dark:text-white" htmlFor="amount">
              Jumlah Penarikan (Rp) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">Rp</span>
              <input
                id="amount"
                type="text"
                inputMode="numeric"
                value={amount}
                onChange={handleAmountChange}
                placeholder="0"
                className="w-full rounded-lg border border-stroke bg-transparent py-3 pl-12 pr-4 text-dark outline-none transition focus:border-primary dark:border-strokedark dark:text-white dark:focus:border-primary"
                disabled={loading}
              />
            </div>
            {exceedsBalance && amount && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                ⚠️ Jumlah melebihi saldo tersedia
              </p>
            )}
          </div>

          {/* Reason */}
          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium text-dark dark:text-white" htmlFor="reason">
              Alasan Penarikan <span className="text-red-500">*</span>
            </label>
            <textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Jelaskan alasan penarikan Anda..."
              rows={4}
              className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 text-dark outline-none transition focus:border-primary dark:border-strokedark dark:text-white dark:focus:border-primary"
              disabled={loading}
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                setAmount("");
                setReason("");
                setMessage(null);
              }}
              disabled={loading}
              className="rounded-lg border border-stroke bg-white px-6 py-3 font-medium text-gray-700 transition hover:bg-gray-50 dark:border-strokedark dark:bg-boxdark dark:text-gray-300 dark:hover:bg-gray-800"
            >
              Reset
            </button>
            <button
              type="submit"
              disabled={loading || exceedsBalance || numAmount === 0 || !reason.trim()}
              className={`inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 font-medium text-white transition ${
                loading || exceedsBalance || numAmount === 0 || !reason.trim()
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
                  Memproses...
                </>
              ) : (
                "Ajukan Penarikan"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
