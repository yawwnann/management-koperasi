"use client";

import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";

const Chart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

interface SavingsBreakdownChartProps {
  data: {
    pokok: number;
    wajib: number;
    sukarela: number;
  };
}

export function SavingsBreakdownChart({ data }: SavingsBreakdownChartProps) {
  const total = data.pokok + data.wajib + data.sukarela;
  
  const options: ApexOptions = {
    chart: {
      type: "donut",
      fontFamily: "Satoshi, sans-serif",
    },
    colors: ["#3C50E0", "#22AD5C", "#F59E0B"],
    series: [data.pokok, data.wajib, data.sukarela],
    labels: ["Simpanan Pokok", "Simpanan Wajib", "Simpanan Sukarela"],
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
              fontSize: "20px",
              fontWeight: 600,
              formatter: (val) => {
                const numVal = parseFloat(val.replace(/[^0-9.-]+/g, ""));
                return `Rp ${numVal.toLocaleString("id-ID")}`;
              },
            },
            total: {
              show: true,
              label: "Total Simpanan",
              fontSize: "14px",
              fontWeight: 500,
              formatter: () => {
                return `Rp ${(total / 1000000).toFixed(1)}jt`;
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
          return `Rp ${value.toLocaleString("id-ID")} (${percentage}%)`;
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
          Komposisi Simpanan
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Breakdown jenis simpanan anggota
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
