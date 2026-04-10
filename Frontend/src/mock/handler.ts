/**
 * API Handler
 * Routes requests to either mock data or real API based on NEXT_PUBLIC_MOCK environment variable
 */

import { ENDPOINTS, API_BASE_URL, EndpointConfig } from "@/lib/apiConfig";
import * as mockData from "@/mock";
import { getProfileByUserId, updateProfile } from "@/mock/data/profile.mock";
import { ApiResponse, ApiError } from "@/types/api.types";

// Check if mock mode is enabled (accept several truthy string formats)
const MOCK_FLAG = (process.env.NEXT_PUBLIC_MOCK ?? "").trim().toLowerCase();
const USE_MOCK = ["true", "1", "yes", "on"].includes(MOCK_FLAG);

console.log(
  `[API Handler] NEXT_PUBLIC_MOCK=${JSON.stringify(process.env.NEXT_PUBLIC_MOCK)} | Mode: ${USE_MOCK ? "MOCK" : "REAL API"}`,
);

/**
 * Simulates network delay
 * @param ms Delay in milliseconds (default: 500ms)
 */
const delay = (ms: number = 500) =>
  new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Creates mock error response
 */
const createMockError = (statusCode: number, message: string): ApiError => ({
  success: false,
  error: {
    message,
    statusCode,
  },
});

/**
 * Creates mock success response
 */
const createMockResponse = <T>(data: T, message?: string): ApiResponse<T> => ({
  success: true,
  data,
  message,
});

/**
 * Creates mock error response as ApiResponse
 */
const createMockErrorResponse = (
  statusCode: number,
  message: string,
): ApiResponse => ({
  success: false,
  data: { message, statusCode } as any,
});

/**
 * Gets auth token from headers or storage
 */
const getAuthToken = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("auth_token");
  }
  return null;
};

/**
 * Creates headers for real API requests
 */
const createHeaders = (token?: string | null): HeadersInit => {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
};

/**
 * Handles authentication requests
 */
async function handleAuthLogin(credentials: {
  email: string;
  password: string;
}): Promise<ApiResponse> {
  if (USE_MOCK) {
    await delay();
    const response = mockData.handleLogin(credentials);
    return response.success
      ? createMockResponse(response.data, "Login successful")
      : createMockErrorResponse(401, response.error || "Invalid credentials");
  }

  // Real API call
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: createHeaders(),
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Login failed");
  }

  return response.json();
}

/**
 * Handles get current user
 */
async function handleAuthMe(): Promise<ApiResponse> {
  if (USE_MOCK) {
    await delay();
    const token = getAuthToken();
    const response = mockData.handleAuthMe(token);
    return response.success
      ? createMockResponse(response.data)
      : createMockErrorResponse(401, response.error || "Not authenticated");
  }

  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    method: "GET",
    headers: createHeaders(token),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to get user data");
  }

  return response.json();
}

/**
 * Handles users list
 */
async function handleUsersList(): Promise<ApiResponse> {
  if (USE_MOCK) {
    await delay();
    const users = mockData.getUsersList();
    return createMockResponse(users);
  }

  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/users`, {
    method: "GET",
    headers: createHeaders(token),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to fetch users");
  }

  return response.json();
}

/**
 * Handles get single user
 */
async function handleGetUser(id: string): Promise<ApiResponse> {
  if (USE_MOCK) {
    await delay();
    const user = mockData.getUserById(id);
    if (!user) {
      return createMockErrorResponse(404, "User not found");
    }
    return createMockResponse(user);
  }

  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/users/${id}`, {
    method: "GET",
    headers: createHeaders(token),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to fetch user");
  }

  return response.json();
}

/**
 * Handles create user
 */
async function handleCreateUser(userData: any): Promise<ApiResponse> {
  if (USE_MOCK) {
    await delay();
    const response = mockData.createUser(userData);
    return response.success
      ? createMockResponse(response.data, "User created successfully")
      : createMockErrorResponse(400, response.error || "Failed to create user");
  }

  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/users`, {
    method: "POST",
    headers: createHeaders(token),
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to create user");
  }

  return response.json();
}

/**
 * Handles update user
 */
async function handleUpdateUser(
  id: string,
  userData: any,
): Promise<ApiResponse> {
  if (USE_MOCK) {
    await delay();
    const response = mockData.updateUser(id, userData);
    return response.success
      ? createMockResponse(response.data, "User updated successfully")
      : createMockErrorResponse(400, response.error || "Failed to update user");
  }

  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/users/${id}`, {
    method: "PATCH",
    headers: createHeaders(token),
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to update user");
  }

  return response.json();
}

/**
 * Handles delete user
 */
async function handleDeleteUser(id: string): Promise<ApiResponse> {
  if (USE_MOCK) {
    await delay();
    const response = mockData.deleteUser(id);
    return response.success
      ? createMockResponse(null, "User deleted successfully")
      : createMockErrorResponse(400, response.error || "Failed to delete user");
  }

  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/users/${id}`, {
    method: "DELETE",
    headers: createHeaders(token),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to delete user");
  }

  return response.json();
}

/**
 * Handles payments list
 */
async function handlePaymentsList(
  queryParams?: Record<string, string>,
): Promise<ApiResponse> {
  if (USE_MOCK) {
    await delay();
    const payments = mockData.getPaymentsList(queryParams);
    return createMockResponse(payments);
  }

  const token = getAuthToken();
  const queryString = queryParams
    ? `?${new URLSearchParams(queryParams).toString()}`
    : "";
  const response = await fetch(`${API_BASE_URL}/payments${queryString}`, {
    method: "GET",
    headers: createHeaders(token),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to fetch payments");
  }

  return response.json();
}

/**
 * Handles get single payment
 */
async function handleGetPayment(id: string): Promise<ApiResponse> {
  if (USE_MOCK) {
    await delay();
    const payment = mockData.getPaymentById(id);
    if (!payment) {
      return createMockErrorResponse(404, "Payment not found");
    }
    return createMockResponse(payment);
  }

  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/payments/${id}`, {
    method: "GET",
    headers: createHeaders(token),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to fetch payment");
  }

  return response.json();
}

/**
 * Handles create payment
 */
async function handleCreatePayment(paymentData: any): Promise<ApiResponse> {
  if (USE_MOCK) {
    await delay();
    const response = mockData.createPayment(paymentData);
    return response.success
      ? createMockResponse(response.data, "Payment created successfully")
      : createMockErrorResponse(
          400,
          response.error || "Failed to create payment",
        );
  }

  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/payments`, {
    method: "POST",
    headers: createHeaders(token),
    body: JSON.stringify(paymentData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to create payment");
  }

  return response.json();
}

/**
 * Handles approve/reject payment
 */
async function handleApprovePayment(
  id: string,
  approvalData: any,
): Promise<ApiResponse> {
  if (USE_MOCK) {
    await delay();
    const response = mockData.approvePayment(id, approvalData);
    return response.success
      ? createMockResponse(response.data, "Payment approved successfully")
      : createMockErrorResponse(
          400,
          response.error || "Failed to approve payment",
        );
  }

  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/payments/${id}/approve`, {
    method: "PATCH",
    headers: createHeaders(token),
    body: JSON.stringify(approvalData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to approve payment");
  }

  return response.json();
}

/**
 * Handles withdrawals list
 */
async function handleWithdrawalsList(
  queryParams?: Record<string, string>,
): Promise<ApiResponse> {
  if (USE_MOCK) {
    await delay();
    const withdrawals = mockData.getWithdrawalsList(queryParams);
    return createMockResponse(withdrawals);
  }

  const token = getAuthToken();
  const queryString = queryParams
    ? `?${new URLSearchParams(queryParams).toString()}`
    : "";
  const response = await fetch(`${API_BASE_URL}/withdrawals${queryString}`, {
    method: "GET",
    headers: createHeaders(token),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to fetch withdrawals");
  }

  return response.json();
}

/**
 * Handles get single withdrawal
 */
async function handleGetWithdrawal(id: string): Promise<ApiResponse> {
  if (USE_MOCK) {
    await delay();
    const withdrawal = mockData.getWithdrawalById(id);
    if (!withdrawal) {
      return createMockErrorResponse(404, "Withdrawal not found");
    }
    return createMockResponse(withdrawal);
  }

  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/withdrawals/${id}`, {
    method: "GET",
    headers: createHeaders(token),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to fetch withdrawal");
  }

  return response.json();
}

/**
 * Handles create withdrawal
 */
async function handleCreateWithdrawal(
  withdrawalData: any,
): Promise<ApiResponse> {
  if (USE_MOCK) {
    await delay();
    const response = mockData.createWithdrawal(withdrawalData);
    return response.success
      ? createMockResponse(response.data, "Withdrawal created successfully")
      : createMockErrorResponse(
          400,
          response.error || "Failed to create withdrawal",
        );
  }

  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/withdrawals`, {
    method: "POST",
    headers: createHeaders(token),
    body: JSON.stringify(withdrawalData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to create withdrawal");
  }

  return response.json();
}

/**
 * Handles approve/reject withdrawal
 */
async function handleApproveWithdrawal(
  id: string,
  approvalData: any,
): Promise<ApiResponse> {
  if (USE_MOCK) {
    await delay();
    const response = mockData.approveWithdrawal(id, approvalData);
    return response.success
      ? createMockResponse(response.data, "Withdrawal approved successfully")
      : createMockErrorResponse(
          400,
          response.error || "Failed to approve withdrawal",
        );
  }

  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/withdrawals/${id}/approve`, {
    method: "PATCH",
    headers: createHeaders(token),
    body: JSON.stringify(approvalData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to approve withdrawal");
  }

  return response.json();
}

/**
 * Handles get current user savings
 */
async function handleMySavings(): Promise<ApiResponse> {
  if (USE_MOCK) {
    await delay();
    const token = getAuthToken();
    const savings = mockData.getMySavings(token);
    if (!savings) {
      return createMockErrorResponse(404, "Savings not found");
    }
    return createMockResponse(savings);
  }

  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/savings/me`, {
    method: "GET",
    headers: createHeaders(token),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to fetch savings");
  }

  return response.json();
}

/**
 * Handles all users savings
 */
async function handleAllSavings(): Promise<ApiResponse> {
  if (USE_MOCK) {
    await delay();
    const savings = mockData.getAllSavings();
    return createMockResponse(savings);
  }

  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/savings`, {
    method: "GET",
    headers: createHeaders(token),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to fetch all savings");
  }

  return response.json();
}

/**
 * Handles profile - get current user's profile
 */
async function handleMyProfile(): Promise<ApiResponse> {
  if (USE_MOCK) {
    await delay();
    
    // Get current user from auth mock
    const authResponse = mockData.handleAuthMe("");
    if (!authResponse || !('data' in authResponse) || !authResponse.data) {
      return createMockErrorResponse(401, "Unauthorized");
    }

    const userId = authResponse.data.id;
    const profile = getProfileByUserId(userId);

    if (!profile) {
      return createMockErrorResponse(404, "Profile not found");
    }

    return createMockResponse(profile, "Profile retrieved successfully");
  }

  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/profile/me`, {
    method: "GET",
    headers: createHeaders(token),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to fetch profile");
  }

  return response.json();
}

/**
 * Handles profile update
 */
async function handleUpdateMyProfile(data: any): Promise<ApiResponse> {
  if (USE_MOCK) {
    await delay();
    
    // Get current user from auth mock
    const authResponse = mockData.handleAuthMe("");
    if (!authResponse || !('data' in authResponse) || !authResponse.data) {
      return createMockErrorResponse(401, "Unauthorized");
    }

    const userId = authResponse.data.id;
    const profile = updateProfile(userId, data);

    if (!profile) {
      return createMockErrorResponse(404, "Profile not found");
    }

    return createMockResponse(profile, "Profile updated successfully");
  }

  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/profile/me`, {
    method: "PATCH",
    headers: {
      ...createHeaders(token),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to update profile");
  }

  return response.json();
}

/**
 * Handles daily report
 */
async function handleDailyReport(date?: string): Promise<ApiResponse> {
  if (USE_MOCK) {
    await delay();
    const report = mockData.getDailyReport(date);
    return createMockResponse(report);
  }

  const token = getAuthToken();
  const queryString = date ? `?date=${date}` : "";
  const response = await fetch(`${API_BASE_URL}/reports/daily${queryString}`, {
    method: "GET",
    headers: createHeaders(token),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to fetch daily report");
  }

  return response.json();
}

/**
 * Handles angkatan (cohort) report
 */
async function handleAngkatanReport(angkatan?: string): Promise<ApiResponse> {
  if (USE_MOCK) {
    await delay();
    const report = mockData.getAngkatanReport(angkatan);
    return createMockResponse(report);
  }

  const token = getAuthToken();
  const queryString = angkatan ? `?angkatan=${angkatan}` : "";
  const response = await fetch(
    `${API_BASE_URL}/reports/angkatan${queryString}`,
    {
      method: "GET",
      headers: createHeaders(token),
    },
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to fetch angkatan report");
  }

  return response.json();
}

/**
 * Handles system summary report
 */
async function handleSummaryReport(): Promise<ApiResponse> {
  if (USE_MOCK) {
    await delay();
    const summary = mockData.getSystemSummary();
    return createMockResponse(summary);
  }

  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/reports/summary`, {
    method: "GET",
    headers: createHeaders(token),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to fetch summary report");
  }

  return response.json();
}

/**
 * Main API handler function
 * Routes requests to appropriate handler based on endpoint
 */
export async function apiHandler(
  endpoint: string,
  method: string = "GET",
  data?: any,
  params?: Record<string, any>,
): Promise<ApiResponse> {
  try {
    // Auth endpoints
    if (endpoint === "/auth/login") {
      return handleAuthLogin(data);
    }
    if (endpoint === "/auth/me") {
      return handleAuthMe();
    }

    // Users endpoints
    if (endpoint === "/users" && method === "GET") {
      return handleUsersList();
    }
    if (endpoint.startsWith("/users/") && method === "GET") {
      const id = endpoint.split("/")[2];
      return handleGetUser(id);
    }
    if (endpoint === "/users" && method === "POST") {
      return handleCreateUser(data);
    }
    if (endpoint.startsWith("/users/") && method === "PATCH") {
      const id = endpoint.split("/")[2];
      return handleUpdateUser(id, data);
    }
    if (endpoint.startsWith("/users/") && method === "DELETE") {
      const id = endpoint.split("/")[2];
      return handleDeleteUser(id);
    }

    // Payments endpoints
    if (endpoint === "/payments" && method === "GET") {
      return handlePaymentsList(params);
    }
    if (
      endpoint.startsWith("/payments/") &&
      !endpoint.includes("/approve") &&
      method === "GET"
    ) {
      const id = endpoint.split("/")[2];
      return handleGetPayment(id);
    }
    if (endpoint === "/payments" && method === "POST") {
      return handleCreatePayment(data);
    }
    if (endpoint.includes("/approve") && method === "PATCH") {
      const id = endpoint.split("/")[2];
      return handleApprovePayment(id, data);
    }

    // Withdrawals endpoints
    if (endpoint === "/withdrawals" && method === "GET") {
      return handleWithdrawalsList(params);
    }
    if (
      endpoint.startsWith("/withdrawals/") &&
      !endpoint.includes("/approve") &&
      method === "GET"
    ) {
      const id = endpoint.split("/")[2];
      return handleGetWithdrawal(id);
    }
    if (endpoint === "/withdrawals" && method === "POST") {
      return handleCreateWithdrawal(data);
    }
    if (endpoint.includes("/approve") && method === "PATCH") {
      const id = endpoint.split("/")[2];
      return handleApproveWithdrawal(id, data);
    }

    // Savings endpoints
    if (endpoint === "/savings/me") {
      return handleMySavings();
    }
    if (endpoint === "/savings") {
      return handleAllSavings();
    }

    // Profile endpoints
    if (endpoint === "/profile/me" && method === "GET") {
      return handleMyProfile();
    }
    if (endpoint === "/profile/me" && method === "PATCH") {
      return handleUpdateMyProfile(data);
    }

    // Reports endpoints
    if (endpoint.startsWith("/reports/daily")) {
      const date = params?.date;
      return handleDailyReport(date);
    }
    if (endpoint.startsWith("/reports/angkatan")) {
      const angkatan = params?.angkatan;
      return handleAngkatanReport(angkatan);
    }
    if (endpoint === "/reports/summary") {
      return handleSummaryReport();
    }

    throw new Error(`Unknown endpoint: ${endpoint}`);
  } catch (error: any) {
    console.error("[API Handler Error]:", error);
    return createMockErrorResponse(
      error.statusCode || 500,
      error.message || "Internal server error",
    );
  }
}
