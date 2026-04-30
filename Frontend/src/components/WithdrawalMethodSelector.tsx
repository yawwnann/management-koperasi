"use client";

import React from "react";
import { Shield, ClipboardList, Heart, CheckCircle2 } from "lucide-react";

export type SavingType = "Pokok" | "Wajib" | "Sukarela";

interface SavingTypeSelectorProps {
  selectedType: SavingType | null;
  onTypeChange: (type: SavingType) => void;
  disabled?: boolean;
  balances?: {
    pokok: number;
    wajib: number;
    sukarela: number;
  };
}

export function SavingTypeSelector({
  selectedType,
  onTypeChange,
  disabled = false,
  balances,
}: SavingTypeSelectorProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const types: {
    value: SavingType;
    label: string;
    icon: React.ReactNode;
    description: string;
  }[] = [
    {
      value: "Pokok",
      label: "Simpanan Pokok",
      icon: <Shield className="h-6 w-6" />,
      description: "Simpanan dasar keanggotaan",
    },
    {
      value: "Wajib",
      label: "Simpanan Wajib",
      icon: <ClipboardList className="h-6 w-6" />,
      description: "Simpanan rutin bulanan",
    },
    {
      value: "Sukarela",
      label: "Simpanan Sukarela",
      icon: <Heart className="h-6 w-6" />,
      description: "Simpanan tambahan fleksibel",
    },
  ];

  return (
    <div className="space-y-3">
      {types.map((type) => {
        const isSelected = selectedType === type.value;
        const balance = balances
          ? balances[type.value.toLowerCase() as keyof typeof balances]
          : 0;

        return (
          <button
            key={type.value}
            type="button"
            onClick={() => !disabled && onTypeChange(type.value)}
            disabled={disabled}
            className={`w-full rounded-lg border-2 p-4 text-left transition-all ${
              isSelected
                ? "border-primary bg-primary/5 dark:bg-primary/10"
                : "border-stroke bg-white hover:border-primary/50 dark:border-strokedark dark:bg-boxdark dark:hover:border-primary/50"
            } ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
          >
            <div className="flex items-center gap-3">
              <span
                className={`${
                  isSelected
                    ? "text-primary dark:text-primary"
                    : "text-gray-600 dark:text-gray-400"
                }`}
              >
                {type.icon}
              </span>
              <div className="flex-1">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`font-medium ${
                          isSelected
                            ? "text-primary dark:text-primary"
                            : "text-dark dark:text-white"
                        }`}
                      >
                        {type.label}
                      </span>
                      {isSelected && (
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                      )}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {type.description}
                    </p>
                  </div>
                  {balances && (
                    <div className="text-right">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Saldo tersedia
                      </p>
                      <p
                        className={`text-sm font-semibold ${
                          balance > 0
                            ? "text-blue-600 dark:text-blue-400"
                            : "text-gray-400"
                        }`}
                      >
                        {formatCurrency(balance)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
