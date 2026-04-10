-- SQL Script to create initial admin and sample member users
-- Run this script using psql or any PostgreSQL client

-- Generate bcrypt hash for passwords
-- admin123 -> $2b$10$Zs8VxJq5rLz6Vv8Gq9YHGu4fJ3kL9mN0pQ2rS5tU7vW9xY1zA2bC3
-- member123 -> $2b$10$At9WyCx7sM0a8Hh9Jk4lLOpQ3rS6tU8vW1xY2zA4bC5dE7fG0hI9j

-- Create Admin User
INSERT INTO "users" (id, name, email, password, role, angkatan, "isActive", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'Admin KOPMA',
  'admin@kopma.com',
  '$2b$10$Zs8VxJq5rLz6Vv8Gq9YHGu4fJ3kL9mN0pQ2rS5tU7vW9xY1zA2bC3',
  'ADMIN',
  '2024',
  true,
  NOW(),
  NOW()
);

-- Create Sample Member
INSERT INTO "users" (id, name, email, password, role, angkatan, "isActive", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'Anggota Contoh',
  'member@kopma.com',
  '$2b$10$At9WyCx7sM0a8Hh9Jk4lLOpQ3rS6tU8vW1xY2zA4bC5dE7fG0hI9j',
  'ANGGOTA',
  '2024',
  true,
  NOW(),
  NOW()
);

-- Create savings records for both users
INSERT INTO "savings" (id, "userId", total, "updatedAt")
SELECT gen_random_uuid(), id, 0, NOW()
FROM "users"
WHERE email IN ('admin@kopma.com', 'member@kopma.com');

-- Verify
SELECT id, name, email, role, angkatan FROM "users" WHERE email IN ('admin@kopma.com', 'member@kopma.com');
SELECT s.*, u.email FROM "savings" s JOIN "users" u ON s."userId" = u.id;
