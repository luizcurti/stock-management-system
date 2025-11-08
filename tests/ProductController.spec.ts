import { ProductController } from '../src/controllers/ProductController';
import { ProductService } from '../src/services/ProductService';
import { Request } from 'express';

jest.mock('../src/services/ProductService');

const mockProductService = new ProductService() as jest.Mocked<ProductService>;

describe('ProductController', () => {
    let productController: ProductController;
    let mockRequest: Partial<Request>;

    beforeEach(() => {
        jest.clearAllMocks();
        productController = new ProductController(mockProductService);
        mockRequest = {
            params: {},
            body: {},
        };
    });

    describe('constructor', () => {
        it('should create instance with provided ProductService', () => {
            const controller = new ProductController(mockProductService);
            expect(controller).toBeInstanceOf(ProductController);
        });

        it('should create instance with default ProductService when none provided', () => {
            const controller = new ProductController();
            expect(controller).toBeInstanceOf(ProductController);
        });
    });

    describe('getStock', () => {
        it('should return stock data successfully', async () => {
            const expectedResult = { ID: 1, IN_STOCK: 10, RESERVE: 2, SOLD: 5 };
            mockProductService.getStock.mockResolvedValue(expectedResult);

            const result = await productController.getStock(mockRequest as Request);

            expect(mockProductService.getStock).toHaveBeenCalledWith(mockRequest);
            expect(result).toEqual(expectedResult);
        });

        it('should propagate service errors', async () => {
            const error = new Error('Service error');
            mockProductService.getStock.mockRejectedValue(error);

            await expect(productController.getStock(mockRequest as Request)).rejects.toThrow('Service error');
            expect(mockProductService.getStock).toHaveBeenCalledWith(mockRequest);
        });
    });

    describe('patchStock', () => {
        it('should update/create stock successfully', async () => {
            const expectedResult = { id: 1, product: 'Ball', stock: 200 };
            mockProductService.pathStock.mockResolvedValue(expectedResult);

            const result = await productController.patchStock(mockRequest as Request);

            expect(mockProductService.pathStock).toHaveBeenCalledWith(mockRequest);
            expect(result).toEqual(expectedResult);
        });

        it('should propagate service errors', async () => {
            const error = new Error('Service error');
            mockProductService.pathStock.mockRejectedValue(error);

            await expect(productController.patchStock(mockRequest as Request)).rejects.toThrow('Service error');
            expect(mockProductService.pathStock).toHaveBeenCalledWith(mockRequest);
        });
    });

    describe('postStockReserve', () => {
        it('should reserve stock successfully', async () => {
            const expectedResult = { id: 1, product: 'Ball', reservationToken: 'uuid-123' };
            mockProductService.postStockReserve.mockResolvedValue(expectedResult);

            const result = await productController.postStockReserve(mockRequest as Request);

            expect(mockProductService.postStockReserve).toHaveBeenCalledWith(mockRequest);
            expect(result).toEqual(expectedResult);
        });

        it('should propagate service errors', async () => {
            const error = new Error('Service error');
            mockProductService.postStockReserve.mockRejectedValue(error);

            await expect(productController.postStockReserve(mockRequest as Request)).rejects.toThrow('Service error');
            expect(mockProductService.postStockReserve).toHaveBeenCalledWith(mockRequest);
        });
    });

    describe('postStock', () => {
        it('should return reserved product to stock successfully', async () => {
            mockProductService.postStock.mockResolvedValue();

            await productController.postStock(mockRequest as Request);

            expect(mockProductService.postStock).toHaveBeenCalledWith(mockRequest);
        });

        it('should propagate service errors', async () => {
            const error = new Error('Service error');
            mockProductService.postStock.mockRejectedValue(error);

            await expect(productController.postStock(mockRequest as Request)).rejects.toThrow('Service error');
            expect(mockProductService.postStock).toHaveBeenCalledWith(mockRequest);
        });
    });

    describe('postStockSold', () => {
        it('should mark stock as sold successfully', async () => {
            mockProductService.postStockSold.mockResolvedValue();

            await productController.postStockSold(mockRequest as Request);

            expect(mockProductService.postStockSold).toHaveBeenCalledWith(mockRequest);
        });

        it('should propagate service errors', async () => {
            const error = new Error('Service error');
            mockProductService.postStockSold.mockRejectedValue(error);

            await expect(productController.postStockSold(mockRequest as Request)).rejects.toThrow('Service error');
            expect(mockProductService.postStockSold).toHaveBeenCalledWith(mockRequest);
        });
    });
});