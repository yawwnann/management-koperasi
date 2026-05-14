"use client";
import { EmailIcon } from "@/assets/icons";
import React, { useState } from "react";
import InputGroup from "../FormElements/InputGroup";
import { Checkbox } from "../FormElements/checkbox";
import { authApi } from "@/lib/api";
import { useRouter } from "next/navigation";
import { AlertTriangle } from "lucide-react";

const ADMIN_WHATSAPP =
  process.env.NEXT_PUBLIC_ADMIN_WHATSAPP || "6281222736848";

export default function SigninWithPassword() {
  const router = useRouter();
  const [data, setData] = useState({
    email: "",
    password: "",
    remember: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showDeactivatedModal, setShowDeactivatedModal] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setData({
      ...data,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await authApi.login(data.email, data.password, data.remember);

      if (response.success) {
        router.push("/");
        router.refresh();
      } else {
        const msg = response?.message?.toLowerCase() || "";
        if (msg.includes("deactivated")) {
          setShowDeactivatedModal(true);
        } else {
          setError("Email atau kata sandi salah. Silakan coba lagi.");
        }
      }
    } catch (err) {
      setError("Terjadi kesalahan. Silakan coba lagi nanti.");
      console.error("Kesalahan saat masuk:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Error Message */}
      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/20">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Email Input */}
      <div className="mb-4">
        <InputGroup
          type="email"
          label="Email"
          className="[&_input]:py-[13px]"
          placeholder="Email"
          name="email"
          handleChange={handleChange}
          value={data.email}
          icon={<EmailIcon />}
        />
      </div>

      {/* Password Input with Eye Toggle */}
      <div className="mb-4">
        <label className="text-body-sm font-medium text-dark dark:text-white">
          Kata Sandi
        </label>
        <div className="relative mt-3">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Masukkan kata sandi"
            onChange={handleChange}
            value={data.password}
            className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5.5 py-3 pr-12 outline-none transition focus:border-primary disabled:cursor-default disabled:bg-gray-2 data-[active=true]:border-primary dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary dark:disabled:bg-dark dark:data-[active=true]:border-primary"
            suppressHydrationWarning
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
            suppressHydrationWarning
          >
            {showPassword ? (
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
                  d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                />
              </svg>
            ) : (
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
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Remember Me & Forgot Password */}
      <div className="mb-6 flex items-center justify-between">
        <Checkbox
          label="Ingat saya"
          name="remember"
          withIcon="check"
          minimal
          radius="md"
          onChange={(e) =>
            setData({
              ...data,
              remember: e.target.checked,
            })
          }
        />

        <a
          href="/auth/forgot-password"
          className="text-sm font-medium text-primary hover:underline"
        >
          Lupa kata sandi?
        </a>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="mb-4 flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary p-3.5 font-medium text-white transition hover:bg-opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        suppressHydrationWarning
      >
        {loading ? (
          <>
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-t-transparent" />
            <span>Memproses...</span>
          </>
        ) : (
          "Masuk"
        )}
      </button>

      {/* Deactivated Account Modal */}
      {showDeactivatedModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-boxdark">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                <AlertTriangle className="h-8 w-8 text-red-500" />
              </div>
              <h3 className="mb-2 text-xl font-bold text-dark dark:text-white">
                Akun Dinonaktifkan
              </h3>
              <p className="mb-6 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                Akun Anda telah dinonaktifkan. Silakan hubungi administrator
                melalui WhatsApp untuk informasi lebih lanjut.
              </p>
              <div className="flex w-full flex-col gap-3">
                <a
                  href={`https://wa.me/${ADMIN_WHATSAPP}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-500 px-4 py-3 font-medium text-white transition hover:bg-green-600"
                >
                  <svg
                    className="h-5 w-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  Hubungi Admin via WhatsApp
                </a>
                <button
                  onClick={() => setShowDeactivatedModal(false)}
                  className="rounded-lg border border-stroke px-4 py-3 font-medium text-gray-600 transition hover:bg-gray-100 dark:border-strokedark dark:text-gray-400 dark:hover:bg-gray-700"
                >
                  Kembali ke Login
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
