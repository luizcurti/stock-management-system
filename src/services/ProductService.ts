import { Request as ExRequest } from 'express';
import { ProductRepository } from '../repositories/ProductRepository';
import { v4 as uuidv4 } from 'uuid';
import { customError } from '../customErrors/customErrors';
import {
    responseGetStock,
    responseInsertStockReserve,
    responsePathStock,
} from '../models/responseTypes';

export class ProductService {
    constructor(private rep: ProductRepository = new ProductRepository()) {
    }

    public async pathStock(request: ExRequest): Promise<responsePathStock> {
        const id = this.validateAndParseId(request.params.id);
        const { product, qtd } = this.validateStockData(request.body);

        try {
            const returnSearch = await this.rep.searchStock(id);

            if (returnSearch === null) {
                return await this.rep.insertStock(id, product, qtd);
            } else {
                return await this.rep.updateStock(id, product, qtd);
            }
        } catch (error) {
            throw error;
        }
    }

    public async getStock(request: ExRequest): Promise<responseGetStock> {
        const id = this.validateAndParseId(request.params.id);

        try {
            return await this.rep.getStock(id);
        } catch (error) {
            throw error;
        }
    }

    public async postStockReserve(
        request: ExRequest
    ): Promise<responseInsertStockReserve> {
        const id = this.validateAndParseId(request.params.id);

        try {
            const searchStock = await this.rep.searchStock(id);

            if (searchStock === null) {
                throw new customError(404, 'Product not found in stock.');
            }

            const { product, qtd } = searchStock;
            const uuid = uuidv4();

            if (qtd <= 0) {
                throw new customError(400, 'Insufficient stock quantity.');
            }

            await this.rep.updateStock(id, product, qtd - 1);
            return await this.rep.insertStockReserve(id, product, uuid);
        } catch (error) {
            throw error;
        }
    }

    public async postStock(request: ExRequest): Promise<void> {
        const id = this.validateAndParseId(request.params.id);
        const { reservationToken } = this.validateReservationToken(request.body);

        try {
            const searchStockReserve = await this.rep.searchStockReserve(
                id,
                reservationToken
            );

            if (searchStockReserve === null) {
                throw new customError(404, 'Reservation not found.');
            }

            await this.rep.deleteStockReserve(id, reservationToken);
            const searchStock = await this.rep.searchStock(id);

            if (searchStock === null) {
                throw new customError(404, 'Product not found in stock.');
            }

            const { product, qtd } = searchStock;
            await this.rep.updateStock(id, product, qtd + 1);
        } catch (error) {
            throw error;
        }
    }

    public async postStockSold(request: ExRequest): Promise<void> {
        const id = this.validateAndParseId(request.params.id);
        const { reservationToken } = this.validateReservationToken(request.body);

        try {
            const searchStockReserve = await this.rep.searchStockReserve(
                id,
                reservationToken
            );

            if (searchStockReserve === null) {
                throw new customError(404, 'Reservation not found.');
            }

            const { product } = searchStockReserve;

            await this.rep.insertStockSold(id, product, reservationToken);
            await this.rep.deleteStockReserve(id, reservationToken);
        } catch (error) {
            throw error;
        }
    }

    private validateAndParseId(id: string): number {
        if (!id) {
            throw new customError(400, 'Missing product ID.');
        }

        const parsedId = parseInt(id, 10);

        if (isNaN(parsedId) || parsedId <= 0) {
            throw new customError(400, 'Invalid product ID.');
        }

        return parsedId;
    }

    private validateStockData(body: unknown): { product: string; qtd: number } {
        if (!body || typeof body !== 'object') {
            throw new customError(400, 'Invalid request body.');
        }

        const data = body as Record<string, unknown>;
        const { product, qtd } = data;

        if (!product || typeof product !== 'string') {
            throw new customError(
                400,
                'Product name is required and must be a string.'
            );
        }

        if (qtd === undefined || qtd === null) {
            throw new customError(400, 'Quantity is required.');
        }

        const parsedQtd = typeof qtd === 'number' ? qtd : parseInt(String(qtd), 10);

        if (isNaN(parsedQtd) || parsedQtd < 0) {
            throw new customError(400, 'Quantity must be a non-negative number.');
        }

        return { product, qtd: parsedQtd };
    }

    private validateReservationToken(body: unknown): { reservationToken: string } {
        if (!body || typeof body !== 'object') {
            throw new customError(400, 'Invalid request body.');
        }

        const data = body as Record<string, unknown>;
        const { reservationToken } = data;

        if (!reservationToken || typeof reservationToken !== 'string') {
            throw new customError(
                400,
                'Reservation token is required and must be a string.'
            );
        }

        return { reservationToken };
    }
}
