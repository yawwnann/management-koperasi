"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ProtectedRoute } from "@/components/protected-route";
import { usersApi } from "@/lib/api";
import type { User } from "@/types/api.types";

type RoleType = "ADMIN" | "ANGGOTA";

interface FormState {
  name: string;
  email: string;
  role: RoleType;
  angkatan: string;
}

const initialFormState: FormState = {
  name: "",
  email: "",
  role: "ANGGOTA",
  angkatan: "",
};

export default function AnggotaPage() {
  return (
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <AnggotaContent />
    </ProtectedRoute>
  );
}

function AnggotaContent() {
  const [members, setMembers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<User | null>(null);
  const [form, setForm] = useState<FormState>(initialFormState);
  const [formLoading, setFormLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    loadMembers();
  }, []);

  async function loadMembers() {
    setLoading(true);
    try {
      const response = await usersApi.getList();
      if (response.success && Array.isArray(response.data)) {
        setMembers(response.data);
      }
    } catch (error) {
      console.error("Failed to load members:", error);
      setMessage({ type: "error", text: "Gagal memuat data anggota." });
    } finally {
      setLoading(false);
    }
  }

  const openCreateModal = () => {
    setEditingMember(null);
    setForm(initialFormState);
    setModalOpen(true);
    setMessage(null);
  };

  const openEditModal = (member: User) => {
    setEditingMember(member);
    setForm({
      name: member.name,
      email: member.email,
      role: member.role,
      angkatan: member.angkatan,
    });
    setModalOpen(true);
    setMessage(null);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingMember(null);
    setForm(initialFormState);
  };

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setMessage(null);

      if (!form.name.trim()) {
        setMessage({ type: "error", text: "Nama harus diisi." });
        return;
      }
      if (
        !form.email.trim() ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)
      ) {
        setMessage({ type: "error", text: "Email tidak valid." });
        return;
      }
      if (!form.angkatan.trim()) {
        setMessage({ type: "error", text: "Angkatan harus diisi." });
        return;
      }

      setFormLoading(true);

      try {
        if (editingMember) {
          await usersApi.update(editingMember.id, {
            name: form.name,
            email: form.email,
            role: form.role,
            angkatan: form.angkatan,
          });
          setMessage({ type: "success", text: "Anggota berhasil diperbarui." });
        } else {
          await usersApi.create({
            name: form.name,
            email: form.email,
            role: form.role,
            angkatan: form.angkatan,
          });
          setMessage({
            type: "success",
            text: "Anggota berhasil ditambahkan.",
          });
        }
        setForm(initialFormState);
        setEditingMember(null);
        await loadMembers();
        setTimeout(() => setModalOpen(false), 1000);
      } catch (error: any) {
        const errorMsg =
          error?.message || "Terjadi kesalahan. Silakan coba lagi.";
        setMessage({ type: "error", text: errorMsg });
      } finally {
        setFormLoading(false);
      }
    },
    [form, editingMember],
  );

  const handleToggleStatus = useCallback(async (member: User) => {
    setDeleteConfirm(member.id);
  }, []);

  const confirmToggleStatus = useCallback(async () => {
    if (!deleteConfirm) return;

    const member = members.find((m) => m.id === deleteConfirm);
    if (!member) return;

    try {
      await usersApi.update(member.id, { isActive: !member.isActive });
      await loadMembers();
      setMessage({
        type: "success",
        text: member.isActive
          ? "Anggota berhasil dinonaktifkan."
          : "Anggota berhasil diaktifkan.",
      });
    } catch (error: any) {
      setMessage({
        type: "error",
        text: error?.message || "Gagal mengubah status anggota.",
      });
    } finally {
      setDeleteConfirm(null);
    }
  }, [deleteConfirm, members]);

  const handleFormChange = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  // Pagination
  const totalPages = Math.ceil(members.length / itemsPerPage);
  const paginatedMembers = members.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage,
  );

  return (
    <div className="mx-auto">
      {/* Breadcrumb - compact version without title */}
      <div className="mb-6 flex items-center justify-between">
        <nav className="flex items-center gap-2 text-sm">
          <Link
            href="/"
            className="font-medium text-gray-500 hover:text-primary dark:text-gray-400"
          >
            Dashboard
          </Link>
          <span className="text-gray-400">/</span>
          <span className="font-medium text-primary">Manajemen Anggota</span>
        </nav>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`mb-4 rounded-md border p-4 ${
            message.type === "success"
              ? "border-green-300 bg-green-50 text-green-700 dark:border-green-600 dark:bg-green-900/20 dark:text-green-400"
              : "border-red-300 bg-red-50 text-red-700 dark:border-red-600 dark:bg-red-900/20 dark:text-red-400"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Header */}
      <div className="dark:bg-boxdark mb-6 flex items-center justify-between rounded-lg bg-white p-4 shadow-sm">
        <div>
          <h3 className="text-base font-semibold text-dark dark:text-white">
            Daftar Anggota
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Total: {members.length} anggota
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-primary/90"
        >
          <svg
            className="mr-2 h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Tambah Anggota
        </button>
      </div>

      {/* Table */}
      <div className="dark:border-strokedark dark:bg-boxdark rounded-sm border border-stroke bg-white shadow-default">
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="dark:border-strokedark border-b border-stroke bg-gray-50 dark:bg-gray-800">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  No
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Nama
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Email
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Angkatan
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Role
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Status
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-8 text-center text-gray-500 dark:text-gray-400"
                  >
                    <div className="flex items-center justify-center">
                      <svg
                        className="mr-2 h-5 w-5 animate-spin"
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
                      Memuat data...
                    </div>
                  </td>
                </tr>
              ) : paginatedMembers.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-8 text-center text-gray-500 dark:text-gray-400"
                  >
                    Belum ada data anggota.
                  </td>
                </tr>
              ) : (
                paginatedMembers.map((member, index) => (
                  <tr
                    key={member.id}
                    className="dark:border-strokedark border-b border-stroke transition hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  >
                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                      {(page - 1) * itemsPerPage + index + 1}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-dark dark:text-white">
                      {member.name}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {member.email}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {member.angkatan}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                          member.role === "ADMIN"
                            ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
                            : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                        }`}
                      >
                        {member.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ${
                          member.isActive
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                        }`}
                      >
                        <span
                          className={`mr-1 h-2 w-2 rounded-full ${
                            member.isActive ? "bg-green-500" : "bg-red-500"
                          }`}
                        />
                        {member.isActive ? "Aktif" : "Tidak Aktif"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openEditModal(member)}
                          className="rounded-md bg-yellow-500 px-3 py-1 text-xs font-medium text-white transition hover:bg-yellow-600"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleToggleStatus(member)}
                          className={`rounded-md px-3 py-1 text-xs font-medium text-white transition ${
                            member.isActive
                              ? "bg-red-500 hover:bg-red-600"
                              : "bg-green-500 hover:bg-green-600"
                          }`}
                        >
                          {member.isActive ? "Nonaktifkan" : "Aktifkan"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="dark:border-strokedark flex items-center justify-between border-t border-stroke px-4 py-3">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Halaman {page} dari {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="dark:border-strokedark rounded-md border border-stroke px-3 py-1 text-sm text-gray-600 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:text-gray-400 dark:hover:bg-gray-700"
              >
                Sebelumnya
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`rounded-md border px-3 py-1 text-sm transition ${
                    p === page
                      ? "border-primary bg-primary text-white"
                      : "dark:border-strokedark border-stroke text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="dark:border-strokedark rounded-md border border-stroke px-3 py-1 text-sm text-gray-600 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:text-gray-400 dark:hover:bg-gray-700"
              >
                Selanjutnya
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4">
          <div className="dark:bg-boxdark w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-dark dark:text-white">
                {editingMember ? "Edit Anggota" : "Tambah Anggota Baru"}
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {message && (
              <div
                className={`mb-4 rounded-md border p-3 text-sm ${
                  message.type === "success"
                    ? "border-green-300 bg-green-50 text-green-700 dark:border-green-600 dark:bg-green-900/20 dark:text-green-400"
                    : "border-red-300 bg-red-50 text-red-700 dark:border-red-600 dark:bg-red-900/20 dark:text-red-400"
                }`}
              >
                {message.text}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Nama */}
              <div className="mb-4">
                <label
                  className="mb-1 block text-sm font-medium text-dark dark:text-white"
                  htmlFor="name"
                >
                  Nama <span className="text-red-500">*</span>
                </label>
                <input
                  id="name"
                  type="text"
                  value={form.name}
                  onChange={(e) => handleFormChange("name", e.target.value)}
                  placeholder="Masukkan nama lengkap"
                  className="dark:border-strokedark w-full rounded-lg border border-stroke bg-transparent px-4 py-2.5 text-dark outline-none transition focus:border-primary dark:text-white dark:focus:border-primary"
                  disabled={formLoading}
                  required
                />
              </div>

              {/* Email */}
              <div className="mb-4">
                <label
                  className="mb-1 block text-sm font-medium text-dark dark:text-white"
                  htmlFor="email"
                >
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => handleFormChange("email", e.target.value)}
                  placeholder="contoh@email.com"
                  className="dark:border-strokedark w-full rounded-lg border border-stroke bg-transparent px-4 py-2.5 text-dark outline-none transition focus:border-primary dark:text-white dark:focus:border-primary"
                  disabled={formLoading}
                  required
                />
              </div>

              {/* Role */}
              <div className="mb-4">
                <label
                  className="mb-1 block text-sm font-medium text-dark dark:text-white"
                  htmlFor="role"
                >
                  Role <span className="text-red-500">*</span>
                </label>
                <select
                  id="role"
                  value={form.role}
                  onChange={(e) => handleFormChange("role", e.target.value)}
                  className="dark:border-strokedark w-full rounded-lg border border-stroke bg-transparent px-4 py-2.5 text-dark outline-none transition focus:border-primary dark:text-white dark:focus:border-primary"
                  disabled={formLoading}
                >
                  <option value="ANGGOTA">ANGGOTA</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>

              {/* Angkatan */}
              <div className="mb-6">
                <label
                  className="mb-1 block text-sm font-medium text-dark dark:text-white"
                  htmlFor="angkatan"
                >
                  Angkatan <span className="text-red-500">*</span>
                </label>
                <input
                  id="angkatan"
                  type="text"
                  value={form.angkatan}
                  onChange={(e) => handleFormChange("angkatan", e.target.value)}
                  placeholder="Contoh: 2024"
                  className="dark:border-strokedark w-full rounded-lg border border-stroke bg-transparent px-4 py-2.5 text-dark outline-none transition focus:border-primary dark:text-white dark:focus:border-primary"
                  disabled={formLoading}
                  required
                />
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="dark:border-strokedark rounded-lg border border-stroke px-4 py-2 font-medium text-gray-600 transition hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                  disabled={formLoading}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 font-medium text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {formLoading ? (
                    <>
                      <svg
                        className="mr-2 h-4 w-4 animate-spin"
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
                      Menyimpan...
                    </>
                  ) : editingMember ? (
                    "Simpan Perubahan"
                  ) : (
                    "Tambah Anggota"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl dark:bg-boxdark">
            <h3 className="mb-2 text-lg font-semibold text-dark dark:text-white">
              Konfirmasi
            </h3>
            <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">
              Apakah Anda yakin ingin{" "}
              {members.find((m) => m.id === deleteConfirm)?.isActive
                ? "menonaktifkan"
                : "mengaktifkan"}{" "}
              anggota{" "}
              <strong>
                {members.find((m) => m.id === deleteConfirm)?.name}
              </strong>
              ?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="rounded-lg border border-stroke px-4 py-2 font-medium text-gray-600 transition hover:bg-gray-100 dark:border-strokedark dark:text-gray-400 dark:hover:bg-gray-700"
              >
                Batal
              </button>
              <button
                onClick={confirmToggleStatus}
                className="rounded-lg bg-red-500 px-4 py-2 font-medium text-white transition hover:bg-red-600"
              >
                Ya, Lanjutkan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
