"use client";

import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";

const Chart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

interface PaymentStatusChartProps {
  data: {
    approved: number;
    pending: number;
    rejected: number;
  };
}

export function PaymentStatusChart({ data }: PaymentStatusChartProps) {
  const total = data.approved + data.pending + data.rejected;
  
  const options: ApexOptions = {
    chart: {
      type: "donut",
      fontFamily: "Satoshi, sans-serif",
    },
    colors: ["#22AD5C", "#F59E0B", "#EF4444"],
    series: [data.approved, data.pending, data.rejected],
    labels: ["Disetujui", "Menunggu", "Ditolak"],
    plotOptions: {
      pie: {
        donut: {
          size: "70%",
          labels: {
            show: true,
            name: {
              show: true,
              fontSize: "14px",
              fontWeight: 500,
            },
            value: {
              show: true,
              fontSize: "24px",
              fontWeight: 600,
              formatter: (val) => {
                return val;
              },
            },
            total: {
              show: true,
              label: "Total",
              fontSize: "14px",
              fontWeight: 500,
              formatter: () => {
                return total.toString();
              },
            },
          },
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    legend: {
      position: "bottom",
      horizontalAlign: "center",
      fontSize: "14px",
      fontWeight: 500,
      itemMargin: {
        horizontal: 10,
        vertical: 5,
      },
    },
    stroke: {
      show: true,
      colors: ["#ffffff"],
      width: 2,
    },
    tooltip: {
      theme: "light",
      y: {
        formatter: (value) => {
          const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : "0";
          return `${value} (${percentage}%)`;
        },
      },
    },
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: {
            width: 300,
          },
          legend: {
            position: "bottom",
          },
        },
      },
    ],
  };

  return (
    <div className="rounded-2xl border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-dark dark:text-white">
          Status Pembayaran
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Distribusi status pembayaran anggota
        </p>
      </div>
      <div className="flex items-center justify-center">
        <Chart
          options={options}
          series={options.series}
          type="donut"
          height={350}
        />
      </div>
    </div>
  );
}
