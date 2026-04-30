import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as fc from "fast-check";
import VerifikasiPembayaranPage from "./page";
import { paymentsApi } from "@/lib/api";

// Mock the API
jest.mock("@/lib/api", () => ({
  paymentsApi: {
    getList: jest.fn(),
    approve: jest.fn(),
  },
}));

// Mock the ProtectedRoute component
jest.mock("@/components/protected-route", () => ({
  ProtectedRoute: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

// Mock Next.js Link component
jest.mock("next/link", () => {
  return function Link({ children, href }: any) {
    return <a href={href}>{children}</a>;
  };
});

describe("VerifikasiPembayaranContent", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Property 7: Admin view includes payment method", () => {
    /**
     * **Validates: Requirements 4.1**
     *
     * Property: For any payment record viewed by an admin, the rendered view
     * should include the payment method information.
     */
    it("should display payment method in detail modal for any payment record", async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate random payment data
          fc.constantFrom("Cash", "QRIS", "BankTransfer"),
          fc
            .string({ minLength: 5, maxLength: 20 })
            .filter((s) => s.trim().length > 0), // Ensure non-empty username
          fc.integer({ min: 10000, max: 1000000 }),
          fc.constantFrom(
            "Simpanan Pokok",
            "Simpanan Wajib",
            "Simpanan Sukarela",
          ),
          async (paymentMethod, userName, nominal, type) => {
            const mockPayment = {
              id: `payment-${Math.random()}`,
              userId: "user-123",
              userName: userName.trim(),
              userAvatar: userName.trim().charAt(0).toUpperCase(),
              nominal,
              type,
              paymentMethod,
              proofUrl: "https://example.com/proof.jpg",
              status: "PENDING",
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };

            (paymentsApi.getList as jest.Mock).mockResolvedValue({
              success: true,
              data: [
                {
                  id: mockPayment.id,
                  userId: mockPayment.userId,
                  nominal: mockPayment.nominal,
                  description: mockPayment.type,
                  paymentMethod: mockPayment.paymentMethod,
                  proofImage: mockPayment.proofUrl,
                  status: mockPayment.status,
                  createdAt: mockPayment.createdAt,
                  updatedAt: mockPayment.updatedAt,
                  user: {
                    name: mockPayment.userName,
                  },
                },
              ],
            });

            const user = userEvent.setup();
            const { unmount } = render(<VerifikasiPembayaranPage />);

            try {
              // Wait for payments to load
              await waitFor(() => {
                expect(
                  screen.getByText(mockPayment.userName),
                ).toBeInTheDocument();
              });

              // Click on the approve button to open the modal
              const approveButton = screen.getByText("Setujui");
              await user.click(approveButton);

              // Wait for modal to appear
              await waitFor(() => {
                expect(
                  screen.getByText("Verifikasi Pembayaran"),
                ).toBeInTheDocument();
              });

              // Verify payment method is displayed in the modal
              expect(screen.getByText("Metode Pembayaran")).toBeInTheDocument();
              expect(screen.getByText(paymentMethod)).toBeInTheDocument();
            } finally {
              unmount();
            }
          },
        ),
        { numRuns: 20 }, // Reduced for performance
      );
    }, 60000);
  });

  describe("Property 8: Payment list includes payment methods", () => {
    /**
     * **Validates: Requirements 4.2**
     *
     * Property: For any list of payments displayed to admin, each payment item
     * should include its payment method.
     */
    it("should display payment method for each payment in the list", async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate a list of random payments
          fc.array(
            fc.record({
              id: fc.string({ minLength: 5 }),
              userName: fc
                .string({ minLength: 5, maxLength: 20 })
                .filter((s) => s.trim().length > 0),
              nominal: fc.integer({ min: 10000, max: 1000000 }),
              type: fc.constantFrom(
                "Simpanan Pokok",
                "Simpanan Wajib",
                "Simpanan Sukarela",
              ),
              paymentMethod: fc.constantFrom("Cash", "QRIS", "BankTransfer"),
            }),
            { minLength: 1, maxLength: 3 }, // Reduced for performance
          ),
          async (payments) => {
            const mockPaymentsData = payments.map((p) => ({
              id: p.id,
              userId: "user-123",
              nominal: p.nominal,
              description: p.type,
              paymentMethod: p.paymentMethod,
              proofImage: "https://example.com/proof.jpg",
              status: "PENDING",
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              user: {
                name: p.userName.trim(),
              },
            }));

            (paymentsApi.getList as jest.Mock).mockResolvedValue({
              success: true,
              data: mockPaymentsData,
            });

            const { unmount } = render(<VerifikasiPembayaranPage />);

            try {
              // Wait for payments to load and table to render
              await waitFor(
                () => {
                  expect(paymentsApi.getList).toHaveBeenCalled();
                  // Wait for at least one payment to be visible
                  expect(
                    screen.getByText(payments[0].userName.trim()),
                  ).toBeInTheDocument();
                },
                { timeout: 5000 },
              );

              // Verify each payment method is displayed in the table
              for (const payment of payments) {
                // Check that the payment method is displayed
                const paymentMethodElements = screen.queryAllByText(
                  payment.paymentMethod,
                );
                expect(paymentMethodElements.length).toBeGreaterThan(0);
              }
            } finally {
              unmount();
            }
          },
        ),
        { numRuns: 10 }, // Reduced for performance
      );
    }, 60000);
  });
});
