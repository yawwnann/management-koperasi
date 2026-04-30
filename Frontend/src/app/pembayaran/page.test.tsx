import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as fc from "fast-check";
import PembayaranPage from "./page";
import { paymentsApi } from "@/lib/api";
import { PaymentMethod } from "@/components/PaymentMethodSelector";

// Mock the API
jest.mock("@/lib/api", () => ({
  paymentsApi: {
    create: jest.fn(),
  },
}));

// Mock the ProtectedRoute component
jest.mock("@/components/protected-route", () => ({
  ProtectedRoute: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

// Mock the Breadcrumb component
jest.mock("@/components/Breadcrumbs/Breadcrumb", () => {
  return function Breadcrumb() {
    return <div>Breadcrumb</div>;
  };
});

// Mock URL.createObjectURL
global.URL.createObjectURL = jest.fn(() => "mock-url");

describe("PembayaranContent", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Payment method validation", () => {
    // Test that submitting without payment method shows error (Requirements 1.3)
    it("should show error when submitting without payment method", async () => {
      const user = userEvent.setup();

      render(<PembayaranPage />);

      // Fill in payment type
      const paymentTypeSelect = screen.getByLabelText(/Jenis Pembayaran/i);
      await user.selectOptions(paymentTypeSelect, "Simpanan Pokok");

      // Fill in amount
      const amountInput = screen.getByLabelText(/Jumlah Pembayaran/i);
      await user.type(amountInput, "100000");

      // Upload a file
      const file = new File(["dummy content"], "proof.jpg", {
        type: "image/jpeg",
      });
      const fileInput = screen.getByLabelText(/Bukti Pembayaran/i);
      await user.upload(fileInput, file);

      // Do NOT select payment method - intentionally skip this step

      // Submit the form
      const submitButton = screen.getByRole("button", {
        name: /Kirim Pembayaran/i,
      });
      await user.click(submitButton);

      // Verify error message is displayed
      await waitFor(() => {
        expect(
          screen.getByText(/Silakan pilih metode pembayaran/i),
        ).toBeInTheDocument();
      });

      // Verify API was not called
      expect(paymentsApi.create).not.toHaveBeenCalled();
    });

    it("should allow submission when payment method is selected", async () => {
      const user = userEvent.setup();
      (paymentsApi.create as jest.Mock).mockResolvedValue({
        success: true,
        data: { id: "payment-123" },
      });

      render(<PembayaranPage />);

      // Fill in payment type
      const paymentTypeSelect = screen.getByLabelText(/Jenis Pembayaran/i);
      await user.selectOptions(paymentTypeSelect, "Simpanan Pokok");

      // Fill in amount
      const amountInput = screen.getByLabelText(/Jumlah Pembayaran/i);
      await user.type(amountInput, "100000");

      // Select payment method
      const cashButton = screen.getByText("Tunai").closest("button");
      await user.click(cashButton!);

      // Upload a file
      const file = new File(["dummy content"], "proof.jpg", {
        type: "image/jpeg",
      });
      const fileInput = screen.getByLabelText(/Bukti Pembayaran/i);
      await user.upload(fileInput, file);

      // Submit the form
      const submitButton = screen.getByRole("button", {
        name: /Kirim Pembayaran/i,
      });
      await user.click(submitButton);

      // Verify API was called
      await waitFor(() => {
        expect(paymentsApi.create).toHaveBeenCalled();
      });
    });
  });

  describe("Property 11: Payment submission includes payment method in request", () => {
    /**
     * **Validates: Requirements 6.1**
     *
     * Property: For any payment form submission, the HTTP request payload
     * should include the payment method field.
     */
    it("should include payment method in request payload for any valid submission", async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate random valid payment data
          fc.constantFrom<PaymentMethod>("Cash", "QRIS", "Bank Transfer"),
          fc.constantFrom(
            "Simpanan Pokok",
            "Simpanan Wajib",
            "Simpanan Sukarela",
          ),
          fc.integer({ min: 10000, max: 1000000 }),
          async (paymentMethod, paymentType, amount) => {
            // Clear mocks before each iteration
            jest.clearAllMocks();

            const user = userEvent.setup();
            (paymentsApi.create as jest.Mock).mockResolvedValue({
              success: true,
              data: { id: "payment-123" },
            });

            const { unmount } = render(<PembayaranPage />);

            try {
              // Fill in payment type
              const paymentTypeSelect =
                screen.getByLabelText(/Jenis Pembayaran/i);
              await user.selectOptions(paymentTypeSelect, paymentType);

              // Fill in amount
              const amountInput = screen.getByLabelText(/Jumlah Pembayaran/i);
              await user.clear(amountInput);
              await user.type(amountInput, amount.toString());

              // Select payment method
              const methodLabels: Record<PaymentMethod, string> = {
                Cash: "Tunai",
                QRIS: "QRIS",
                "Bank Transfer": "Transfer Bank",
              };
              const methodButton = screen
                .getByText(methodLabels[paymentMethod])
                .closest("button");
              await user.click(methodButton!);

              // Upload a file
              const file = new File(["dummy content"], "proof.jpg", {
                type: "image/jpeg",
              });
              const fileInput = screen.getByLabelText(/Bukti Pembayaran/i);
              await user.upload(fileInput, file);

              // Submit the form
              const submitButton = screen.getByRole("button", {
                name: /Kirim Pembayaran/i,
              });
              await user.click(submitButton);

              // Wait for API call
              await waitFor(() => {
                expect(paymentsApi.create).toHaveBeenCalled();
              });

              // Verify the request payload includes payment method
              const callArgs = (paymentsApi.create as jest.Mock).mock.calls[0];
              const formData = callArgs[0] as FormData;

              // Verify FormData contains paymentMethod
              expect(formData.get("paymentMethod")).toBe(paymentMethod);

              // Also verify other required fields are present
              expect(formData.get("nominal")).toBe(amount.toString());
              expect(formData.get("description")).toBe(paymentType);
              expect(formData.get("proofImage")).toBeInstanceOf(File);
            } finally {
              unmount();
            }
          },
        ),
        { numRuns: 20 }, // Reduced for performance
      );
    }, 60000); // Increase timeout for property test
  });
});
