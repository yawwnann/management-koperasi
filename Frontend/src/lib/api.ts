/**
 * API Client Functions
 * Clean interface for pages to call APIs through the handler
 * Updated to support refresh token flow with httpOnly cookies
 */

import { apiHandler } from "@/mock/handler";
import { ApiResponse } from "@/types/api.types";

// ==================== AUTH ====================

export const authApi = {
  login: async (email: string, password: string): Promise<ApiResponse> => {
    // Call login endpoint directly with credentials to receive refresh token cookie
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000/api";
    const response = await fetch(`${baseUrl}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // Important: receives refresh token cookie
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Login failed");
    }

    const data = await response.json();

    // Store access_token and user data from response
    if (data.access_token) {
      if (typeof window !== "undefined") {
        localStorage.setItem("auth_token", data.access_token);
        if (data.user) {
          localStorage.setItem("current_user", JSON.stringify(data.user));
        }
      }
    }

    return {
      success: true,
      data: data,
    };
  },

  refresh: async (): Promise<ApiResponse> => {
    // Call refresh endpoint - backend reads refresh token from httpOnly cookie
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000/api"}/auth/refresh`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Sends refresh token cookie
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Token refresh failed");
    }

    const data = await response.json();

    // Store new access_token
    if (data.access_token) {
      if (typeof window !== "undefined") {
        localStorage.setItem("auth_token", data.access_token);
      }
    }

    return {
      success: true,
      data: data,
    };
  },

  me: (): Promise<ApiResponse> => {
    return apiHandler("/auth/me", "GET");
  },

  logout: async (): Promise<ApiResponse> => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;

    // Call backend logout to invalidate refresh token and clear cookie
    try {
      await apiHandler("/auth/logout", "POST", { refresh_token: token || "" });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Always clear local storage
      if (typeof window !== "undefined") {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("current_user");
      }
    }

    return { success: true, data: { message: "Logged out successfully" } };
  },

  logoutAll: async (): Promise<ApiResponse> => {
    // Logout from all devices
    try {
      await apiHandler("/auth/logout-all", "POST", {});
    } catch (error) {
      console.error("Logout all error:", error);
    } finally {
      // Always clear local storage
      if (typeof window !== "undefined") {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("current_user");
      }
    }

    return {
      success: true,
      data: { message: "Logged out from all devices successfully" },
    };
  },
};

// ==================== USERS ====================

export const usersApi = {
  getList: (): Promise<ApiResponse> => {
    return apiHandler("/users", "GET");
  },

  getById: (id: string): Promise<ApiResponse> => {
    return apiHandler(`/users/${id}`, "GET");
  },

  create: (data: any): Promise<ApiResponse> => {
    return apiHandler("/users", "POST", data);
  },

  update: (id: string, data: any): Promise<ApiResponse> => {
    return apiHandler(`/users/${id}`, "PATCH", data);
  },

  delete: (id: string): Promise<ApiResponse> => {
    return apiHandler(`/users/${id}`, "DELETE");
  },

  updatePhoto: (id: string, formData: FormData): Promise<ApiResponse> => {
    return apiHandler(`/users/${id}/photo`, "PATCH", formData, undefined, true);
  },

  deletePhoto: (id: string): Promise<ApiResponse> => {
    return apiHandler(`/users/${id}/photo`, "DELETE");
  },
};

// ==================== PAYMENTS ====================

export const paymentsApi = {
  getList: (queryParams?: Record<string, string>): Promise<ApiResponse> => {
    return apiHandler("/payments", "GET", undefined, queryParams);
  },

  getById: (id: string): Promise<ApiResponse> => {
    return apiHandler(`/payments/${id}`, "GET");
  },

  create: (formData: FormData): Promise<ApiResponse> => {
    return apiHandler("/payments", "POST", formData, undefined, true);
  },

  approve: (id: string, data: any): Promise<ApiResponse> => {
    return apiHandler(`/payments/${id}/approve`, "PATCH", data);
  },
};

// ==================== WITHDRAWALS ====================

export const withdrawalsApi = {
  getList: (queryParams?: Record<string, string>): Promise<ApiResponse> => {
    return apiHandler("/withdrawals", "GET", undefined, queryParams);
  },

  getById: (id: string): Promise<ApiResponse> => {
    return apiHandler(`/withdrawals/${id}`, "GET");
  },

  create: (data: any): Promise<ApiResponse> => {
    return apiHandler("/withdrawals", "POST", data);
  },

  approve: (id: string, data: any): Promise<ApiResponse> => {
    return apiHandler(`/withdrawals/${id}/approve`, "PATCH", data);
  },
};

// ==================== SAVINGS ====================

export const savingsApi = {
  getMySavings: (): Promise<ApiResponse> => {
    return apiHandler("/savings/me", "GET");
  },

  getSavingsBreakdown: (): Promise<ApiResponse> => {
    return apiHandler("/savings/me/breakdown", "GET");
  },

  getSavingsChart: (): Promise<ApiResponse> => {
    return apiHandler("/savings/me/chart", "GET");
  },

  getAllSavings: (): Promise<ApiResponse> => {
    return apiHandler("/savings", "GET");
  },
};

// ==================== PROFILE ====================

export const profileApi = {
  getMyProfile: (): Promise<ApiResponse> => {
    return apiHandler("/auth/me", "GET");
  },

  updateProfile: (data: any): Promise<ApiResponse> => {
    return apiHandler("/users/me", "PATCH", data);
  },

  updateProfilePhoto: (formData: FormData): Promise<ApiResponse> => {
    return apiHandler("/users/me/photo", "PATCH", formData, undefined, true);
  },
};

// ==================== DASHBOARD ====================

export const dashboardApi = {
  getDashboard: (): Promise<ApiResponse> => {
    return apiHandler("/dashboard", "GET");
  },
};

// ==================== FAKULTAS ====================

export const fakultasApi = {
  getAllFakultas: (): Promise<ApiResponse> => {
    return apiHandler("/fakultas", "GET");
  },

  getFakultasList: (): Promise<ApiResponse> => {
    return apiHandler("/fakultas/list", "GET");
  },

  getJurusanByFakultas: (fakultas: string): Promise<ApiResponse> => {
    return apiHandler("/fakultas/jurusan", "GET", undefined, { fakultas });
  },
};

// ==================== REPORTS ====================

export const reportsApi = {
  getDaily: (date?: string): Promise<ApiResponse> => {
    return apiHandler("/reports/daily", "GET", undefined, { date });
  },

  getAngkatan: (angkatan?: string): Promise<ApiResponse> => {
    return apiHandler("/reports/angkatan", "GET", undefined, { angkatan });
  },

  getSummary: (): Promise<ApiResponse> => {
    return apiHandler("/reports/summary", "GET");
  },
};
