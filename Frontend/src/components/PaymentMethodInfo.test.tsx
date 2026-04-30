import { render, screen } from "@testing-library/react";
import * as fc from "fast-check";
import { PaymentMethodInfo } from "./PaymentMethodInfo";
import { PaymentMethod } from "./PaymentMethodSelector";

describe("PaymentMethodInfo", () => {
  // Test Cash displays instructions (Requirements 2.1)
  it("should display cash instructions when Cash is selected", () => {
    render(<PaymentMethodInfo method="Cash" />);

    expect(screen.getByText("Instruksi Pembayaran Tunai")).toBeInTheDocument();
    expect(
      screen.getByText(/Silakan datang langsung ke kantor koperasi/i),
    ).toBeInTheDocument();
  });

  // Test QRIS displays image (Requirements 2.2)
  it("should display QRIS image when QRIS is selected", () => {
    render(<PaymentMethodInfo method="QRIS" />);

    expect(screen.getByText("Scan QRIS untuk Pembayaran")).toBeInTheDocument();

    // Check that the image is rendered with correct src
    const image = screen.getByAltText("QRIS Payment Code");
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute("src", expect.stringContaining("qris.jpeg"));
  });

  // Test Bank Transfer displays account number (Requirements 2.3)
  it("should display bank account number when Bank Transfer is selected", () => {
    render(<PaymentMethodInfo method="Bank Transfer" />);

    expect(screen.getByText("Informasi Transfer Bank")).toBeInTheDocument();
    expect(
      screen.getByText(/Silakan transfer ke nomor rekening berikut/i),
    ).toBeInTheDocument();
    expect(screen.getByText("1931879879")).toBeInTheDocument();
  });

  // Test null displays nothing (Requirements 2.4)
  it("should display nothing when no method is selected", () => {
    const { container } = render(<PaymentMethodInfo method={null} />);

    // The component should render nothing (null)
    expect(container.firstChild).toBeNull();
  });

  // Additional test: verify each method displays unique content
  it("should display different content for each payment method", () => {
    const methods: PaymentMethod[] = ["Cash", "QRIS", "Bank Transfer"];

    methods.forEach((method) => {
      const { container, unmount } = render(
        <PaymentMethodInfo method={method} />,
      );

      // Each method should render some content
      expect(container.firstChild).not.toBeNull();

      // Clean up before next iteration
      unmount();
    });
  });

  describe("Property 3: Payment method information display is reactive", () => {
    /**
     * **Validates: Requirements 2.5**
     *
     * Property: For any payment method change, the displayed payment information
     * should update immediately to show the correct information for the newly
     * selected method.
     */
    it("should update displayed information immediately when payment method changes", async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate a sequence of payment method changes (including null)
          fc.array(
            fc.constantFrom<PaymentMethod | null>(
              "Cash",
              "QRIS",
              "Bank Transfer",
              null,
            ),
            { minLength: 2, maxLength: 5 },
          ),
          async (methodSequence) => {
            // Start with the first method in the sequence
            const { rerender, container, unmount } = render(
              <PaymentMethodInfo method={methodSequence[0]} />,
            );

            try {
              // Iterate through the sequence and verify each change
              for (let i = 1; i < methodSequence.length; i++) {
                const newMethod = methodSequence[i];

                // Rerender with the new method
                rerender(<PaymentMethodInfo method={newMethod} />);

                // Verify the correct content is displayed for the new method
                if (newMethod === "Cash") {
                  expect(
                    screen.getByText("Instruksi Pembayaran Tunai"),
                  ).toBeInTheDocument();
                  expect(
                    screen.getByText(
                      /Silakan datang langsung ke kantor koperasi/i,
                    ),
                  ).toBeInTheDocument();
                } else if (newMethod === "QRIS") {
                  expect(
                    screen.getByText("Scan QRIS untuk Pembayaran"),
                  ).toBeInTheDocument();
                  expect(
                    screen.getByAltText("QRIS Payment Code"),
                  ).toBeInTheDocument();
                } else if (newMethod === "Bank Transfer") {
                  expect(
                    screen.getByText("Informasi Transfer Bank"),
                  ).toBeInTheDocument();
                  expect(screen.getByText("1931879879")).toBeInTheDocument();
                } else {
                  // null case - should display nothing
                  expect(container.firstChild).toBeNull();
                }

                // Verify that content from previous methods is NOT present
                const previousMethod = methodSequence[i - 1];
                if (previousMethod !== newMethod) {
                  if (previousMethod === "Cash" && newMethod !== "Cash") {
                    expect(
                      screen.queryByText("Instruksi Pembayaran Tunai"),
                    ).not.toBeInTheDocument();
                  }
                  if (previousMethod === "QRIS" && newMethod !== "QRIS") {
                    expect(
                      screen.queryByText("Scan QRIS untuk Pembayaran"),
                    ).not.toBeInTheDocument();
                  }
                  if (
                    previousMethod === "Bank Transfer" &&
                    newMethod !== "Bank Transfer"
                  ) {
                    expect(
                      screen.queryByText("Informasi Transfer Bank"),
                    ).not.toBeInTheDocument();
                  }
                }
              }
            } finally {
              unmount();
            }
          },
        ),
        { numRuns: 100 },
      );
    }, 15000); // Increase timeout for property test

    it("should handle transitions between all payment method combinations", async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate pairs of different payment methods (including null)
          fc
            .tuple(
              fc.constantFrom<PaymentMethod | null>(
                "Cash",
                "QRIS",
                "Bank Transfer",
                null,
              ),
              fc.constantFrom<PaymentMethod | null>(
                "Cash",
                "QRIS",
                "Bank Transfer",
                null,
              ),
            )
            .filter(([first, second]) => first !== second),
          async ([firstMethod, secondMethod]) => {
            // Render with first method
            const { rerender, container, unmount } = render(
              <PaymentMethodInfo method={firstMethod} />,
            );

            try {
              // Change to second method
              rerender(<PaymentMethodInfo method={secondMethod} />);

              // Verify the correct content is displayed for the second method
              if (secondMethod === "Cash") {
                expect(
                  screen.getByText("Instruksi Pembayaran Tunai"),
                ).toBeInTheDocument();
              } else if (secondMethod === "QRIS") {
                expect(
                  screen.getByText("Scan QRIS untuk Pembayaran"),
                ).toBeInTheDocument();
              } else if (secondMethod === "Bank Transfer") {
                expect(
                  screen.getByText("Informasi Transfer Bank"),
                ).toBeInTheDocument();
              } else {
                expect(container.firstChild).toBeNull();
              }

              // Verify content from first method is NOT present
              if (firstMethod === "Cash" && secondMethod !== "Cash") {
                expect(
                  screen.queryByText("Instruksi Pembayaran Tunai"),
                ).not.toBeInTheDocument();
              }
              if (firstMethod === "QRIS" && secondMethod !== "QRIS") {
                expect(
                  screen.queryByText("Scan QRIS untuk Pembayaran"),
                ).not.toBeInTheDocument();
              }
              if (
                firstMethod === "Bank Transfer" &&
                secondMethod !== "Bank Transfer"
              ) {
                expect(
                  screen.queryByText("Informasi Transfer Bank"),
                ).not.toBeInTheDocument();
              }
            } finally {
              unmount();
            }
          },
        ),
        { numRuns: 100 },
      );
    }, 15000);
  });
});
