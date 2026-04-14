"use client";

import { useState } from "react";
import { Lock, Eye, EyeOff, Save, Check, X, Shield, AlertTriangle } from "lucide-react";

export function SecurityTab() {
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const togglePassword = (field: "current" | "new" | "confirm") => {
    setShowPasswords({
      ...showPasswords,
      [field]: !showPasswords[field],
    });
  };

  const getPasswordStrength = (password: string) => {
    if (!password) return { level: 0, text: "", color: "" };
    
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    const levels = [
      { text: "Sangat Lemah", color: "bg-red-500" },
      { text: "Lemah", color: "bg-orange-500" },
      { text: "Sedang", color: "bg-yellow-500" },
      { text: "Kuat", color: "bg-green-500" },
      { text: "Sangat Kuat", color: "bg-green-600" },
    ];

    return { level: score, text: levels[score].text, color: levels[score].color };
  };

  const passwordStrength = getPasswordStrength(formData.newPassword);

  const handleSave = async () => {
    // Validation
    if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
      setMessage({ type: "error", text: "Semua field harus diisi." });
      return;
    }

    if (formData.newPassword.length < 8) {
      setMessage({ type: "error", text: "Password baru minimal 8 karakter." });
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setMessage({ type: "error", text: "Password baru tidak cocok." });
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000/api"}/auth/change-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
          credentials: "include",
          body: JSON.stringify({
            currentPassword: formData.currentPassword,
            newPassword: formData.newPassword,
            confirmPassword: formData.confirmPassword,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Gagal mengubah password");
      }

      setMessage({ type: "success", text: data.message || "Password berhasil diubah. Silakan login ulang." });
      
      // Clear form
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      // Redirect to login after 3 seconds
      setTimeout(() => {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("current_user");
        window.location.href = "/auth/sign-in";
      }, 3000);
    } catch (error: any) {
      setMessage({ type: "error", text: error.message || "Gagal mengubah password." });
    } finally {
      setSaving(false);
    }
  };

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

      {/* Password Change Card */}
      <div className="rounded-xl border border-stroke bg-white shadow-sm dark:border-strokedark dark:bg-boxdark">
        <div className="border-b border-stroke p-6 dark:border-strokedark">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-dark dark:text-white">Ubah Password</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Pastikan password Anda kuat dan unik
              </p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Current Password */}
          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium text-dark dark:text-white">
              Password Saat Ini
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type={showPasswords.current ? "text" : "password"}
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleChange}
                className="w-full rounded-lg border border-stroke bg-white py-2.5 pl-10 pr-10 text-dark outline-none transition focus:border-primary dark:border-strokedark dark:bg-gray-800 dark:text-white dark:focus:border-primary"
                placeholder="Masukkan password saat ini"
              />
              <button
                type="button"
                onClick={() => togglePassword("current")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium text-dark dark:text-white">
              Password Baru
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type={showPasswords.new ? "text" : "password"}
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                className="w-full rounded-lg border border-stroke bg-white py-2.5 pl-10 pr-10 text-dark outline-none transition focus:border-primary dark:border-strokedark dark:bg-gray-800 dark:text-white dark:focus:border-primary"
                placeholder="Minimal 8 karakter"
              />
              <button
                type="button"
                onClick={() => togglePassword("new")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {/* Password Strength Indicator */}
            {formData.newPassword && (
              <div className="mt-2">
                <div className="flex h-1.5 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                  <div
                    className={`transition-all duration-300 ${passwordStrength.color}`}
                    style={{ width: `${(passwordStrength.level / 5) * 100}%` }}
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Kekuatan password: <span className="font-medium">{passwordStrength.text}</span>
                </p>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium text-dark dark:text-white">
              Konfirmasi Password Baru
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type={showPasswords.confirm ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full rounded-lg border border-stroke bg-white py-2.5 pl-10 pr-10 text-dark outline-none transition focus:border-primary dark:border-strokedark dark:bg-gray-800 dark:text-white dark:focus:border-primary"
                placeholder="Ulangi password baru"
              />
              <button
                type="button"
                onClick={() => togglePassword("confirm")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {/* Password Match Indicator */}
            {formData.confirmPassword && (
              <p className={`mt-1 text-xs ${
                formData.newPassword === formData.confirmPassword
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
              }`}>
                {formData.newPassword === formData.confirmPassword ? "✓ Password cocok" : "✗ Password tidak cocok"}
              </p>
            )}
          </div>

          {/* Info Box */}
          <div className="mb-6 rounded-lg border border-yellow-300 bg-yellow-50 p-4 dark:border-yellow-600 dark:bg-yellow-900/20">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-yellow-600 dark:text-yellow-400" />
              <div className="text-sm text-yellow-700 dark:text-yellow-400">
                <p className="font-medium">Perhatian</p>
                <p className="mt-1">
                  Setelah password diubah, Anda akan keluar dari semua perangkat dan perlu login ulang.
                </p>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 font-medium text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save className="h-4 w-4" />
              {saving ? "Menyimpan..." : "Ubah Password"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
