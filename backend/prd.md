# 📄 Product Requirements Document (PRD)

## Sistem Koperasi Digital – KOPMA UAD

---

# 1. 📌 Overview

## 🎯 Tujuan

Membangun sistem berbasis web untuk digitalisasi pengelolaan simpanan koperasi yang sebelumnya dilakukan secara manual, menjadi sistem terpusat yang efisien, transparan, dan terintegrasi.

---

# 2. 👥 Stakeholders

* Pengurus Koperasi (Admin / Keuangan)
* Anggota Koperasi (User)
* Developer (Pengembang sistem)

---

# 3. 🚨 Problem Statement

* Proses pembayaran menggunakan Google Form
* Data tersebar di banyak spreadsheet
* Input data dilakukan berulang
* Risiko kesalahan tinggi
* Tidak ada transparansi bagi anggota

---

# 4. 💡 Solution

Sistem web terintegrasi yang:

* Menyediakan form pembayaran online
* Dashboard verifikasi admin
* Otomatisasi pencatatan keuangan
* Akses transparansi bagi anggota

---

# 5. 🎯 Goals & Objectives

* Mengurangi proses manual
* Meningkatkan efisiensi admin
* Menyediakan data real-time
* Mengurangi human error

---

# 6. 👤 User Roles

## 👤 Anggota

* Input pembayaran
* Melihat saldo
* Melihat riwayat

## 🧑‍💼 Admin

* Verifikasi pembayaran
* Kelola anggota
* Monitoring laporan

---

# 7. 🧩 Features

## Authentication

* Login
* Logout

## Manajemen Anggota

* Tambah anggota
* Edit anggota
* Nonaktifkan anggota

## Pembayaran

* Input pembayaran
* Upload bukti
* Verifikasi admin 

## Penarikan

* Request penarikan
* Approval admin

## Keuangan

* Saldo otomatis
* Breakdown simpanan

## Laporan

* Rekap harian
* Rekap per angkatan

---

# 8. 🔁 User Flow

## User

Login → Bayar → Upload → Submit → Tunggu → Status

## Admin

Login → Verifikasi → Approve → System Update

---

# 9. ⚙️ Functional Requirements

* User dapat melakukan pembayaran
* Admin dapat memverifikasi
* Sistem menghitung saldo otomatis
* Sistem menyimpan riwayat transaksi

---

# 10. 🔐 Non-Functional Requirements

* Responsive
* Secure
* Scalable
* Fast response (<2s)

---

# 11. 🗄️ Data Requirements

## Entities:

* Users
* Payments
* Withdrawals
* Savings
* Reports

---

# 12. 🧱 Tech Stack

## Frontend

* Next.js
* Tailwind CSS
* React Hook Form

## Backend

* NestJS
* REST API

## Database

* PostgreSQL

## ORM

* Prisma

## Auth

* JWT
* Bcrypt

## Upload

* Multer

## Deployment

* Vercel (FE)
* VPS / Railway (BE)
* Neon (DB)

---

# 13. 🏗️ Arsitektur

Frontend → Backend → Database

---

# 14. 🌐 API Design

## Auth

* POST /auth/login
* GET /auth/me

## Users

* GET /users
* POST /users
* GET /users/:id

## Payments

* POST /payments
* GET /payments
* PATCH /payments/:id/approve

## Withdrawals

* POST /withdrawals
* PATCH /withdrawals/:id/approve

## Savings

* GET /savings/me

---

# 15. 🧱 Database Schema (Simplified)

## Users

* id
* name
* email
* role
* angkatan

## Payments

* id
* user_id
* nominal
* status

## Withdrawals

* id
* user_id
* nominal

## Savings

* user_id
* total

---

# 16. ⚙️ Business Logic

## Approve Payment

* Update status
* Tambah saldo
* Simpan riwayat

## Withdraw

* Validasi saldo
* Kurangi saldo

---

# 17. 📊 Success Metrics

* Efisiensi meningkat
* Data terpusat
* User aktif menggunakan sistem

---

# 18. 🚧 Scope

## Included

* Sistem pembayaran
* Verifikasi
* Laporan sederhana

## Not Included

* WA notification
* Mobile app

---

# 19. 🗓️ Timeline

* Week 1: Setup + DB
* Week 2: Core feature
* Week 3: Testing + deploy

---

# 20. 📌 Future Development

* Notifikasi otomatis
* Dashboard grafik
* Export Excel

---

# 21. 📎 Conclusion

Sistem ini akan menggantikan proses manual menjadi digital, meningkatkan efisiensi dan transparansi koperasi.
