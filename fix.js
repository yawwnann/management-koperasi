const fs = require("fs");
let b = fs.readFileSync("Frontend/src/app/(home)/page.tsx", "utf8");

// Replace {activity.userName} -> {activity.type === 'payment' ? 'Setoran' : 'Penarikan'}
b = b.replace(
  "{activity.userName}",
  '{activity.type === "payment" ? "Setoran" : "Penarikan"}',
);

// Replace data.mySavings.balance
b = b.replace(
  /data\.mySavings \? formatCurrency\(data\.mySavings\.balance\) : "Rp 0"/,
  "formatCurrency(data.totalBalance)",
);

// Replace data.mySavings.updatedAt
b = b.replace(
  /data\.mySavings\s*\?\s*`Terakhir diperbarui: \$\{formatDate\(data\.mySavings\.updatedAt\)\}`\s*:\s*"Tidak ada data"/g,
  "`Terakhir diperbarui: ${formatDate(new Date().toString())}`",
);

// Replace data.lastPayment amount
b = b.replace(
  /data\.lastPayment \?\s*formatCurrency\(data\.lastPayment\.amount\)\s*:\s*"-",/,
  '(data.recentActivities.find(a => a.type === "payment") ? formatCurrency(data.recentActivities.find(a => a.type === "payment")!.amount) : "-"),',
);

// Replace data.lastPayment badge
b = b.replace(
  /data\.lastPayment \?\s*\(\s*getStatusBadge\(data\.lastPayment\.status\)\s*\)\s*:\s*\(\s*<span className="text-sm text-gray-400">Tidak ada<\/span>\s*\),/,
  '(data.recentActivities.find(a => a.type === "payment") ? getStatusBadge(data.recentActivities.find(a => a.type === "payment")!.status) : <span className="text-sm text-gray-400">Tidak ada</span>),',
);

// Replace data.lastPayment createdAt
b = b.replace(
  /data\.lastPayment \?\s*formatDate\(data\.lastPayment\.createdAt\)\s*:\s*"",/,
  '(data.recentActivities.find(a => a.type === "payment") ? formatDate(data.recentActivities.find(a => a.type === "payment")!.createdAt) : ""),',
);

// Replace data.lastWithdrawal amount
b = b.replace(
  /data\.lastWithdrawal\s*\?\s*formatCurrency\(data\.lastWithdrawal\.amount\)\s*:\s*"-",/,
  '(data.recentActivities.find(a => a.type === "withdrawal") ? formatCurrency(data.recentActivities.find(a => a.type === "withdrawal")!.amount) : "-"),',
);

// Replace data.lastWithdrawal badge
b = b.replace(
  /data\.lastWithdrawal \?\s*\(\s*getStatusBadge\(data\.lastWithdrawal\.status\)\s*\)\s*:\s*\(\s*<span className="text-sm text-gray-400">Tidak ada<\/span>\s*\),/,
  '(data.recentActivities.find(a => a.type === "withdrawal") ? getStatusBadge(data.recentActivities.find(a => a.type === "withdrawal")!.status) : <span className="text-sm text-gray-400">Tidak ada</span>),',
);

// Replace data.lastWithdrawal createdAt
b = b.replace(
  /data\.lastWithdrawal\s*\?\s*formatDate\(data\.lastWithdrawal\.createdAt\)\s*:\s*"",/,
  '(data.recentActivities.find(a => a.type === "withdrawal") ? formatDate(data.recentActivities.find(a => a.type === "withdrawal")!.createdAt) : ""),',
);

// Replace accountStatus value
b = b.replace(/value: data\.accountStatus,/, 'value: "Aktif",');

// Replace accountStatus subtitle
b = b.replace(
  /subtitle: data\.mySavings\s*\?\s*"Akun simpanan aktif"\s*:\s*"Belum memiliki akun simpanan",/,
  'subtitle: "Akun simpanan aktif",',
);

// Replace data.accountStatus conditionals
b = b.replace(/data\.accountStatus === "Active"/g, "true");

// Replace data.paymentHistory
b = b.replace(/data\.paymentHistory/g, "data.paymentTrend");

fs.writeFileSync("Frontend/src/app/(home)/page.tsx", b);
