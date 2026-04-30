"use client";

import React from "react";
import { Banknote, Smartphone, Building2, CheckCircle2 } from "lucide-react";

export type PaymentMethod = "Cash" | "QRIS" | "Bank Transfer";

interface PaymentMethodSelectorProps {
  selectedMethod: PaymentMethod | null;
  onMethodChange: (method: PaymentMethod) => void;
  disabled?: boolean;
}

export function PaymentMethodSelector({
  selectedMethod,
  onMethodChange,
  disabled = false,
}: PaymentMethodSelectorProps) {
  const methods: {
    value: PaymentMethod;
    label: string;
    icon: React.ReactNode;
  }[] = [
    {
      value: "Cash",
      label: "Tunai",
      icon: <Banknote className="h-6 w-6" />,
    },
    { value: "QRIS", label: "QRIS", icon: <Smartphone className="h-6 w-6" /> },
    {
      value: "Bank Transfer",
      label: "Transfer Bank",
      icon: <Building2 className="h-6 w-6" />,
    },
  ];

  return (
    <div className="space-y-3">
      {methods.map((method) => {
        const isSelected = selectedMethod === method.value;
        return (
          <button
            key={method.value}
            type="button"
            onClick={() => !disabled && onMethodChange(method.value)}
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
                {method.icon}
              </span>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`font-medium ${
                      isSelected
                        ? "text-primary dark:text-primary"
                        : "text-dark dark:text-white"
                    }`}
                  >
                    {method.label}
                  </span>
                  {isSelected && (
                    <CheckCircle2 className="h-5 w-5 text-primary" />
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
