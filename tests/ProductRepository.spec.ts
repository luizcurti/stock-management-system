// Mock the database first
jest.mock('../src/config/database', () => ({
    db: { query: jest.fn() }
}));

import { ProductRepository } from '../src/repositories/ProductRepository';
import { customError } from '../src/customErrors/customErrors';
import { db } from '../src/config/database';

const mockQuery = db.query as jest.MockedFunction<typeof db.query>;

describe('ProductRepository', () => {
    let repository: ProductRepository;

    beforeEach(() => {
        jest.clearAllMocks();
        repository = new ProductRepository();
    });

    describe('constructor', () => {
        it('should create repository instance', () => {
            expect(repository).toBeInstanceOf(ProductRepository);
            expect(repository.db).toBeDefined();
        });
    });

    describe('searchStock', () => {
        it('should return stock when found', async () => {
            const mockData = { id: 1, product: 'Ball', qtd: 100 };
            mockQuery.mockResolvedValue([[mockData] as any, []]);

            const result = await repository.searchStock(1);

            expect(result).toEqual(mockData);
        });

        it('should return null when not found', async () => {
            mockQuery.mockResolvedValue([[] as any, []]);
            const result = await repository.searchStock(1);
            expect(result).toBeNull();
        });

        it('should throw customError on database error', async () => {
            mockQuery.mockRejectedValue(new Error('DB Error'));
            await expect(repository.searchStock(1)).rejects.toThrow(customError);
        });
    });

    describe('getStock', () => {
        it('should return formatted stock data when found', async () => {
            const mockData = { id: 1, stock: 100, reserve: 5, sold: 2 };
            mockQuery.mockResolvedValue([[mockData] as any, []]);

            const result = await repository.getStock(1);

            expect(result).toEqual({
                ID: 1,
                IN_STOCK: 100,
                RESERVE: 5,
                SOLD: 2
            });
        });

        it('should throw customError when product not found', async () => {
            mockQuery.mockResolvedValue([[] as any, []]);
            await expect(repository.getStock(1)).rejects.toThrow('Product not found.');
        });

        it('should rethrow customError when it occurs', async () => {
            const customErr = new customError(404, 'Custom error');
            mockQuery.mockRejectedValue(customErr);

            try {
                await repository.getStock(1);
            } catch (error) {
                expect(error).toBe(customErr);
            }
        });

        it('should throw customError on general database error', async () => {
            mockQuery.mockRejectedValue(new Error('Database error'));
            await expect(repository.getStock(1)).rejects.toThrow('Error fetching stock data.');
        });
    });

    describe('insertStock', () => {
        it('should insert and return stock data', async () => {
            mockQuery.mockResolvedValue([{ affectedRows: 1 } as any, []]);

            const result = await repository.insertStock(1, 'Ball', 100);

            expect(result).toEqual({ id: 1, product: 'Ball', stock: 100 });
        });

        it('should throw customError on database error', async () => {
            mockQuery.mockRejectedValue(new Error('Insert failed'));
            await expect(repository.insertStock(1, 'Ball', 100))
                .rejects.toThrow('Error inserting data into IN_STOCK table.');
        });
    });

    describe('updateStock', () => {
        it('should update and return stock data', async () => {
            mockQuery.mockResolvedValue([{ affectedRows: 1 } as any, []]);

            const result = await repository.updateStock(1, 'Ball', 150);

            expect(result).toEqual({ id: 1, product: 'Ball', stock: 150 });
        });

        it('should throw error when no rows affected', async () => {
            mockQuery.mockResolvedValue([{ affectedRows: 0 } as any, []]);
            await expect(repository.updateStock(1, 'Ball', 150))
                .rejects.toThrow('Product not found for update.');
        });

        it('should rethrow customError when it occurs', async () => {
            const customErr = new customError(500, 'Update error');
            mockQuery.mockRejectedValue(customErr);

            try {
                await repository.updateStock(1, 'Ball', 150);
            } catch (error) {
                expect(error).toBe(customErr);
            }
        });

        it('should throw customError on general database error', async () => {
            mockQuery.mockRejectedValue(new Error('Update failed'));
            await expect(repository.updateStock(1, 'Ball', 150))
                .rejects.toThrow('Error updating data in IN_STOCK table.');
        });
    });

    describe('searchStockReserve', () => {
        it('should return reservation when found', async () => {
            const mockData = { id_stock: 1, product: 'Ball', reservationToken: 'abc123' };
            mockQuery.mockResolvedValue([[mockData] as any, []]);

            const result = await repository.searchStockReserve(1, 'abc123');

            expect(result).toEqual(mockData);
        });

        it('should return null when not found', async () => {
            mockQuery.mockResolvedValue([[] as any, []]);
            const result = await repository.searchStockReserve(1, 'abc123');
            expect(result).toBeNull();
        });

        it('should throw customError on error', async () => {
            mockQuery.mockRejectedValue(new Error('DB Error'));
            await expect(repository.searchStockReserve(1, 'abc123')).rejects.toThrow(customError);
        });
    });

    describe('insertStockReserve', () => {
        it('should insert reservation', async () => {
            mockQuery.mockResolvedValue([{ affectedRows: 1 } as any, []]);

            const result = await repository.insertStockReserve(1, 'Ball', 'token123');

            expect(result).toEqual({ id: 1, product: 'Ball', reservationToken: 'token123' });
        });

        it('should throw customError on error', async () => {
            mockQuery.mockRejectedValue(new Error('DB Error'));
            await expect(repository.insertStockReserve(1, 'Ball', 'token123')).rejects.toThrow(customError);
        });
    });

    describe('deleteStockReserve', () => {
        it('should delete reservation successfully', async () => {
            mockQuery.mockResolvedValue([{ affectedRows: 1 } as any, []]);

            await expect(repository.deleteStockReserve(1, 'token123')).resolves.toBeUndefined();
        });

        it('should throw error when no rows affected', async () => {
            mockQuery.mockResolvedValue([{ affectedRows: 0 } as any, []]);
            await expect(repository.deleteStockReserve(1, 'token123'))
                .rejects.toThrow('Reservation not found.');
        });

        it('should rethrow customError', async () => {
            const err = new customError(500, 'Delete error');
            mockQuery.mockRejectedValue(err);

            try {
                await repository.deleteStockReserve(1, 'token123');
            } catch (thrownError) {
                expect(thrownError).toBe(err);
            }
        });

        it('should throw customError on general error', async () => {
            mockQuery.mockRejectedValue(new Error('Delete failed'));
            await expect(repository.deleteStockReserve(1, 'token123'))
                .rejects.toThrow('Error deleting data in RESERVED table.');
        });
    });

    describe('insertStockSold', () => {
        it('should insert sold record', async () => {
            mockQuery.mockResolvedValue([{ affectedRows: 1 } as any, []]);

            const result = await repository.insertStockSold(1, 'Ball', 'token123');

            expect(result).toEqual({ id: 1, product: 'Ball', reservationToken: 'token123' });
        });

        it('should throw customError on error', async () => {
            mockQuery.mockRejectedValue(new Error('DB Error'));
            await expect(repository.insertStockSold(1, 'Ball', 'token123')).rejects.toThrow(customError);
        });
    });
});
