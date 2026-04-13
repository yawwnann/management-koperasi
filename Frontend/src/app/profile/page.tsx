"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { CameraIcon } from "./_components/icons";
import { profileApi } from "@/lib/api";
import {
  Mail,
  Phone,
  MapPin,
  Calendar,
  User,
  Shield,
  Edit2,
  Save,
  X,
} from "lucide-react";

interface ProfileData {
  id: string;
  name: string;
  email: string;
  role: string;
  angkatan: string;
  photo?: string;
  coverPhoto: string;
  bio: string;
  phone?: string;
  address?: string;
  joinDate: string;
}

export default function ProfilePage() {
  const [data, setData] = useState<ProfileData | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated
    const token =
      typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
    if (!token) {
      router.push("/auth/sign-in");
      return;
    }
    loadProfile();
  }, []);

  async function loadProfile() {
    setLoading(true);
    try {
      const response = await profileApi.getMyProfile();
      if (response.success && response.data) {
        setData(response.data as ProfileData);
        if (typeof window !== "undefined") {
          localStorage.setItem("current_user", JSON.stringify(response.data));
          window.dispatchEvent(new Event("profile-updated"));
        }
      } else {
        // Token might be invalid or expired - redirect to login
        if (typeof window !== "undefined") {
          localStorage.removeItem("auth_token");
          localStorage.removeItem("current_user");
        }
        router.push("/auth/sign-in");
        return;
      }
    } catch (error: any) {
      console.error("Failed to load profile:", error);
      const errorMsg = error?.message?.toLowerCase() || "";

      // Check if it's an authentication error
      if (
        errorMsg.includes("authentication") ||
        errorMsg.includes("unauthorized") ||
        errorMsg.includes("401") ||
        errorMsg.includes("token") ||
        errorMsg.includes("missing")
      ) {
        // Clear invalid tokens and redirect to login
        if (typeof window !== "undefined") {
          localStorage.removeItem("auth_token");
          localStorage.removeItem("current_user");
        }
        router.push("/auth/sign-in");
        return;
      }

      setMessage({ type: "error", text: "Gagal memuat data profile." });
    } finally {
      setLoading(false);
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    if (!data) return;
    if (e.target.name === "photo" || e.target.name === "coverPhoto") {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        if (e.target.name === "photo") {
          setPhotoFile(file);
        }
        setData({
          ...data,
          [e.target.name]: URL.createObjectURL(file),
        });
      }
    } else {
      setData({
        ...data,
        [e.target.name]: e.target.value,
      });
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

      let photoResponse;
      if (photoFile) {
        const formData = new FormData();
        formData.append("photo", photoFile);
        photoResponse = await profileApi.updateProfilePhoto(formData);

        if (photoResponse.success) {
          setPhotoFile(null); // Reset because it's uploaded
        }
      }

      if (response.success || photoResponse?.success) {
        setMessage({ type: "success", text: "Profile berhasil diperbarui." });
        setIsEditing(false);
        // Refresh profile data to get the new photo URL from server
        loadProfile();
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (error: any) {
      setMessage({
        type: "error",
        text: error.message || "Gagal memperbarui profile.",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          Memuat data profile...
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="rounded-xl border border-stroke bg-white p-12 text-center shadow-sm dark:border-strokedark dark:bg-boxdark">
        <p className="text-red-500">Gagal memuat data profile.</p>
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

  const infoItems = [
    { icon: <Mail className="h-4 w-4" />, label: "Email", value: data.email },
    {
      icon: <Calendar className="h-4 w-4" />,
      label: "Bergabung",
      value: formatDate(data.joinDate),
    },
    ...(data.phone
      ? [
          {
            icon: <Phone className="h-4 w-4" />,
            label: "Telepon",
            value: data.phone,
          },
        ]
      : []),
    ...(data.address
      ? [
          {
            icon: <MapPin className="h-4 w-4" />,
            label: "Alamat",
            value: data.address,
          },
        ]
      : []),
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark dark:text-white">
            Profile
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Kelola informasi profil dan akun Anda
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
          <span className="font-medium text-primary">Profile</span>
        </nav>
      </div>

      {/* Alert Message */}
      {message && (
        <div
          className={`flex items-center gap-3 rounded-lg border p-4 ${
            message.type === "success"
              ? "border-green-300 bg-green-50 text-green-700 dark:border-green-600 dark:bg-green-900/20 dark:text-green-400"
              : "border-red-300 bg-red-50 text-red-700 dark:border-red-600 dark:bg-red-900/20 dark:text-red-400"
          }`}
        >
          <span className="text-sm font-medium">{message.text}</span>
          <button
            onClick={() => setMessage(null)}
            className="ml-auto text-current opacity-60 hover:opacity-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="rounded-xl border border-stroke bg-white shadow-sm dark:border-strokedark dark:bg-boxdark">
        {/* Cover Photo */}
        <div className="relative h-48 overflow-hidden rounded-t-xl bg-gray-200 dark:bg-gray-700 sm:h-56">
          {data.coverPhoto ? (
            <Image
              src={data.coverPhoto}
              alt="Cover"
              fill
              className="object-cover"
            />
          ) : null}
          {isEditing && (
            <label className="absolute bottom-4 right-4 flex cursor-pointer items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-dark shadow-md hover:bg-gray-50 dark:bg-gray-800 dark:text-white">
              <CameraIcon />
              <span>Ubah Cover</span>
              <input
                type="file"
                name="coverPhoto"
                className="sr-only"
                onChange={handleChange}
                accept="image/png, image/jpg, image/jpeg"
              />
            </label>
          )}
        </div>

        <div className="px-6 pb-8">
          {/* Profile Photo & Header */}
          <div className="relative flex flex-col items-start gap-4 sm:flex-row sm:items-end sm:gap-6">
            <div className="relative -mt-16">
              <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-gray-100 shadow-md dark:border-gray-900 dark:bg-gray-700 sm:h-32 sm:w-32">
                {data.photo ? (
                  <Image
                    src={data.photo}
                    alt={data.name}
                    width={128}
                    height={128}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <User className="h-12 w-12 text-gray-400" />
                )}
              </div>
              {isEditing && (
                <label className="absolute bottom-1 right-1 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-primary text-white shadow-md hover:bg-primary/90">
                  <CameraIcon className="h-4 w-4" />
                  <input
                    type="file"
                    name="photo"
                    className="sr-only"
                    onChange={handleChange}
                    accept="image/png, image/jpg, image/jpeg"
                  />
                </label>
              )}
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-dark dark:text-white">
                  {data.name}
                </h2>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    data.role === "ADMIN"
                      ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                      : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                  }`}
                >
                  <Shield className="h-3 w-3" />
                  {data.role === "ADMIN" ? "Administrator" : "Anggota"}
                </span>
              </div>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Angkatan {data.angkatan} • Member sejak{" "}
                {formatDate(data.joinDate)}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {isEditing ? (
                <>
                  <button
                    onClick={handleSave}
                    className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-primary/90"
                  >
                    <Save className="h-4 w-4" />
                    Simpan
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      loadProfile();
                    }}
                    className="rounded-lg border border-stroke px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100 dark:border-strokedark dark:text-gray-400 dark:hover:bg-gray-700"
                  >
                    Batal
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 rounded-lg border border-stroke px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100 dark:border-strokedark dark:text-gray-400 dark:hover:bg-gray-700"
                >
                  <Edit2 className="h-4 w-4" />
                  Edit Profile
                </button>
              )}
            </div>
          </div>

          {/* Info Grid */}
          <div className="mt-8 grid grid-cols-1 gap-6 border-t border-stroke pt-8 dark:border-strokedark sm:grid-cols-2 lg:grid-cols-4">
            {infoItems.map((item) => (
              <div key={item.label} className="flex items-start gap-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                  {item.icon}
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {item.label}
                  </p>
                  <p className="mt-0.5 text-sm font-medium text-dark dark:text-white">
                    {item.value}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Bio Section */}
          <div className="mt-8 border-t border-stroke pt-8 dark:border-strokedark">
            <h3 className="mb-4 text-sm font-semibold text-dark dark:text-white">
              Tentang Saya
            </h3>
            {isEditing ? (
              <textarea
                name="bio"
                value={data.bio}
                onChange={handleChange}
                className="w-full rounded-lg border border-stroke bg-white px-4 py-3 text-sm text-dark outline-none transition focus:border-primary dark:border-strokedark dark:bg-gray-800 dark:text-white dark:focus:border-primary"
                rows={4}
                placeholder="Ceritakan tentang diri Anda..."
              />
            ) : (
              <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                {data.bio ||
                  "Belum ada deskripsi. Klik Edit Profile untuk menambahkan."}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
