"use client";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { ProtectedRoute } from "@/components/protected-route";
import { useState, useEffect } from "react";
import { savingsApi, withdrawalsApi } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/api-helpers";

export default function WithdrawalPage() {
  return (
    <ProtectedRoute allowedRoles={["ANGGOTA"]}>
      <WithdrawalContent />
    </ProtectedRoute>
  );
}

function WithdrawalContent() {
  const [amount, setAmount] = useState("");
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(false);
  const [fetchingBalance, setFetchingBalance] = useState(true);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    loadBalance();
  }, []);

  async function loadBalance() {
    setFetchingBalance(true);
    try {
      const response = await savingsApi.getMySavings();
      if (response.success) {
        setBalance(response.data.balance);
      }
    } catch (err) {
      console.error("Failed to load balance:", err);
    } finally {
      setFetchingBalance(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    const numAmount = parseInt(amount.replace(/\./g, ""));
    if (isNaN(numAmount) || numAmount <= 0) {
      setMessage({ type: "error", text: "Jumlah tidak valid" });
      return;
    }

    if (numAmount > balance) {
      setMessage({ type: "error", text: "Saldo tidak mencukupi" });
      return;
    }

    setLoading(true);
    try {
      const response = await withdrawalsApi.create({ amount: numAmount });
      if (response.success) {
        setMessage({ type: "success", text: "Permintaan penarikan berhasil diajukan!" });
        setAmount("");
        loadBalance();
      } else {
        setMessage({ type: "error", text: "Gagal mengajukan penarikan" });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Terjadi kesalahan saat mengajukan penarikan" });
      console.error(err);
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

  return (
    <div className="mx-auto max-w-3xl p-4 md:p-6">
      <Breadcrumb pageName="Request Penarikan" />

      <div className="mt-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <h2 className="mb-4 text-xl font-semibold text-gray-800 dark:text-white">
          Form Penarikan Simpanan
        </h2>

        {/* Balance Info */}
        <div className="mb-6 rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
          <p className="text-sm text-blue-600 dark:text-blue-400">Saldo Anda Saat Ini</p>
          {fetchingBalance ? (
            <div className="mt-2 h-8 w-40 animate-pulse rounded bg-blue-200 dark:bg-blue-800" />
          ) : (
            <p className="mt-1 text-2xl font-bold text-blue-700 dark:text-blue-300">
              {formatCurrency(balance)}
            </p>
          )}
        </div>

        {/* Message */}
        {message.text && (
          <div
            className={`mb-4 rounded-lg p-3 text-sm ${
              message.type === "success"
                ? "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400"
                : "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Jumlah Penarikan
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                Rp
              </span>
              <input
                type="text"
                value={amount}
                onChange={handleAmountChange}
                placeholder="0"
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 pl-10 text-gray-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-primary"
                disabled={loading}
              />
            </div>
            {exceedsBalance && amount && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                ⚠️ Jumlah melebihi saldo
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || exceedsBalance || numAmount === 0}
            className="flex w-full items-center justify-center rounded-lg bg-primary px-6 py-3 font-medium text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <>
                <span className="mr-2 inline-block h-5 w-5 animate-spin rounded-full border-2 border-solid border-white border-t-transparent" />
                Memproses...
              </>
            ) : (
              "Ajukan Penarikan"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
