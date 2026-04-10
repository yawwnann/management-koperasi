"use client";

import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import Image from "next/image";
import { useState, useEffect } from "react";
import { CameraIcon } from "./_components/icons";
import { SocialAccounts } from "./_components/social-accounts";
import { profileApi } from "@/lib/api";
import { getCurrentUser } from "@/lib/api-helpers";

interface ProfileData {
  id: string;
  name: string;
  email: string;
  role: string;
  angkatan: string;
  profilePhoto: string;
  coverPhoto: string;
  bio: string;
  phone?: string;
  address?: string;
  joinDate: string;
}

export default function Page() {
  const [data, setData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    setLoading(true);
    try {
      const response = await profileApi.getMyProfile();
      if (response.success && response.data) {
        setData(response.data as ProfileData);
      }
    } catch (error) {
      console.error("Failed to load profile:", error);
      setMessage({ type: "error", text: "Gagal memuat data profile." });
    } finally {
      setLoading(false);
    }
  }

  const handleChange = (e: any) => {
    if (e.target.name === "profilePhoto") {
      const file = e.target?.files[0];

      setData((prev) => ({
        ...prev!,
        profilePhoto: file && URL.createObjectURL(file),
      }));
    } else if (e.target.name === "coverPhoto") {
      const file = e.target?.files[0];

      setData((prev) => ({
        ...prev!,
        coverPhoto: file && URL.createObjectURL(file),
      }));
    } else {
      setData((prev) => ({
        ...prev!,
        [e.target.name]: e.target.value,
      }));
    }
  };

  const handleSave = async () => {
    if (!data) return;

    try {
      const response = await profileApi.updateProfile({
        name: data.name,
        bio: data.bio,
        phone: data.phone,
        address: data.address,
      });

      if (response.success) {
        setMessage({ type: "success", text: "Profile berhasil diperbarui." });
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (error: any) {
      setMessage({ type: "error", text: error.message || "Gagal memperbarui profile." });
    }
  };

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-[970px]">
        <Breadcrumb pageName="Profile" />
        <div className="flex items-center justify-center rounded-[10px] bg-white p-12 shadow-1 dark:bg-gray-dark">
          <div className="text-center">
            <svg className="mx-auto h-12 w-12 animate-spin text-primary" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <p className="mt-4 text-gray-500 dark:text-gray-400">Memuat data profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="mx-auto w-full max-w-[970px]">
        <Breadcrumb pageName="Profile" />
        <div className="rounded-[10px] bg-white p-12 text-center shadow-1 dark:bg-gray-dark">
          <p className="text-red-500">Gagal memuat data profile.</p>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="mx-auto w-full max-w-[970px]">
      <Breadcrumb pageName="Profile" />

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

      <div className="overflow-hidden rounded-[10px] bg-white shadow-1 dark:bg-gray-dark dark:shadow-card">
        <div className="relative z-20 h-35 md:h-65">
          <Image
            src={data?.coverPhoto}
            alt="profile cover"
            className="h-full w-full rounded-tl-[10px] rounded-tr-[10px] object-cover object-center"
            width={970}
            height={260}
            style={{
              width: "auto",
              height: "auto",
            }}
          />
          <div className="absolute bottom-1 right-1 z-10 xsm:bottom-4 xsm:right-4">
            <label
              htmlFor="cover"
              className="flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary px-[15px] py-[5px] text-body-sm font-medium text-white hover:bg-opacity-90"
            >
              <input
                type="file"
                name="coverPhoto"
                id="coverPhoto"
                className="sr-only"
                onChange={handleChange}
                accept="image/png, image/jpg, image/jpeg"
              />

              <CameraIcon />

              <span>Edit</span>
            </label>
          </div>
        </div>
        <div className="px-4 pb-6 text-center lg:pb-8 xl:pb-11.5">
          <div className="relative z-30 mx-auto -mt-22 h-30 w-full max-w-30 rounded-full bg-white/20 p-1 backdrop-blur sm:h-44 sm:max-w-[176px] sm:p-3">
            <div className="relative drop-shadow-2">
              {data?.profilePhoto && (
                <>
                  <Image
                    src={data?.profilePhoto}
                    width={160}
                    height={160}
                    className="overflow-hidden rounded-full"
                    alt="profile"
                  />

                  <label
                    htmlFor="profilePhoto"
                    className="absolute bottom-0 right-0 flex size-8.5 cursor-pointer items-center justify-center rounded-full bg-primary text-white hover:bg-opacity-90 sm:bottom-2 sm:right-2"
                  >
                    <CameraIcon />

                    <input
                      type="file"
                      name="profilePhoto"
                      id="profilePhoto"
                      className="sr-only"
                      onChange={handleChange}
                      accept="image/png, image/jpg, image/jpeg"
                    />
                  </label>
                </>
              )}
            </div>
          </div>
          <div className="mt-4">
            <h3 className="mb-1 text-heading-6 font-bold text-dark dark:text-white">
              {data?.name}
            </h3>
            <p className="font-medium">
              {data.role === "ADMIN" ? "Administrator" : "Anggota"} • Angkatan {data.angkatan}
            </p>

            <div className="mx-auto mb-5.5 mt-5 max-w-[500px] rounded-[5px] border border-stroke px-6 py-4 shadow-1 dark:border-dark-3 dark:bg-dark-2 dark:shadow-card">
              <div className="grid grid-cols-2 gap-4 text-left">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                  <p className="font-medium text-dark dark:text-white">{data.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Bergabung Sejak</p>
                  <p className="font-medium text-dark dark:text-white">{formatDate(data.joinDate)}</p>
                </div>
                {data.phone && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Telepon</p>
                    <p className="font-medium text-dark dark:text-white">{data.phone}</p>
                  </div>
                )}
                {data.address && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Alamat</p>
                    <p className="font-medium text-dark dark:text-white">{data.address}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="mx-auto max-w-[720px]">
              <h4 className="font-medium text-dark dark:text-white">Tentang Saya</h4>
              <textarea
                name="bio"
                value={data.bio}
                onChange={handleChange}
                className="mt-4 w-full rounded-lg border border-stroke bg-transparent px-4 py-3 text-dark outline-none transition focus:border-primary dark:border-strokedark dark:text-white dark:focus:border-primary"
                rows={4}
                placeholder="Ceritakan tentang diri Anda..."
              />
            </div>

            <div className="mt-6 flex justify-center gap-3">
              <button
                onClick={handleSave}
                className="rounded-lg bg-primary px-6 py-2 font-medium text-white transition hover:bg-primary/90"
              >
                Simpan Perubahan
              </button>
            </div>

            <div className="mt-8">
              <SocialAccounts />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
