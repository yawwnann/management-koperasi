"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ProtectedRoute } from "@/components/protected-route";
import { User, Shield, Clock, Bell } from "lucide-react";
import { ProfileTab } from "./_components/profile-tab";
import { SecurityTab } from "./_components/security-tab";
import { SessionsTab } from "./_components/sessions-tab";
import { NotificationsTab } from "./_components/notifications-tab";

type SettingsTab = "profile" | "security" | "sessions" | "notifications";

export default function SettingsPage() {
  return (
    <ProtectedRoute>
      <SettingsContent />
    </ProtectedRoute>
  );
}

function SettingsContent() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");

  useEffect(() => {
    // Read initial hash when component loads
    const initialHash = window.location.hash.replace("#", "");
    if (initialHash === "notifications") {
      setActiveTab("notifications");
    }

    // Listen for hash changes so it works if clicked from within the layout while already on /settings
    const handleHashChange = () => {
      const hash = window.location.hash.replace("#", "");
      if (hash === "notifications") {
        setActiveTab("notifications");
      }
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const tabs = [
    {
      key: "profile" as SettingsTab,
      label: "Profil",
      icon: <User className="h-4 w-4" />,
    },
    {
      key: "security" as SettingsTab,
      label: "Keamanan",
      icon: <Shield className="h-4 w-4" />,
    },
    {
      key: "sessions" as SettingsTab,
      label: "Sesi Aktif",
      icon: <Clock className="h-4 w-4" />,
    },
    {
      key: "notifications" as SettingsTab,
      label: "Notifikasi",
      icon: <Bell className="h-4 w-4" />,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark dark:text-white">
            Pengaturan
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Kelola profil, keamanan, dan sesi akun Anda
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
          <span className="font-medium text-primary">Pengaturan</span>
        </nav>
      </div>

      {/* Tabs */}
      <div className="rounded-xl border border-stroke bg-white p-2 shadow-sm dark:border-strokedark dark:bg-boxdark">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition ${
                activeTab === tab.key
                  ? "bg-primary text-white"
                  : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "profile" && <ProfileTab />}
      {activeTab === "security" && <SecurityTab />}
      {activeTab === "sessions" && <SessionsTab />}
      {activeTab === "notifications" && <NotificationsTab />}
    </div>
  );
}
