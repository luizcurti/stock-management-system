import { ProductRepository } from "../src/repositories/ProductRepository"; 
import { db } from "../src/config/database";
import { v4 as uuidv4 } from 'uuid';
import { customError } from "../src/customErrors/customErrors";

const productRepository = new ProductRepository();

describe('ProductRepository', () => {
    afterEach(() => jest.clearAllMocks());

    it('Should return success when saving SOLD data', async () => {
        const uuid = uuidv4();

        const dbMock = jest.spyOn(db, "query");
        dbMock.mockResolvedValue({ id: 1, product: "Ball", reservationToken: uuid } as any);
        const result = await productRepository.insertStockSold(1, "Ball", uuid);

        expect(dbMock).toHaveBeenCalledTimes(1);
        expect(result).toEqual({ id: 1, product: 'Ball', reservationToken: uuid });
    });

    it('Should return error when saving SOLD data', async () => {
        const uuid = uuidv4();

        const dbMock = jest.spyOn(db, "query");
        dbMock.mockRejectedValue(1 as any);

        try {
            await productRepository.insertStockSold(1, "Ball", uuid);
        } catch (error) {
            expect(dbMock).toHaveBeenCalledTimes(1);
            expect(error).toEqual(new customError(404, `Error inserting data into SOLD table.`));
        }
    });

    it('Should return success when saving RESERVED data', async () => {
        const uuid = uuidv4();

        const dbMock = jest.spyOn(db, "query");
        dbMock.mockResolvedValue({ id: 1, product: "Ball", reservationToken: uuid } as any);
        const result = await productRepository.insertStockReserve(1, "Ball", uuid);

        expect(dbMock).toHaveBeenCalledTimes(1);
        expect(result).toEqual({ id: 1, product: 'Ball', reservationToken: uuid });
    });

    it('Should return error when saving RESERVED data', async () => {
        const uuid = uuidv4();

        const dbMock = jest.spyOn(db, "query");
        dbMock.mockRejectedValue(1 as any);

        try {
            await productRepository.insertStockReserve(1, "Ball", uuid);
        } catch (error) {
            expect(dbMock).toHaveBeenCalledTimes(1);
            expect(error).toEqual(new customError(404, `Error inserting data into RESERVED table.`));
        }
    });

    it('Should return success when deleting RESERVED data', async () => {
        const uuid = uuidv4();

        const dbMock = jest.spyOn(db, "query");
        dbMock.mockResolvedValue(1 as any);
        await productRepository.deleteStockReserve(1, uuid);

        expect(dbMock).toHaveBeenCalledTimes(1);
    });

    it('Should return error when deleting RESERVED data', async () => {
        const uuid = uuidv4();

        const dbMock = jest.spyOn(db, "query");
        dbMock.mockRejectedValue(1 as any);

        try {
            await productRepository.deleteStockReserve(1, uuid);
        } catch (error) {
            expect(dbMock).toHaveBeenCalledTimes(1);
            expect(error).toEqual(new customError(404, `Error deleting data in RESERVED table.`));
        }
    });

    it('Should return success when updating IN_STOCK data', async () => {
        const dbMock = jest.spyOn(db, "query");
        dbMock.mockResolvedValue({ id: 1, product: "Ball", stock: 200 } as any);
        const result = await productRepository.updateStock(1, "Ball", 200);

        expect(dbMock).toHaveBeenCalledTimes(1);
        expect(result).toEqual({ id: 1, product: 'Ball', stock: 200 });
    });

    it('Should return error when updating IN_STOCK data', async () => {
        const dbMock = jest.spyOn(db, "query");
        dbMock.mockRejectedValue(1 as any);

        try {
            await productRepository.updateStock(1, "Ball", 200);
        } catch (error) {
            expect(dbMock).toHaveBeenCalledTimes(1);
            expect(error).toEqual(new customError(404, `Error updating data in IN_STOCK table.`));
        }
    });

    it('Should return success when inserting IN_STOCK data', async () => {
        const dbMock = jest.spyOn(db, "query");
        dbMock.mockResolvedValue({ id: 1, product: "Ball", stock: 200 } as any);
        const result = await productRepository.insertStock(1, "Ball", 200);

        expect(dbMock).toHaveBeenCalledTimes(1);
        expect(result).toEqual({ id: 1, product: 'Ball', stock: 200 });
    });

    it('Should return error when inserting IN_STOCK data', async () => {
        const dbMock = jest.spyOn(db, "query");
        dbMock.mockRejectedValue(1 as any);

        try {
            await productRepository.insertStock(1, "Ball", 200);
        } catch (error) {
            expect(dbMock).toHaveBeenCalledTimes(1);
            expect(error).toEqual(new customError(404, `Error inserting data into IN_STOCK table.`));
        }
    });    
});



