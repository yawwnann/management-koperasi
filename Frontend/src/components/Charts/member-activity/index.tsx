"use client";

import React from "react";
import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";

const Chart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

interface MemberActivityChartProps {
  data: {
    angkatan: string[];
    members: number[];
    savings: number[];
  };
}

export function MemberActivityChart({ data }: MemberActivityChartProps) {
  // Sort data by year (ascending order)
  const sortedData = React.useMemo(() => {
    const combined = data.angkatan.map((angkatan, index) => ({
      angkatan,
      members: data.members[index],
      savings: data.savings[index],
    }));
    
    combined.sort((a, b) => parseInt(a.angkatan) - parseInt(b.angkatan));
    
    return {
      angkatan: combined.map(item => item.angkatan),
      members: combined.map(item => item.members),
      savings: combined.map(item => item.savings),
    };
  }, [data.angkatan, data.members, data.savings]);

  const options: ApexOptions = {
    chart: {
      type: "bar",
      fontFamily: "Satoshi, sans-serif",
      toolbar: {
        show: false,
      },
      stacked: false,
    },
    colors: ["#8099EC", "#3C50E0"],
    series: [
      {
        name: "Jumlah Anggota",
        data: sortedData.members,
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
      categories: sortedData.angkatan,
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
      },
      title: {
        text: "Jumlah Anggota",
        style: {
          fontSize: "12px",
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
    },
    tooltip: {
      theme: "light",
      y: {
        formatter: (value) => {
          return `${value} anggota`;
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
          Aktivitas Anggota per Angkatan
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Distribusi anggota berdasarkan angkatan
        </p>
      </div>
      <div>
        <Chart
          options={options}
          series={options.series}
          type="bar"
          height={350}
        />
      </div>
    </div>
  );
}
