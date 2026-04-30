"use client";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { ProtectedRoute } from "@/components/protected-route";
import { useEffect, useState } from "react";
import { announcementsApi } from "@/lib/api";
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, Megaphone } from "lucide-react";

interface Announcement {
  id: string;
  title: string;
  message: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  creator?: { name: string };
  createdAt: string;
}

interface FormData {
  title: string;
  message: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

const EMPTY_FORM: FormData = {
  title: "",
  message: "",
  startDate: "",
  endDate: "",
  isActive: true,
};

export default function PengumumanPage() {
  return (
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <PengumumanContent />
    </ProtectedRoute>
  );
}

function PengumumanContent() {
  const [items, setItems] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  async function loadData() {
    setLoading(true);
    try {
      const res = await announcementsApi.getAll();
      if (res.success) setItems(res.data || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadData(); }, []);

  function openCreate() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setMessage(null);
    setShowModal(true);
  }

  function openEdit(item: Announcement) {
    setEditingId(item.id);
    setForm({
      title: item.title,
      message: item.message,
      startDate: item.startDate.slice(0, 10),
      endDate: item.endDate.slice(0, 10),
      isActive: item.isActive,
    });
    setMessage(null);
    setShowModal(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const payload = {
        ...form,
        startDate: new Date(form.startDate).toISOString(),
        endDate: new Date(form.endDate + "T23:59:59").toISOString(),
      };
      const res = editingId
        ? await announcementsApi.update(editingId, payload)
        : await announcementsApi.create(payload);

      if (res.success) {
        setMessage({ type: "success", text: editingId ? "Pengumuman berhasil diperbarui." : "Pengumuman berhasil dibuat." });
        loadData();
        setTimeout(() => setShowModal(false), 1000);
      } else {
        setMessage({ type: "error", text: "Gagal menyimpan pengumuman." });
      }
    } catch {
      setMessage({ type: "error", text: "Terjadi kesalahan." });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await announcementsApi.remove(id);
      setDeleteConfirmId(null);
      loadData();
    } catch {
      // silent
    }
  }

  async function handleToggleActive(item: Announcement) {
    await announcementsApi.update(item.id, { isActive: !item.isActive });
    loadData();
  }

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });

  const isActive = (item: Announcement) => {
    const now = new Date();
    return item.isActive && new Date(item.startDate) <= now && new Date(item.endDate) >= now;
  };

  return (
    <div className="mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <Breadcrumb pageName="Manajemen Pengumuman" />
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-primary/90 transition"
        >
          <Plus className="h-4 w-4" />
          Buat Pengumuman
        </button>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="border-b border-stroke px-6 py-4 dark:border-strokedark">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-dark dark:text-white">
            <Megaphone className="h-5 w-5 text-primary" />
            Daftar Pengumuman
          </h3>
        </div>

        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-primary" />
          </div>
        ) : items.length === 0 ? (
          <div className="flex h-40 flex-col items-center justify-center text-gray-400">
            <Megaphone className="mb-2 h-10 w-10 opacity-30" />
            <p>Belum ada pengumuman</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-stroke text-left text-xs font-semibold uppercase text-gray-500 dark:border-strokedark dark:text-gray-400">
                  <th className="px-6 py-3">Judul</th>
                  <th className="px-6 py-3">Rentang Tanggal</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Dibuat Oleh</th>
                  <th className="px-6 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-b border-stroke last:border-0 hover:bg-gray-50 dark:border-strokedark dark:hover:bg-gray-800/30">
                    <td className="px-6 py-4">
                      <p className="font-medium text-dark dark:text-white">{item.title}</p>
                      <p className="mt-0.5 line-clamp-1 text-xs text-gray-500 dark:text-gray-400">{item.message}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                      {formatDate(item.startDate)} — {formatDate(item.endDate)}
                    </td>
                    <td className="px-6 py-4">
                      {isActive(item) ? (
                        <span className="inline-flex rounded-full bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">Aktif</span>
                      ) : item.isActive ? (
                        <span className="inline-flex rounded-full bg-yellow-100 px-2.5 py-1 text-xs font-medium text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">Terjadwal</span>
                      ) : (
                        <span className="inline-flex rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-400">Nonaktif</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                      {item.creator?.name || "-"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleToggleActive(item)}
                          title={item.isActive ? "Nonaktifkan" : "Aktifkan"}
                          className="rounded p-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          {item.isActive
                            ? <ToggleRight className="h-5 w-5 text-primary" />
                            : <ToggleLeft className="h-5 w-5" />}
                        </button>
                        <button
                          onClick={() => openEdit(item)}
                          className="rounded p-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(item.id)}
                          className="rounded p-1.5 text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl dark:bg-boxdark">
            <h3 className="mb-5 text-xl font-bold text-dark dark:text-white">
              {editingId ? "Edit Pengumuman" : "Buat Pengumuman Baru"}
            </h3>

            {message && (
              <div className={`mb-4 rounded-lg p-3 text-sm ${message.type === "success" ? "bg-blue-50 text-blue-700" : "bg-red-50 text-red-700"}`}>
                {message.text}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-dark dark:text-white">Judul <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  required
                  placeholder="Contoh: Jadwal Pembayaran Simpanan Wajib"
                  className="w-full rounded-lg border border-stroke bg-transparent px-4 py-2.5 text-dark outline-none focus:border-primary dark:border-strokedark dark:text-white"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-dark dark:text-white">Isi Pesan <span className="text-red-500">*</span></label>
                <textarea
                  value={form.message}
                  onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                  required
                  rows={4}
                  placeholder="Tulis isi pengumuman di sini..."
                  className="w-full rounded-lg border border-stroke bg-transparent px-4 py-2.5 text-dark outline-none focus:border-primary dark:border-strokedark dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-dark dark:text-white">Tanggal Mulai <span className="text-red-500">*</span></label>
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
                    required
                    className="w-full rounded-lg border border-stroke bg-transparent px-4 py-2.5 text-dark outline-none focus:border-primary dark:border-strokedark dark:text-white"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-dark dark:text-white">Tanggal Selesai <span className="text-red-500">*</span></label>
                  <input
                    type="date"
                    value={form.endDate}
                    onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
                    required
                    min={form.startDate}
                    className="w-full rounded-lg border border-stroke bg-transparent px-4 py-2.5 text-dark outline-none focus:border-primary dark:border-strokedark dark:text-white"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={form.isActive}
                  onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                  className="h-4 w-4 rounded border-stroke accent-primary"
                />
                <label htmlFor="isActive" className="text-sm text-dark dark:text-white">
                  Aktifkan pengumuman ini
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  disabled={saving}
                  className="rounded-lg border border-stroke px-5 py-2.5 text-sm font-medium text-dark hover:bg-gray-50 dark:border-strokedark dark:text-white dark:hover:bg-gray-800"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-70"
                >
                  {saving ? "Menyimpan..." : editingId ? "Simpan Perubahan" : "Buat Pengumuman"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl dark:bg-boxdark">
            <h3 className="mb-2 text-lg font-bold text-dark dark:text-white">Hapus Pengumuman?</h3>
            <p className="mb-5 text-sm text-gray-500 dark:text-gray-400">
              Tindakan ini tidak dapat dibatalkan. Pengumuman akan dihapus permanen.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="rounded-lg border border-stroke px-5 py-2 text-sm font-medium text-dark dark:border-strokedark dark:text-white"
              >
                Batal
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="rounded-lg bg-red-500 px-5 py-2 text-sm font-medium text-white hover:bg-red-600"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
