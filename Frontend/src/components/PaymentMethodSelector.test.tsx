import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as fc from "fast-check";
import { PaymentMethodSelector, PaymentMethod } from "./PaymentMethodSelector";

describe("PaymentMethodSelector", () => {
  const mockOnMethodChange = jest.fn();

  beforeEach(() => {
    mockOnMethodChange.mockClear();
  });

  // Test that three payment method options are displayed (Requirements 1.1)
  it("should display three payment method options", () => {
    render(
      <PaymentMethodSelector
        selectedMethod={null}
        onMethodChange={mockOnMethodChange}
      />,
    );

    // Check that all three payment methods are displayed
    expect(screen.getByText("Tunai")).toBeInTheDocument();
    expect(screen.getByText("QRIS")).toBeInTheDocument();
    expect(screen.getByText("Transfer Bank")).toBeInTheDocument();
  });

  // Test visual indication of selected method (Requirements 1.2)
  describe("visual indication of selected method", () => {
    it("should visually indicate when Cash is selected", () => {
      render(
        <PaymentMethodSelector
          selectedMethod="Cash"
          onMethodChange={mockOnMethodChange}
        />,
      );

      const cashButton = screen.getByText("Tunai").closest("button");
      expect(cashButton).toHaveClass("border-primary");
      expect(cashButton).toHaveClass("bg-primary/5");

      // Check for checkmark icon
      const checkmark = cashButton?.querySelector("svg");
      expect(checkmark).toBeInTheDocument();
    });

    it("should visually indicate when QRIS is selected", () => {
      render(
        <PaymentMethodSelector
          selectedMethod="QRIS"
          onMethodChange={mockOnMethodChange}
        />,
      );

      const qrisButton = screen.getByText("QRIS").closest("button");
      expect(qrisButton).toHaveClass("border-primary");
      expect(qrisButton).toHaveClass("bg-primary/5");

      // Check for checkmark icon
      const checkmark = qrisButton?.querySelector("svg");
      expect(checkmark).toBeInTheDocument();
    });

    it("should visually indicate when Bank Transfer is selected", () => {
      render(
        <PaymentMethodSelector
          selectedMethod="Bank Transfer"
          onMethodChange={mockOnMethodChange}
        />,
      );

      const bankButton = screen.getByText("Transfer Bank").closest("button");
      expect(bankButton).toHaveClass("border-primary");
      expect(bankButton).toHaveClass("bg-primary/5");

      // Check for checkmark icon
      const checkmark = bankButton?.querySelector("svg");
      expect(checkmark).toBeInTheDocument();
    });

    it("should not show visual indication when no method is selected", () => {
      render(
        <PaymentMethodSelector
          selectedMethod={null}
          onMethodChange={mockOnMethodChange}
        />,
      );

      const cashButton = screen.getByText("Tunai").closest("button");
      const qrisButton = screen.getByText("QRIS").closest("button");
      const bankButton = screen.getByText("Transfer Bank").closest("button");

      // None should have the selected styling
      expect(cashButton).not.toHaveClass("border-primary");
      expect(qrisButton).not.toHaveClass("border-primary");
      expect(bankButton).not.toHaveClass("border-primary");

      // No checkmarks should be present
      expect(cashButton?.querySelector("svg")).not.toBeInTheDocument();
      expect(qrisButton?.querySelector("svg")).not.toBeInTheDocument();
      expect(bankButton?.querySelector("svg")).not.toBeInTheDocument();
    });
  });

  // Test method change callback (Requirements 1.2)
  describe("method change callback", () => {
    it('should call onMethodChange with "Cash" when Cash is clicked', async () => {
      const user = userEvent.setup();

      render(
        <PaymentMethodSelector
          selectedMethod={null}
          onMethodChange={mockOnMethodChange}
        />,
      );

      const cashButton = screen.getByText("Tunai").closest("button");
      await user.click(cashButton!);

      expect(mockOnMethodChange).toHaveBeenCalledTimes(1);
      expect(mockOnMethodChange).toHaveBeenCalledWith("Cash");
    });

    it('should call onMethodChange with "QRIS" when QRIS is clicked', async () => {
      const user = userEvent.setup();

      render(
        <PaymentMethodSelector
          selectedMethod={null}
          onMethodChange={mockOnMethodChange}
        />,
      );

      const qrisButton = screen.getByText("QRIS").closest("button");
      await user.click(qrisButton!);

      expect(mockOnMethodChange).toHaveBeenCalledTimes(1);
      expect(mockOnMethodChange).toHaveBeenCalledWith("QRIS");
    });

    it('should call onMethodChange with "Bank Transfer" when Bank Transfer is clicked', async () => {
      const user = userEvent.setup();

      render(
        <PaymentMethodSelector
          selectedMethod={null}
          onMethodChange={mockOnMethodChange}
        />,
      );

      const bankButton = screen.getByText("Transfer Bank").closest("button");
      await user.click(bankButton!);

      expect(mockOnMethodChange).toHaveBeenCalledTimes(1);
      expect(mockOnMethodChange).toHaveBeenCalledWith("Bank Transfer");
    });

    it("should not call onMethodChange when disabled", async () => {
      const user = userEvent.setup();

      render(
        <PaymentMethodSelector
          selectedMethod={null}
          onMethodChange={mockOnMethodChange}
          disabled={true}
        />,
      );

      const cashButton = screen.getByText("Tunai").closest("button");
      await user.click(cashButton!);

      expect(mockOnMethodChange).not.toHaveBeenCalled();
    });

    it("should allow changing from one method to another", async () => {
      const user = userEvent.setup();

      const { rerender } = render(
        <PaymentMethodSelector
          selectedMethod="Cash"
          onMethodChange={mockOnMethodChange}
        />,
      );

      const qrisButton = screen.getByText("QRIS").closest("button");
      await user.click(qrisButton!);

      expect(mockOnMethodChange).toHaveBeenCalledWith("QRIS");
    });
  });

  describe("Property 1: Payment method selection updates UI state", () => {
    /**
     * **Validates: Requirements 1.2**
     *
     * Property: For any payment method selection (Cash, QRIS, or Bank Transfer),
     * the UI state should reflect the selected method with visual indication.
     */
    it("should update UI state to reflect any selected payment method", async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate random payment method selections
          fc.constantFrom<PaymentMethod>("Cash", "QRIS", "Bank Transfer"),
          async (selectedMethod) => {
            const mockOnMethodChange = jest.fn();

            // Render component with the selected method
            const { container } = render(
              <PaymentMethodSelector
                selectedMethod={selectedMethod}
                onMethodChange={mockOnMethodChange}
              />,
            );

            try {
              // Map payment method to display label
              const methodLabels: Record<PaymentMethod, string> = {
                Cash: "Tunai",
                QRIS: "QRIS",
                "Bank Transfer": "Transfer Bank",
              };

              const label = methodLabels[selectedMethod];

              // Use container queries to avoid multiple element issues
              const buttons = Array.from(container.querySelectorAll("button"));
              const button = buttons.find((btn) =>
                btn.textContent?.includes(label),
              );

              // Verify visual indication: selected button should have primary border and background
              expect(button).toHaveClass("border-primary");
              expect(button).toHaveClass("bg-primary/5");

              // Verify checkmark icon is present for selected method
              const checkmark = button?.querySelector("svg");
              expect(checkmark).toBeInTheDocument();

              // Verify other methods are NOT selected
              const allMethods: PaymentMethod[] = [
                "Cash",
                "QRIS",
                "Bank Transfer",
              ];
              const otherMethods = allMethods.filter(
                (m) => m !== selectedMethod,
              );

              otherMethods.forEach((method) => {
                const otherLabel = methodLabels[method];
                const otherButton = buttons.find((btn) =>
                  btn.textContent?.includes(otherLabel),
                );

                // Other buttons should NOT have selected styling
                expect(otherButton).not.toHaveClass("border-primary");
                expect(otherButton).not.toHaveClass("bg-primary/5");

                // Other buttons should NOT have checkmark
                const otherCheckmark = otherButton?.querySelector("svg");
                expect(otherCheckmark).not.toBeInTheDocument();
              });
            } finally {
              // Clean up after each iteration
              cleanup();
            }
          },
        ),
        { numRuns: 100 },
      );
    });

    it("should show no selection when selectedMethod is null", async () => {
      await fc.assert(
        fc.asyncProperty(fc.constant(null), async () => {
          const mockOnMethodChange = jest.fn();

          const { container } = render(
            <PaymentMethodSelector
              selectedMethod={null}
              onMethodChange={mockOnMethodChange}
            />,
          );

          try {
            // Verify no method has selected styling
            const buttons = Array.from(container.querySelectorAll("button"));
            const cashButton = buttons.find((btn) =>
              btn.textContent?.includes("Tunai"),
            );
            const qrisButton = buttons.find((btn) =>
              btn.textContent?.includes("QRIS"),
            );
            const bankButton = buttons.find((btn) =>
              btn.textContent?.includes("Transfer Bank"),
            );

            expect(cashButton).not.toHaveClass("border-primary");
            expect(qrisButton).not.toHaveClass("border-primary");
            expect(bankButton).not.toHaveClass("border-primary");

            // Verify no checkmarks are present
            expect(cashButton?.querySelector("svg")).not.toBeInTheDocument();
            expect(qrisButton?.querySelector("svg")).not.toBeInTheDocument();
            expect(bankButton?.querySelector("svg")).not.toBeInTheDocument();
          } finally {
            // Clean up after each iteration
            cleanup();
          }
        }),
        { numRuns: 100 },
      );
    });
  });

  describe("Property 2: Payment method changes update state correctly", () => {
    /**
     * **Validates: Requirements 1.4**
     *
     * Property: For any sequence of payment method selections, the final selected
     * method should be the one stored in the form state.
     */
    it("should correctly update state through a sequence of payment method changes", async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate a random sequence of payment method selections (1-5 changes)
          fc.array(
            fc.constantFrom<PaymentMethod>("Cash", "QRIS", "Bank Transfer"),
            { minLength: 1, maxLength: 5 },
          ),
          async (methodSequence) => {
            const user = userEvent.setup();
            let currentMethod: PaymentMethod | null = null;
            const mockOnMethodChange = jest.fn((method: PaymentMethod) => {
              currentMethod = method;
            });

            // Map payment method to display label
            const methodLabels: Record<PaymentMethod, string> = {
              Cash: "Tunai",
              QRIS: "QRIS",
              "Bank Transfer": "Transfer Bank",
            };

            // Render the component once
            const { container, rerender, unmount } = render(
              <PaymentMethodSelector
                selectedMethod={currentMethod}
                onMethodChange={mockOnMethodChange}
              />,
            );

            try {
              // Simulate the sequence of method changes
              for (const method of methodSequence) {
                const label = methodLabels[method];
                const buttons = Array.from(
                  container.querySelectorAll("button"),
                );
                const button = buttons.find((btn) =>
                  btn.textContent?.includes(label),
                );

                // Click the button to change the method
                if (button) {
                  await user.click(button);
                }

                // Rerender with the new state
                rerender(
                  <PaymentMethodSelector
                    selectedMethod={currentMethod}
                    onMethodChange={mockOnMethodChange}
                  />,
                );
              }

              // Verify the final state matches the last selection in the sequence
              const expectedFinalMethod =
                methodSequence[methodSequence.length - 1];
              expect(currentMethod).toBe(expectedFinalMethod);

              // Verify onMethodChange was called the correct number of times
              expect(mockOnMethodChange).toHaveBeenCalledTimes(
                methodSequence.length,
              );

              // Verify the last call was with the expected method
              expect(mockOnMethodChange).toHaveBeenLastCalledWith(
                expectedFinalMethod,
              );
            } finally {
              // Ensure cleanup
              unmount();
            }
          },
        ),
        { numRuns: 50 },
      );
    }, 15000); // Increase timeout for property test

    it("should handle changing from one method to another directly", async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate two different payment methods
          fc
            .tuple(
              fc.constantFrom<PaymentMethod>("Cash", "QRIS", "Bank Transfer"),
              fc.constantFrom<PaymentMethod>("Cash", "QRIS", "Bank Transfer"),
            )
            .filter(([first, second]) => first !== second),
          async ([firstMethod, secondMethod]) => {
            const user = userEvent.setup();
            let currentMethod: PaymentMethod | null = firstMethod;
            const mockOnMethodChange = jest.fn((method: PaymentMethod) => {
              currentMethod = method;
            });

            // Map payment method to display label
            const methodLabels: Record<PaymentMethod, string> = {
              Cash: "Tunai",
              QRIS: "QRIS",
              "Bank Transfer": "Transfer Bank",
            };

            // Render with first method selected
            const { container, rerender, unmount } = render(
              <PaymentMethodSelector
                selectedMethod={firstMethod}
                onMethodChange={mockOnMethodChange}
              />,
            );

            try {
              // Click the second method
              const secondLabel = methodLabels[secondMethod];
              const buttons = Array.from(container.querySelectorAll("button"));
              const secondButton = buttons.find((btn) =>
                btn.textContent?.includes(secondLabel),
              );

              if (secondButton) {
                await user.click(secondButton);
              }

              // Rerender with updated state
              rerender(
                <PaymentMethodSelector
                  selectedMethod={currentMethod}
                  onMethodChange={mockOnMethodChange}
                />,
              );

              // Verify the state changed to the second method
              expect(currentMethod).toBe(secondMethod);
              expect(mockOnMethodChange).toHaveBeenCalledWith(secondMethod);
            } finally {
              unmount();
            }
          },
        ),
        { numRuns: 50 },
      );
    }, 10000);

    it("should maintain state when the same method is clicked multiple times", async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom<PaymentMethod>("Cash", "QRIS", "Bank Transfer"),
          fc.integer({ min: 2, max: 3 }), // Number of times to click (reduced for performance)
          async (method, clickCount) => {
            const user = userEvent.setup();
            let currentMethod: PaymentMethod | null = null;
            const mockOnMethodChange = jest.fn((m: PaymentMethod) => {
              currentMethod = m;
            });

            // Map payment method to display label
            const methodLabels: Record<PaymentMethod, string> = {
              Cash: "Tunai",
              QRIS: "QRIS",
              "Bank Transfer": "Transfer Bank",
            };

            // Render the component once
            const { container, rerender, unmount } = render(
              <PaymentMethodSelector
                selectedMethod={currentMethod}
                onMethodChange={mockOnMethodChange}
              />,
            );

            try {
              for (let i = 0; i < clickCount; i++) {
                const label = methodLabels[method];
                const buttons = Array.from(
                  container.querySelectorAll("button"),
                );
                const button = buttons.find((btn) =>
                  btn.textContent?.includes(label),
                );

                if (button) {
                  await user.click(button);
                }

                // Rerender with updated state
                rerender(
                  <PaymentMethodSelector
                    selectedMethod={currentMethod}
                    onMethodChange={mockOnMethodChange}
                  />,
                );
              }

              // Verify the final state is still the selected method
              expect(currentMethod).toBe(method);

              // Verify onMethodChange was called the correct number of times
              expect(mockOnMethodChange).toHaveBeenCalledTimes(clickCount);

              // All calls should be with the same method
              mockOnMethodChange.mock.calls.forEach((call) => {
                expect(call[0]).toBe(method);
              });
            } finally {
              unmount();
            }
          },
        ),
        { numRuns: 30 }, // Reduced for performance
      );
    }, 15000);
  });
});
