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
  totalAmount?: number;
}

export function SavingsBreakdownChart({
  data,
  totalAmount,
}: SavingsBreakdownChartProps) {
  const total = data.pokok + data.wajib + data.sukarela;
  const displayTotal = typeof totalAmount === "number" ? totalAmount : total;

  const formatNumber = (value: number, maxFractionDigits = 2) => {
    return new Intl.NumberFormat("id-ID", {
      minimumFractionDigits: 0,
      maximumFractionDigits: maxFractionDigits,
    }).format(value);
  };

  const formatRupiahCompact = (value: number) => {
    const absValue = Math.abs(value);

    if (absValue >= 1_000_000_000_000) {
      return `Rp ${formatNumber(value / 1_000_000_000_000)} T`;
    }
    if (absValue >= 1_000_000_000) {
      return `Rp ${formatNumber(value / 1_000_000_000)} M`;
    }
    if (absValue >= 1_000_000) {
      return `Rp ${formatNumber(value / 1_000_000)} Jt`;
    }
    if (absValue >= 1_000) {
      return `Rp ${formatNumber(value / 1_000)} Rb`;
    }

    return `Rp ${formatNumber(value, 0)}`;
  };

  const options: ApexOptions = {
    chart: {
      type: "donut",
      fontFamily: "Satoshi, sans-serif",
    },
    colors: ["#3C50E0", "#8099EC", "#F59E0B"],
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
                return formatRupiahCompact(numVal);
              },
            },
            total: {
              show: true,
              label: "Total Simpanan",
              fontSize: "14px",
              fontWeight: 500,
              formatter: () => {
                return formatRupiahCompact(displayTotal);
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
          const percentage =
            total > 0 ? ((value / total) * 100).toFixed(1) : "0";
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
