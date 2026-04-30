import { Test, TestingModule } from '@nestjs/testing';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { BadRequestException } from '@nestjs/common';

describe('PaymentsController', () => {
  let controller: PaymentsController;
  let paymentsService: PaymentsService;
  let cloudinaryService: CloudinaryService;

  const mockPaymentsService = {
    create: jest.fn(),
  };

  const mockCloudinaryService = {
    uploadImage: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentsController],
      providers: [
        {
          provide: PaymentsService,
          useValue: mockPaymentsService,
        },
        {
          provide: CloudinaryService,
          useValue: mockCloudinaryService,
        },
      ],
    }).compile();

    controller = module.get<PaymentsController>(PaymentsController);
    paymentsService = module.get<PaymentsService>(PaymentsService);
    cloudinaryService = module.get<CloudinaryService>(CloudinaryService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const mockRequest = {
      user: {
        sub: 'user-123',
        role: 'ANGGOTA',
        email: 'user@example.com',
        name: 'Test User',
      },
    } as any;

    const mockFile = {
      fieldname: 'proofImage',
      originalname: 'proof.jpg',
      encoding: '7bit',
      mimetype: 'image/jpeg',
      buffer: Buffer.from('fake-image-data'),
      size: 1024,
    };

    it('should pass paymentMethod to service when creating payment', async () => {
      const createPaymentDto = {
        nominal: 100000,
        description: 'Test payment',
        paymentMethod: 'Cash',
      };

      const mockUploadResult = {
        url: 'https://cloudinary.com/image.jpg',
        public_id: 'test-id',
      };

      const mockPayment = {
        id: 'payment-123',
        userId: 'user-123',
        nominal: 100000,
        proofImage: mockUploadResult.url,
        description: 'Test payment',
        paymentMethod: 'Cash',
        status: 'PENDING',
        createdAt: new Date(),
        user: {
          id: 'user-123',
          name: 'Test User',
          email: 'user@example.com',
        },
      };

      mockCloudinaryService.uploadImage.mockResolvedValue(mockUploadResult);
      mockPaymentsService.create.mockResolvedValue(mockPayment);

      const result = await controller.create(
        mockRequest,
        createPaymentDto,
        mockFile,
      );

      expect(cloudinaryService.uploadImage).toHaveBeenCalledWith(mockFile);
      expect(paymentsService.create).toHaveBeenCalledWith(
        'user-123',
        expect.objectContaining({
          nominal: 100000,
          description: 'Test payment',
          paymentMethod: 'Cash',
        }),
        mockUploadResult.url,
      );
      expect(result).toEqual({
        message: 'Payment submitted successfully',
        payment: mockPayment,
      });
    });

    it('should pass paymentMethod for QRIS payments', async () => {
      const createPaymentDto = {
        nominal: 50000,
        paymentMethod: 'QRIS',
      };

      const mockUploadResult = {
        url: 'https://cloudinary.com/qris-proof.jpg',
        public_id: 'qris-id',
      };

      mockCloudinaryService.uploadImage.mockResolvedValue(mockUploadResult);
      mockPaymentsService.create.mockResolvedValue({
        id: 'payment-456',
        paymentMethod: 'QRIS',
      });

      await controller.create(mockRequest, createPaymentDto, mockFile);

      expect(paymentsService.create).toHaveBeenCalledWith(
        'user-123',
        expect.objectContaining({
          paymentMethod: 'QRIS',
        }),
        mockUploadResult.url,
      );
    });

    it('should pass paymentMethod for Bank Transfer payments', async () => {
      const createPaymentDto = {
        nominal: 75000,
        paymentMethod: 'BankTransfer',
      };

      const mockUploadResult = {
        url: 'https://cloudinary.com/transfer-proof.jpg',
        public_id: 'transfer-id',
      };

      mockCloudinaryService.uploadImage.mockResolvedValue(mockUploadResult);
      mockPaymentsService.create.mockResolvedValue({
        id: 'payment-789',
        paymentMethod: 'BankTransfer',
      });

      await controller.create(mockRequest, createPaymentDto, mockFile);

      expect(paymentsService.create).toHaveBeenCalledWith(
        'user-123',
        expect.objectContaining({
          paymentMethod: 'BankTransfer',
        }),
        mockUploadResult.url,
      );
    });

    it('should throw BadRequestException when file is missing', async () => {
      const createPaymentDto = {
        nominal: 100000,
        paymentMethod: 'Cash',
      };

      await expect(
        controller.create(mockRequest, createPaymentDto, undefined),
      ).rejects.toThrow(BadRequestException);

      expect(paymentsService.create).not.toHaveBeenCalled();
    });
  });
});
