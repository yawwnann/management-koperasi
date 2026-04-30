"use client";

import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";

const Chart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

interface PaymentHistoryChartProps {
  data: {
    labels: string[];
    amounts: number[];
  };
}

export function PaymentHistoryChart({ data }: PaymentHistoryChartProps) {
  const options: ApexOptions = {
    chart: {
      type: "bar",
      fontFamily: "Satoshi, sans-serif",
      toolbar: {
        show: false,
      },
    },
    colors: ["#3C50E0"],
    series: [
      {
        name: "Pembayaran",
        data: data.amounts,
      },
    ],
    plotOptions: {
      bar: {
        horizontal: false,
        borderRadius: 8,
        columnWidth: "60%",
      },
    },
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
          if (value >= 1000000) {
            return `Rp ${(value / 1000000).toFixed(0)}jt`;
          }
          return `Rp ${(value / 1000).toFixed(0)}rb`;
        },
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
    dataLabels: {
      enabled: true,
      style: {
        fontSize: "12px",
        fontWeight: 600,
      },
      formatter: (val: number | number[]) => {
        const value = Array.isArray(val) ? val[0] : val;
        if (typeof value === 'number' && value >= 1000000) {
          return `${(value / 1000000).toFixed(1)}jt`;
        }
        return `${typeof value === 'number' ? (value / 1000).toFixed(0) : '0'}rb`;
      },
    },
    tooltip: {
      theme: "light",
      y: {
        formatter: (value) => {
          return `Rp ${value.toLocaleString("id-ID")}`;
        },
      },
    },
    legend: {
      show: false,
    },
  };

  return (
    <div className="rounded-2xl border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-dark dark:text-white">
          Riwayat Pembayaran Saya
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Total pembayaran 6 bulan terakhir
        </p>
      </div>
      <div>
        <Chart
          options={options}
          series={options.series}
          type="bar"
          height={300}
        />
      </div>
    </div>
  );
}
