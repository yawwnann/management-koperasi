"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ProtectedRoute } from "@/components/protected-route";
import { usersApi, savingsApi } from "@/lib/api";
import { getImageUrl } from "@/lib/getImageUrl";
import type {
  User,
  MandatorySavingRecord,
  VoluntarySavingRecord,
  SavingsHistoryResponse,
} from "@/types/api.types";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  User as UserIcon,
  Wallet,
  X,
} from "lucide-react";

const MONTH_NAMES = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

export default function RiwayatSimpananPage() {
  return (
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <RiwayatSimpananContent />
    </ProtectedRoute>
  );
}

function RiwayatSimpananContent() {
  const [members, setMembers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const [historyLoading, setHistoryLoading] = useState(false);
  const [mandatorySavings, setMandatorySavings] = useState<MandatorySavingRecord[]>([]);
  const [voluntarySavings, setVoluntarySavings] = useState<VoluntarySavingRecord[]>([]);

  const [page, setPage] = useState(1);
  const itemsPerPage = 12;

  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadMembers();
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function loadMembers() {
    setLoading(true);
    try {
      const response = await usersApi.getList();
      if (response.success && Array.isArray(response.data)) {
        setMembers(response.data.filter((u: User) => u.role === "ANGGOTA"));
      }
    } catch (error) {
      console.error("Failed to load members:", error);
    } finally {
      setLoading(false);
    }
  }

  async function loadHistory(userId: string) {
    setHistoryLoading(true);
    try {
      const response = await savingsApi.getSavingsHistory(userId);
      if (response.success && response.data) {
        const data = response.data as SavingsHistoryResponse;
        setMandatorySavings(data.mandatorySavings || []);
        setVoluntarySavings(data.voluntarySavings || []);
      }
    } catch (error) {
      console.error("Failed to load history:", error);
    } finally {
      setHistoryLoading(false);
    }
  }

  function handleMemberSelect(user: User) {
    setSelectedUserId(user.id);
    setSelectedUser(user);
    setSearchQuery("");
    setDropdownOpen(false);
    setPage(1);
    loadHistory(user.id);
  }

  function clearSelection() {
    setSelectedUserId("");
    setSelectedUser(null);
    setMandatorySavings([]);
    setVoluntarySavings([]);
    setPage(1);
    inputRef.current?.focus();
  }

  const filteredMembers = members.filter((m) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      m.name?.toLowerCase().includes(q) ||
      m.email?.toLowerCase().includes(q) ||
      m.nim?.toLowerCase().includes(q) ||
      m.angkatan?.toLowerCase().includes(q)
    );
  });

  const groupedMandatory = mandatorySavings.reduce<
    Record<number, MandatorySavingRecord[]>
  >((acc, ms) => {
    if (!acc[ms.year]) acc[ms.year] = [];
    acc[ms.year].push(ms);
    return acc;
  }, {});

  const sortedYears = Object.keys(groupedMandatory)
    .map(Number)
    .sort((a, b) => b - a);

  const paginatedVoluntary = voluntarySavings.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage,
  );
  const totalPages = Math.ceil(voluntarySavings.length / itemsPerPage);

  const formatRupiah = (num: number) =>
    "Rp " + new Intl.NumberFormat("id-ID").format(num);

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark dark:text-white">
            Riwayat Simpanan Anggota
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Lihat riwayat simpanan wajib dan sukarela per anggota
          </p>
        </div>
        <nav className="flex items-center gap-2 text-sm">
          <Link
            href="/"
            className="text-gray-500 hover:text-primary dark:text-gray-400"
          >
            Dashboard
          </Link>
          <span className="text-gray-400">/</span>
          <span className="font-medium text-primary">Riwayat Simpanan</span>
        </nav>
      </div>

      <div className="rounded-xl border border-stroke bg-white shadow-sm dark:border-strokedark dark:bg-boxdark">
        <div className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-lg font-semibold text-dark dark:text-white">
              Pilih Anggota
            </h3>
          </div>

          {selectedUser ? (
            <div className="mt-4 flex flex-wrap items-center gap-3 rounded-lg border border-primary bg-primary/5 px-4 py-3 dark:border-primary/50 dark:bg-primary/10">
              <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-primary/10">
                {selectedUser.photo ? (
                  <img src={getImageUrl(selectedUser.photo)} alt={selectedUser.name} className="h-full w-full object-cover" />
                ) : (
                  <UserIcon className="h-5 w-5 text-primary" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-dark dark:text-white truncate">
                  {selectedUser.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {selectedUser.nim || "-"} &middot; Angkatan {selectedUser.angkatan}
                </p>
              </div>
              <button
                onClick={clearSelection}
                className="inline-flex items-center gap-1 rounded-lg border border-stroke bg-white px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:bg-gray-100 dark:border-strokedark dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
              >
                <X className="h-3.5 w-3.5" />
                Ganti Anggota
              </button>
            </div>
          ) : (
            <div className="relative mt-4" ref={dropdownRef}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Cari anggota berdasarkan nama, email, atau NIM..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setDropdownOpen(true);
                  }}
                  onFocus={() => setDropdownOpen(true)}
                  className="w-full rounded-lg border border-stroke bg-white py-2.5 pl-10 pr-10 text-sm text-dark outline-none transition focus:border-primary dark:border-strokedark dark:bg-gray-800 dark:text-white dark:focus:border-primary"
                />
                <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              </div>

              {dropdownOpen && (
                <div className="absolute left-0 right-0 z-50 mt-1 max-h-72 overflow-y-auto rounded-lg border border-stroke bg-white shadow-lg dark:border-strokedark dark:bg-gray-800">
                  {loading ? (
                    <div className="flex items-center justify-center py-6 text-sm text-gray-500">
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                      Memuat data...
                    </div>
                  ) : filteredMembers.length === 0 ? (
                    <div className="py-6 text-center text-sm text-gray-500">
                      {searchQuery ? "Anggota tidak ditemukan" : "Tidak ada anggota"}
                    </div>
                  ) : (
                    filteredMembers.map((member) => (
                      <button
                        key={member.id}
                        onClick={() => handleMemberSelect(member)}
                        className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition hover:bg-gray-50 dark:hover:bg-gray-700/50"
                      >
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10">
                          {member.photo ? (
                            <img src={getImageUrl(member.photo)} alt={member.name} className="h-full w-full object-cover" />
                          ) : (
                            <UserIcon className="h-4 w-4 text-primary" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-dark dark:text-white truncate">
                            {member.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {member.nim || "NIM: -"} &middot; {member.email}
                          </p>
                        </div>
                        <span className="shrink-0 rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                          {member.angkatan}
                        </span>
                      </button>
                    ))
                  )}
                  {filteredMembers.length > 0 && (
                    <div className="border-t border-stroke px-4 py-2 text-xs text-gray-400 dark:border-strokedark dark:text-gray-500">
                      {filteredMembers.length} anggota ditemukan
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {selectedUser && (
        <div className="rounded-xl border border-stroke bg-white shadow-sm dark:border-strokedark dark:bg-boxdark">
          <div className="border-b border-stroke p-6 dark:border-strokedark">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                {selectedUser.photo ? (
                  <img
                    src={getImageUrl(selectedUser.photo)}
                    alt={selectedUser.name}
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  <UserIcon className="h-6 w-6 text-primary" />
                )}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-dark dark:text-white">
                  {selectedUser.name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {selectedUser.email} &middot; {selectedUser.nim || "-"} &middot; Angkatan {selectedUser.angkatan}
                </p>
              </div>
            </div>
          </div>

          {historyLoading ? (
            <div className="flex items-center justify-center py-12 text-gray-500">
              <div className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              Memuat riwayat...
            </div>
          ) : (
            <div className="p-6 space-y-8">
              {/* Simpanan Wajib */}
              <div>
                <h4 className="mb-4 text-base font-semibold text-dark dark:text-white flex items-center gap-2">
                  <Wallet className="h-5 w-5 text-blue-500" />
                  Simpanan Wajib
                </h4>
                {mandatorySavings.length === 0 ? (
                  <p className="py-6 text-center text-sm text-gray-500 dark:text-gray-400">
                    Belum ada riwayat simpanan wajib.
                  </p>
                ) : (
                  <div className="overflow-x-auto rounded-lg border border-stroke dark:border-strokedark">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-stroke bg-gray-50 dark:border-strokedark dark:bg-gray-800">
                          <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                            Tahun
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                            Bulan
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                            Nominal
                          </th>
                          <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                            Status
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                            Tanggal Bayar
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stroke dark:divide-strokedark">
                        {sortedYears.map((year) =>
                          groupedMandatory[year].map((ms, idx) => (
                            <tr
                              key={ms.id}
                              className="transition hover:bg-gray-50 dark:hover:bg-gray-800/50"
                            >
                              {idx === 0 && (
                                <td
                                  rowSpan={groupedMandatory[year].length}
                                  className="px-4 py-3 align-top text-sm font-semibold text-dark dark:text-white"
                                >
                                  {year}
                                </td>
                              )}
                              <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                                {MONTH_NAMES[ms.month - 1]}
                              </td>
                              <td className="px-4 py-3 text-right text-sm font-medium text-dark dark:text-white">
                                {formatRupiah(ms.nominal)}
                              </td>
                              <td className="px-4 py-3 text-center">
                                <span
                                  className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                                    ms.status === "PAID"
                                      ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                                      : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                  }`}
                                >
                                  {ms.status === "PAID" ? "Lunas" : "Belum"}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                                {ms.paidAt
                                  ? formatDate(ms.paidAt)
                                  : "-"}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Simpanan Sukarela */}
              <div>
                <h4 className="mb-4 text-base font-semibold text-dark dark:text-white flex items-center gap-2">
                  <Wallet className="h-5 w-5 text-green-500" />
                  Simpanan Sukarela
                </h4>
                {voluntarySavings.length === 0 ? (
                  <p className="py-6 text-center text-sm text-gray-500 dark:text-gray-400">
                    Belum ada riwayat simpanan sukarela.
                  </p>
                ) : (
                  <div className="overflow-x-auto rounded-lg border border-stroke dark:border-strokedark">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-stroke bg-gray-50 dark:border-strokedark dark:bg-gray-800">
                          <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                            Tanggal
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                            Nominal
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                            Metode
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stroke dark:divide-strokedark">
                        {paginatedVoluntary.map((vs) => (
                          <tr
                            key={vs.id}
                            className="transition hover:bg-gray-50 dark:hover:bg-gray-800/50"
                          >
                            <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                              {formatDate(vs.createdAt)}
                            </td>
                            <td className="px-4 py-3 text-right text-sm font-medium text-dark dark:text-white">
                              {formatRupiah(vs.nominal)}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                              {vs.payment?.paymentMethod || "-"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Pagination for Voluntary */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between border-t border-stroke px-4 py-3 dark:border-strokedark">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Halaman {page} dari {totalPages}
                    </p>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="rounded-lg p-2 text-gray-600 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 dark:text-gray-400 dark:hover:bg-gray-700"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <span className="px-3 text-sm text-gray-600 dark:text-gray-400">
                        {page} / {totalPages}
                      </span>
                      <button
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="rounded-lg p-2 text-gray-600 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 dark:text-gray-400 dark:hover:bg-gray-700"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {!selectedUserId && !loading && (
        <div className="rounded-xl border border-stroke bg-white p-12 text-center shadow-sm dark:border-strokedark dark:bg-boxdark">
          <Wallet className="mx-auto mb-3 h-12 w-12 text-gray-300 dark:text-gray-600" />
          <p className="text-lg font-medium text-gray-500 dark:text-gray-400">
            Pilih anggota untuk melihat riwayat simpanan
          </p>
          <p className="mt-1 text-sm text-gray-400 dark:text-gray-500">
            Gunakan pencarian di atas untuk menemukan anggota
          </p>
        </div>
      )}
    </div>
  );
}
