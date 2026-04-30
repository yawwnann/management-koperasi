import { validate } from 'class-validator';
import * as fc from 'fast-check';
import { CreatePaymentDto } from './create-payment.dto';

describe('CreatePaymentDto', () => {
  describe('Property 6: Payment method validation accepts only valid enum values', () => {
    /**
     * **Validates: Requirements 3.3**
     *
     * Property: For any payment submission with an invalid payment method value
     * (not "Cash", "QRIS", or "BankTransfer"), the system should reject the
     * request with a validation error.
     */
    it('should reject invalid payment method values', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate invalid payment method values (anything except the valid enum values)
          fc
            .string()
            .filter(
              (value) =>
                value !== 'Cash' &&
                value !== 'QRIS' &&
                value !== 'BankTransfer',
            ),
          fc.double({ min: 0.01, max: 1000000, noNaN: true }),
          async (invalidPaymentMethod, nominal) => {
            const dto = new CreatePaymentDto();
            dto.nominal = nominal;
            dto.paymentMethod = invalidPaymentMethod;

            const errors = await validate(dto);

            // Should have validation errors
            const paymentMethodErrors = errors.filter(
              (error) => error.property === 'paymentMethod',
            );

            // Assert that there is at least one validation error for paymentMethod
            expect(paymentMethodErrors.length).toBeGreaterThan(0);

            // Verify the error is about enum validation
            const hasEnumError = paymentMethodErrors.some(
              (error) =>
                error.constraints &&
                Object.values(error.constraints).some(
                  (msg) =>
                    typeof msg === 'string' && msg.includes('must be one of'),
                ),
            );
            expect(hasEnumError).toBe(true);
          },
        ),
        { numRuns: 100 },
      );
    });

    it('should accept valid payment method values', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate valid payment method values
          fc.constantFrom('Cash', 'QRIS', 'BankTransfer'),
          fc.double({ min: 0.01, max: 1000000, noNaN: true }),
          async (validPaymentMethod, nominal) => {
            const dto = new CreatePaymentDto();
            dto.nominal = nominal;
            dto.paymentMethod = validPaymentMethod;

            const errors = await validate(dto);

            // Should have no validation errors for paymentMethod
            const paymentMethodErrors = errors.filter(
              (error) => error.property === 'paymentMethod',
            );

            expect(paymentMethodErrors.length).toBe(0);
          },
        ),
        { numRuns: 100 },
      );
    });
  });

  describe('Property 5: Payment method validation rejects missing values', () => {
    /**
     * **Validates: Requirements 3.2**
     *
     * Property: For any payment submission without a payment method,
     * the system should reject the request and prevent payment record creation.
     */
    it('should reject payment submissions with missing payment method', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate valid nominal values
          fc.double({ min: 0.01, max: 1000000, noNaN: true }),
          // Optionally generate description
          fc.option(fc.string({ maxLength: 200 }), { nil: undefined }),
          async (nominal, description) => {
            const dto = new CreatePaymentDto();
            dto.nominal = nominal;
            if (description !== undefined) {
              dto.description = description;
            }
            // Intentionally omit paymentMethod

            const errors = await validate(dto);

            // Should have validation errors
            const paymentMethodErrors = errors.filter(
              (error) => error.property === 'paymentMethod',
            );

            // Assert that there is at least one validation error for paymentMethod
            expect(paymentMethodErrors.length).toBeGreaterThan(0);

            // Verify the error is about the field being required/not empty
            const hasRequiredError = paymentMethodErrors.some(
              (error) =>
                error.constraints &&
                (error.constraints['isNotEmpty'] !== undefined ||
                  error.constraints['isEnum'] !== undefined),
            );
            expect(hasRequiredError).toBe(true);
          },
        ),
        { numRuns: 100 },
      );
    });
  });
});
