import { ProductService } from '../src/services/ProductService';
import { ProductRepository } from '../src/repositories/ProductRepository';
import { Request } from 'express';

describe('ProductService', () => {
    let productService: ProductService;
    let mockRepository: jest.Mocked<ProductRepository>;

    // Helper to mock an Express Request
    const req = (params: any, body: any): Request =>
        ({ params, body } as unknown as Request);

    // Creates a mocked repository (TypeScript-safe)
    function createMockRepo(): jest.Mocked<ProductRepository> {
        return {
            db: {} as any,

            searchStock: jest.fn(),
            insertStock: jest.fn(),
            updateStock: jest.fn(),
            getStock: jest.fn(),

            searchStockReserve: jest.fn(),
            insertStockReserve: jest.fn(),
            deleteStockReserve: jest.fn(),
            insertStockSold: jest.fn()
        } as jest.Mocked<ProductRepository>;
    }

    beforeEach(() => {
        mockRepository = createMockRepo();
        productService = new ProductService(mockRepository);
    });

    // =======================================================
    // PATH STOCK
    // =======================================================
    describe('pathStock', () => {
        it('should create new stock when product does not exist', async () => {
            mockRepository.searchStock.mockResolvedValue(null);

            mockRepository.insertStock.mockResolvedValue({
                id: 1,
                product: 'Ball',
                stock: 200
            });

            const result = await productService.pathStock(
                req({ id: '1' }, { product: 'Ball', qtd: 200 })
            );

            expect(result).toEqual({
                id: 1,
                product: 'Ball',
                stock: 200
            });
        });

        it('should update existing stock', async () => {
            mockRepository.searchStock.mockResolvedValue({
                id: 1,
                product: 'Ball',
                qtd: 10
            } as any);

            mockRepository.updateStock.mockResolvedValue({
                id: 1,
                product: 'Ball',
                stock: 200
            });

            const result = await productService.pathStock(
                req({ id: '1' }, { product: 'Ball', qtd: 200 })
            );

            expect(result.stock).toBe(200);
        });

        it('should throw when id missing (covers Missing product ID branch)', async () => {
            await expect(productService.pathStock(
                req({}, { product: 'Ball', qtd: 10 })
            )).rejects.toThrow('Missing product ID.');
        });

        it('should use default repository when not provided (covers constructor default branch)', async () => {
            const service = new ProductService();
            await expect(service.pathStock(
                req({}, { product: 'Ball', qtd: 10 })
            )).rejects.toThrow('Missing product ID.');
        });

        it('should throw when id invalid', async () => {
            await expect(productService.pathStock(
                req({ id: 'invalid' }, { product: 'Ball', qtd: 10 })
            )).rejects.toThrow('Invalid product ID.');
        });

        it('should throw when body null', async () => {
            await expect(productService.pathStock(
                req({ id: '1' }, null)
            )).rejects.toThrow('Invalid request body.');
        });

        it('should throw when product missing', async () => {
            await expect(productService.pathStock(
                req({ id: '1' }, { qtd: 10 })
            )).rejects.toThrow('Product name is required and must be a string.');
        });

        it('should throw when product not string', async () => {
            await expect(productService.pathStock(
                req({ id: '1' }, { product: 123, qtd: 10 })
            )).rejects.toThrow('Product name is required and must be a string.');
        });

        it('should throw when quantity missing', async () => {
            await expect(productService.pathStock(
                req({ id: '1' }, { product: 'Ball' })
            )).rejects.toThrow('Quantity is required.');
        });

        it('should throw when quantity invalid', async () => {
            await expect(productService.pathStock(
                req({ id: '1' }, { product: 'Ball', qtd: 'invalid' })
            )).rejects.toThrow('Quantity must be a non-negative number.');
        });

        it('should propagate repo error', async () => {
            mockRepository.searchStock.mockRejectedValue(new Error('Database error'));

            await expect(productService.pathStock(
                req({ id: '1' }, { product: 'Ball', qtd: 10 })
            )).rejects.toThrow('Database error');
        });
    });

    // =======================================================
    // GET STOCK
    // =======================================================
    describe('getStock', () => {
        it('should return stock info', async () => {
            const expected = { ID: 1, IN_STOCK: 10, RESERVE: 2, SOLD: 5 };

            mockRepository.getStock.mockResolvedValue(expected);

            const result = await productService.getStock(req({ id: '1' }, {}));

            expect(result).toEqual(expected);
        });

        it('should throw when id invalid', async () => {
            await expect(productService.getStock(req({ id: 'invalid' }, {})))
                .rejects.toThrow('Invalid product ID.');
        });

        it('should propagate repo error', async () => {
            mockRepository.getStock.mockRejectedValue(new Error('Database error'));

            await expect(productService.getStock(req({ id: '1' }, {})))
                .rejects.toThrow('Database error');
        });
    });

    // =======================================================
    // POST STOCK RESERVE
    // =======================================================
    describe('postStockReserve', () => {
        it('should reserve stock', async () => {
            mockRepository.searchStock.mockResolvedValue({
                id: 1,
                product: 'Ball',
                qtd: 10
            } as any);

            mockRepository.updateStock.mockResolvedValue({} as any);

            mockRepository.insertStockReserve.mockResolvedValue({
                id: 1,
                product: 'Ball',
                reservationToken: 'token'
            });

            const result = await productService.postStockReserve(
                req({ id: '1' }, {})
            );

            expect(result.reservationToken).toBeDefined();
        });

        it('should throw when product not found', async () => {
            mockRepository.searchStock.mockResolvedValue(null);

            await expect(productService.postStockReserve(
                req({ id: '1' }, {})
            )).rejects.toThrow('Product not found in stock.');
        });

        it('should throw when quantity insufficient', async () => {
            mockRepository.searchStock.mockResolvedValue({
                id: 1,
                product: 'Ball',
                qtd: 0
            } as any);

            await expect(productService.postStockReserve(
                req({ id: '1' }, {})
            )).rejects.toThrow('Insufficient stock quantity.');
        });

        it('should throw invalid ID', async () => {
            await expect(productService.postStockReserve(
                req({ id: 'invalid' }, {})
            )).rejects.toThrow('Invalid product ID.');
        });

        it('should propagate error', async () => {
            mockRepository.searchStock.mockRejectedValue(new Error('Database error'));

            await expect(productService.postStockReserve(
                req({ id: '1' }, {})
            )).rejects.toThrow('Database error');
        });
    });

    // =======================================================
    // POST STOCK SOLD
    // =======================================================
    describe('postStockSold', () => {

        it('should mark product as sold and call deleteStockReserve (covers delete sequence branch)', async () => {
            mockRepository.searchStockReserve.mockResolvedValue({
                id_stock: 1,
                product: 'Ball',
                reservationToken: 'abc'
            } as any);

            mockRepository.insertStockSold.mockResolvedValue({
                id: 1,
                product: 'Ball',
                reservationToken: 'abc'
            });
            mockRepository.deleteStockReserve.mockResolvedValue(undefined);

            await productService.postStockSold(
                req({ id: '1' }, { reservationToken: 'abc' })
            );

            expect(mockRepository.insertStockSold)
                .toHaveBeenCalledWith(1, 'Ball', 'abc');

            expect(mockRepository.deleteStockReserve)
                .toHaveBeenCalledWith(1, 'abc'); // covers deletion branch
        });

        it('should throw when reservation not found', async () => {
            mockRepository.searchStockReserve.mockResolvedValue(null);

            await expect(productService.postStockSold(
                req({ id: '1' }, { reservationToken: 't' })
            )).rejects.toThrow('Reservation not found.');
        });

        it('should throw when body is null (covers invalid body branch)', async () => {
            await expect(productService.postStockSold(
                req({ id: '1' }, null)
            )).rejects.toThrow('Invalid request body.'); // covers invalid body validation
        });

        it('should throw when reservation token missing', async () => {
            await expect(productService.postStockSold(
                req({ id: '1' }, {})
            )).rejects.toThrow(
                'Reservation token is required and must be a string.'
            );
        });

        it('should throw when token is not string', async () => {
            await expect(productService.postStockSold(
                req({ id: '1' }, { reservationToken: 123 })
            )).rejects.toThrow(
                'Reservation token is required and must be a string.'
            );
        });
    });

    // =======================================================
    // POST STOCK (return to stock)
    // =======================================================
    describe('postStock', () => {

        it('should return reserved item to stock', async () => {
            mockRepository.searchStockReserve.mockResolvedValue({
                id_stock: 1,
                product: 'Ball',
                reservationToken: 't'
            } as any);

            mockRepository.searchStock.mockResolvedValue({
                id: 1,
                product: 'Ball',
                qtd: 9
            } as any);

            mockRepository.updateStock.mockResolvedValue({
                id: 1,
                product: 'Ball',
                stock: 10
            });

            await productService.postStock(req({ id: '1' }, { reservationToken: 't' }));

            expect(mockRepository.updateStock)
                .toHaveBeenCalledWith(1, 'Ball', 10);
        });

        it('should throw when reservation not found', async () => {
            mockRepository.searchStockReserve.mockResolvedValue(null);

            await expect(productService.postStock(
                req({ id: '1' }, { reservationToken: 't' })
            )).rejects.toThrow('Reservation not found.');
        });

        it('should throw when stock missing after reservation', async () => {
            mockRepository.searchStockReserve.mockResolvedValue({
                id_stock: 1,
                product: 'Ball'
            } as any);

            mockRepository.searchStock.mockResolvedValue(null);

            await expect(productService.postStock(
                req({ id: '1' }, { reservationToken: 't' })
            )).rejects.toThrow('Product not found in stock.');
        });

        it('should throw invalid ID', async () => {
            await expect(productService.postStock(
                req({ id: 'invalid' }, { reservationToken: 't' })
            )).rejects.toThrow('Invalid product ID.');
        });
    });
});
