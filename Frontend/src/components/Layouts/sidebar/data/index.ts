import * as Icons from "../icons";

export const NAV_DATA = [
  {
    label: "MAIN MENU",
    items: [
      {
        title: "Dashboard",
        icon: Icons.HomeIcon,
        roles: ["ADMIN", "ANGGOTA"],
        url: "/",
        items: [],
      },
      // ANGGOTA only menus
      {
        title: "Input Pembayaran",
        icon: Icons.MoneySend,
        roles: ["ANGGOTA"],
        url: "/pembayaran",
        items: [],
      },
      {
        title: "Riwayat Pembayaran",
        icon: Icons.MoneySend,
        roles: ["ANGGOTA"],
        url: "/pembayaran/riwayat",
        items: [],
      },
      {
        title: "Request Penarikan",
        icon: Icons.MoneyReceive,
        roles: ["ANGGOTA"],
        url: "/penarikan",
        items: [],
      },
      {
        title: "Riwayat Penarikan",
        icon: Icons.MoneyReceive,
        roles: ["ANGGOTA"],
        url: "/penarikan/riwayat",
        items: [],
      },
      {
        title: "Saldo Saya",
        url: "/saldo",
        icon: Icons.Wallet,
        roles: ["ANGGOTA"],
        items: [],
      },
      // ADMIN only menus
      {
        title: "Kelola Anggota",
        icon: Icons.UsersGroup,
        roles: ["ADMIN"],
        url: "/admin/anggota",
        items: [],
      },
      {
        title: "Verifikasi Pembayaran",
        icon: Icons.MoneySend,
        roles: ["ADMIN"],
        url: "/admin/verifikasi-pembayaran",
        items: [],
      },
      {
        title: "Verifikasi Penarikan",
        icon: Icons.MoneyReceive,
        roles: ["ADMIN"],
        url: "/admin/verifikasi-penarikan",
        items: [],
      },
      {
        title: "Keuangan",
        icon: Icons.Wallet,
        roles: ["ADMIN"],
        url: "/admin/keuangan",
        items: [],
      },
      {
        title: "Laporan",
        icon: Icons.Alphabet,
        roles: ["ADMIN"],
        url: "/admin/laporan",
        items: [],
      },
      // Common menus
      {
        title: "Profile",
        url: "/profile",
        icon: Icons.User,
        roles: ["ADMIN", "ANGGOTA"],
        items: [],
      },
      {
        title: "Settings",
        url: "/settings",
        icon: Icons.FourCircle,
        roles: ["ADMIN", "ANGGOTA"],
        items: [],
      },
    ],
  },
];
