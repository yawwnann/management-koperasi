"use client";

import { useState, useEffect } from "react";
import { Camera, User, Mail, Phone, MapPin, Save, Check, X } from "lucide-react";
import { getCurrentUser } from "@/lib/api-helpers";

export function ProfileTab() {
  const [user, setUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    bio: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      setFormData({
        name: currentUser.name || "",
        email: currentUser.email || "",
        phone: currentUser.phone || "",
        address: currentUser.address || "",
        bio: currentUser.bio || "",
      });
    }
    setLoading(false);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // TODO: Implement profile update API call
      setMessage({ type: "success", text: "Profil berhasil diperbarui." });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ type: "error", text: "Gagal memperbarui profil." });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center rounded-xl border border-stroke bg-white p-12 dark:border-strokedark dark:bg-boxdark">
        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          Memuat data...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Message */}
      {message && (
        <div className={`flex items-center gap-3 rounded-lg border p-4 ${
          message.type === "success"
            ? "border-green-300 bg-green-50 text-green-700 dark:border-green-600 dark:bg-green-900/20 dark:text-green-400"
            : "border-red-300 bg-red-50 text-red-700 dark:border-red-600 dark:bg-red-900/20 dark:text-red-400"
        }`}>
          {message.type === "success" ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
          <span className="text-sm font-medium">{message.text}</span>
          <button onClick={() => setMessage(null)} className="ml-auto text-current opacity-60 hover:opacity-100">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Profile Card */}
      <div className="rounded-xl border border-stroke bg-white shadow-sm dark:border-strokedark dark:bg-boxdark">
        {/* Avatar Section */}
        <div className="flex items-center gap-6 border-b border-stroke p-6 dark:border-strokedark">
          <div className="relative">
            <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-primary/10">
              {user?.photo ? (
                <img src={user.photo} alt={user.name} className="h-full w-full object-cover" />
              ) : (
                <User className="h-10 w-10 text-primary" />
              )}
            </div>
            <button className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white shadow-md hover:bg-primary/90">
              <Camera className="h-4 w-4" />
            </button>
          </div>
          <div>
            <h3 className="text-xl font-bold text-dark dark:text-white">{user?.name}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
            <span className={`mt-2 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
              user?.role === "ADMIN"
                ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
            }`}>
              {user?.role === "ADMIN" ? "Administrator" : "Anggota"}
            </span>
          </div>
        </div>

        {/* Form */}
        <div className="p-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Name */}
            <div>
              <label className="mb-2 block text-sm font-medium text-dark dark:text-white">
                <User className="mr-2 inline h-4 w-4" />
                Nama Lengkap
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full rounded-lg border border-stroke bg-white px-4 py-2.5 text-dark outline-none transition focus:border-primary dark:border-strokedark dark:bg-gray-800 dark:text-white dark:focus:border-primary"
              />
            </div>

            {/* Email */}
            <div>
              <label className="mb-2 block text-sm font-medium text-dark dark:text-white">
                <Mail className="mr-2 inline h-4 w-4" />
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full rounded-lg border border-stroke bg-white px-4 py-2.5 text-dark outline-none transition focus:border-primary dark:border-strokedark dark:bg-gray-800 dark:text-white dark:focus:border-primary"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="mb-2 block text-sm font-medium text-dark dark:text-white">
                <Phone className="mr-2 inline h-4 w-4" />
                Telepon
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="08xxxxxxxxxx"
                className="w-full rounded-lg border border-stroke bg-white px-4 py-2.5 text-dark outline-none transition focus:border-primary dark:border-strokedark dark:bg-gray-800 dark:text-white dark:focus:border-primary"
              />
            </div>

            {/* Address */}
            <div>
              <label className="mb-2 block text-sm font-medium text-dark dark:text-white">
                <MapPin className="mr-2 inline h-4 w-4" />
                Alamat
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Kota, Provinsi"
                className="w-full rounded-lg border border-stroke bg-white px-4 py-2.5 text-dark outline-none transition focus:border-primary dark:border-strokedark dark:bg-gray-800 dark:text-white dark:focus:border-primary"
              />
            </div>
          </div>

          {/* Bio */}
          <div className="mt-6">
            <label className="mb-2 block text-sm font-medium text-dark dark:text-white">
              Tentang Saya
            </label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows={4}
              placeholder="Ceritakan tentang diri Anda..."
              className="w-full rounded-lg border border-stroke bg-white px-4 py-2.5 text-dark outline-none transition focus:border-primary dark:border-strokedark dark:bg-gray-800 dark:text-white dark:focus:border-primary"
            />
          </div>

          {/* Save Button */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 font-medium text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save className="h-4 w-4" />
              {saving ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
