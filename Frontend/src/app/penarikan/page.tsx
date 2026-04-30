"use client";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { ProtectedRoute } from "@/components/protected-route";
import { useState, useEffect } from "react";
import { savingsApi, withdrawalsApi } from "@/lib/api";
import { formatCurrency } from "@/lib/api-helpers";
import { AlertTriangle } from "lucide-react";
import {
  SavingTypeSelector,
  SavingType,
} from "@/components/WithdrawalMethodSelector";

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
  const [savingType, setSavingType] = useState<SavingType | null>(null);
  const [balance, setBalance] = useState(0);
  const [breakdown, setBreakdown] = useState<{
    pokok: number;
    wajib: number;
    sukarela: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchingBalance, setFetchingBalance] = useState(true);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [showWithdrawAllModal, setShowWithdrawAllModal] = useState(false);
  const [withdrawAllReason, setWithdrawAllReason] = useState("Lulus / Penarikan Semua");
  const [withdrawAllLoading, setWithdrawAllLoading] = useState(false);

  useEffect(() => {
    loadBalance();
  }, []);

  async function loadBalance() {
    setFetchingBalance(true);
    try {
      const [savingsRes, breakdownRes] = await Promise.all([
        savingsApi.getMySavings(),
        savingsApi.getSavingsBreakdown(),
      ]);

      if (savingsRes.success) {
        setBalance(Number(savingsRes.data.total) || 0);
      }

      if (breakdownRes.success) {
        setBreakdown(breakdownRes.data.breakdown);
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

    if (!savingType) {
      setMessage({ type: "error", text: "Jenis simpanan harus dipilih" });
      return;
    }

    // Check balance for specific saving type
    const availableBalance =
      breakdown?.[savingType.toLowerCase() as keyof typeof breakdown] || 0;
    if (numAmount > availableBalance) {
      setMessage({
        type: "error",
        text: `Saldo ${savingType} tidak mencukupi. Tersedia: ${formatCurrency(availableBalance)}`,
      });
      return;
    }

    if (!reason.trim()) {
      setMessage({ type: "error", text: "Alasan penarikan harus diisi" });
      return;
    }

    setLoading(true);
    try {
      const response = await withdrawalsApi.create({
        nominal: numAmount,
        reason: reason.trim(),
        savingType: savingType,
      });
      if (response.success) {
        setMessage({
          type: "success",
          text: "Permintaan penarikan berhasil diajukan! Menunggu konfirmasi admin.",
        });
        setAmount("");
        setReason("");
        setSavingType(null);
        loadBalance();
      } else {
        setMessage({ type: "error", text: "Gagal mengajukan penarikan" });
      }
    } catch (err: any) {
      const errorMsg =
        err?.message || "Terjadi kesalahan saat mengajukan penarikan";
      setMessage({ type: "error", text: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  const handleWithdrawAllSubmit = async () => {
    setMessage(null);
    if (balance <= 0) {
      setMessage({ type: "error", text: "Saldo tidak tersedia untuk ditarik" });
      setShowWithdrawAllModal(false);
      return;
    }

    setWithdrawAllLoading(true);
    try {
      const response = await withdrawalsApi.withdrawAll({
        reason: withdrawAllReason.trim() || "Lulus / Penarikan Semua",
      });
      
      if (response.success) {
        setMessage({
          type: "success",
          text: "Permintaan penarikan semua saldo berhasil diajukan! Menunggu konfirmasi admin.",
        });
        setShowWithdrawAllModal(false);
        loadBalance();
      } else {
        setMessage({ type: "error", text: "Gagal mengajukan penarikan semua saldo" });
      }
    } catch (err: any) {
      const errorMsg = err?.message || "Terjadi kesalahan saat mengajukan penarikan semua saldo";
      setMessage({ type: "error", text: errorMsg });
    } finally {
      setWithdrawAllLoading(false);
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
  const availableBalance = savingType
    ? breakdown?.[savingType.toLowerCase() as keyof typeof breakdown] || 0
    : balance;
  const exceedsBalance = numAmount > availableBalance;

  return (
    <div className="mx-auto">
      {/* Header Section */}
      <div className="mb-6">
        <Breadcrumb pageName="Request Penarikan" />
      </div>

      {/* Balance Card */}
      <div className="mb-6 rounded-2xl border border-stroke bg-gradient-to-br from-primary to-primary/80 p-6 shadow-default dark:border-strokedark">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/20 text-white">
              <svg
                className="h-7 w-7"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-white/80">
                Total Saldo Tersedia
              </p>
              {fetchingBalance ? (
                <div className="mt-2 h-8 w-40 animate-pulse rounded bg-white/20" />
              ) : (
                <p className="mt-1 text-3xl font-bold text-white">
                  {formatCurrency(balance)}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Breakdown */}
        {breakdown && !fetchingBalance && (
          <div className="grid grid-cols-3 gap-3 border-t border-white/20 pt-4">
            <div className="text-center">
              <p className="text-xs text-white/70">Pokok</p>
              <p className="mt-1 text-sm font-semibold text-white">
                {formatCurrency(breakdown.pokok)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-white/70">Wajib</p>
              <p className="mt-1 text-sm font-semibold text-white">
                {formatCurrency(breakdown.wajib)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-white/70">Sukarela</p>
              <p className="mt-1 text-sm font-semibold text-white">
                {formatCurrency(breakdown.sukarela)}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Withdraw All Card */}
      <div className="mb-6 rounded-2xl border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-dark dark:text-white">
              Opsi Penarikan Khusus (Lulus)
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Gunakan opsi ini jika Anda sudah lulus dan ingin menarik seluruh saldo simpanan (Pokok, Wajib, Sukarela) sekaligus.
            </p>
          </div>
          <button
            onClick={() => setShowWithdrawAllModal(true)}
            disabled={fetchingBalance || balance <= 0 || withdrawAllLoading}
            className={`inline-flex flex-shrink-0 items-center justify-center rounded-lg bg-orange-500 px-6 py-3 font-medium text-white transition ${
              fetchingBalance || balance <= 0 || withdrawAllLoading
                ? "cursor-not-allowed opacity-70"
                : "hover:bg-orange-600"
            }`}
          >
            Tarik Semua Saldo
          </button>
        </div>
      </div>

      {/* Withdraw All Modal */}
      {showWithdrawAllModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-boxdark">
            <h3 className="mb-4 text-xl font-bold text-dark dark:text-white">
              Konfirmasi Penarikan Semua
            </h3>
            <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
              Anda akan mengajukan penarikan untuk seluruh saldo Anda sebesar <strong className="text-dark dark:text-white">{formatCurrency(balance)}</strong>. 
              Sistem akan otomatis membuat pengajuan terpisah untuk setiap kategori simpanan Anda.
            </p>
            
            <div className="mb-5">
              <label className="mb-2 block text-sm font-medium text-dark dark:text-white">
                Alasan Penarikan
              </label>
              <input
                type="text"
                value={withdrawAllReason}
                onChange={(e) => setWithdrawAllReason(e.target.value)}
                className="w-full rounded-lg border border-stroke bg-transparent py-3 px-4 text-dark outline-none transition focus:border-primary dark:border-strokedark dark:text-white"
                placeholder="Lulus / Penarikan Semua"
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowWithdrawAllModal(false)}
                disabled={withdrawAllLoading}
                className="rounded-lg border border-stroke px-6 py-2 font-medium text-dark hover:bg-gray-50 dark:border-strokedark dark:text-white dark:hover:bg-gray-800"
              >
                Batal
              </button>
              <button
                onClick={handleWithdrawAllSubmit}
                disabled={withdrawAllLoading}
                className="inline-flex items-center justify-center rounded-lg bg-orange-500 px-6 py-2 font-medium text-white hover:bg-orange-600 disabled:opacity-70"
              >
                {withdrawAllLoading ? "Memproses..." : "Ya, Tarik Semua"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Form Card */}
      <div className="rounded-2xl border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
        {/* Card Header */}
        <div className="mb-6 border-b border-stroke pb-4 dark:border-strokedark">
          <h3 className="text-lg font-semibold text-dark dark:text-white">
            Form Penarikan
          </h3>
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
                  ? "border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                  : "border-red-300 bg-red-50 text-red-700 dark:border-red-600 dark:bg-red-900/20 dark:text-red-400"
              }`}
            >
              {message.text}
            </div>
          )}

          {/* Saving Type */}
          <div className="mb-5">
            <label className="mb-2 block text-sm font-medium text-dark dark:text-white">
              Jenis Simpanan <span className="text-red-500">*</span>
            </label>
            <SavingTypeSelector
              selectedType={savingType}
              onTypeChange={setSavingType}
              disabled={loading}
              balances={breakdown || undefined}
            />
          </div>

          {/* Amount */}
          <div className="mb-5">
            <label
              className="mb-2 block text-sm font-medium text-dark dark:text-white"
              htmlFor="amount"
            >
              Jumlah Penarikan (Rp) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                Rp
              </span>
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
            {exceedsBalance && amount && savingType && (
              <p className="mt-2 flex items-center gap-1 text-sm text-red-600 dark:text-red-400">
                <AlertTriangle className="h-4 w-4" />
                Jumlah melebihi saldo {savingType} tersedia (
                {formatCurrency(availableBalance)})
              </p>
            )}
          </div>

          {/* Reason */}
          <div className="mb-5">
            <label
              className="mb-2 block text-sm font-medium text-dark dark:text-white"
              htmlFor="reason"
            >
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
                setSavingType(null);
                setMessage(null);
              }}
              disabled={loading}
              className="rounded-lg border border-stroke bg-white px-6 py-3 font-medium text-gray-700 transition hover:bg-gray-50 dark:border-strokedark dark:bg-boxdark dark:text-gray-300 dark:hover:bg-gray-800"
            >
              Reset
            </button>
            <button
              type="submit"
              disabled={
                loading ||
                exceedsBalance ||
                numAmount === 0 ||
                !reason.trim() ||
                !savingType
              }
              className={`inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 font-medium text-white transition ${
                loading ||
                exceedsBalance ||
                numAmount === 0 ||
                !reason.trim() ||
                !savingType
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
