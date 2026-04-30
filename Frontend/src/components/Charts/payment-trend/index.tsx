"use client";

import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";

const Chart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

interface PaymentTrendChartProps {
  data: {
    labels: string[];
    payments: number[];
    withdrawals: number[];
  };
}

export function PaymentTrendChart({ data }: PaymentTrendChartProps) {
  const options: ApexOptions = {
    chart: {
      type: "line",
      fontFamily: "Satoshi, sans-serif",
      toolbar: {
        show: false,
      },
      zoom: {
        enabled: false,
      },
    },
    colors: ["#8099EC", "#3C50E0"],
    series: [
      {
        name: "Pembayaran",
        data: data.payments,
      },
      {
        name: "Penarikan",
        data: data.withdrawals,
      },
    ],
    xaxis: {
      categories: data.labels,
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      labels: {
        style: {
          fontSize: "12px",
        },
      },
    },
    yaxis: {
      labels: {
        style: {
          fontSize: "12px",
        },
        formatter: (value) => {
          return `Rp ${(value / 1000000).toFixed(0)}jt`;
        },
      },
    },
    stroke: {
      curve: "smooth",
      width: [3, 3],
    },
    markers: {
      size: 5,
      strokeWidth: 2,
      hover: {
        size: 7,
      },
    },
    grid: {
      strokeDashArray: 3,
      borderColor: "#E6EBF1",
      padding: {
        left: 20,
        right: 20,
      },
    },
    legend: {
      position: "top",
      horizontalAlign: "left",
      fontSize: "14px",
      fontWeight: 500,
    },
    tooltip: {
      theme: "light",
      y: {
        formatter: (value) => {
          return `Rp ${value.toLocaleString("id-ID")}`;
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
  };

  return (
    <div className="rounded-2xl border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-dark dark:text-white">
            Tren Pembayaran & Penarikan
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            6 bulan terakhir
          </p>
        </div>
      </div>
      <div>
        <Chart
          options={options}
          series={options.series}
          type="line"
          height={350}
        />
      </div>
    </div>
  );
}
