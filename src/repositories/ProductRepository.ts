import { Pool } from 'mysql2/promise';
import { db } from '../config/database';
import {
    SelectProduct,
    UpdateProduct,
    searchStock,
    searchStockReserve,
} from '../models/queryResultsTypes';
import { customError } from '../customErrors/customErrors';
import { ResultSetHeader } from 'mysql2';
import {
    responsePathStock,
    responseGetStock,
    responseInsertStockReserve,
    responseInsertStockSold,
} from '../models/responseTypes';

export class ProductRepository {
    public db: Pool;

    constructor() {
        this.db = db;
    }

    public async searchStock(id: number): Promise<searchStock | null> {
        try {
            const [result] = await this.db.query<searchStock[]>(
                'SELECT id, product, qtd FROM IN_STOCK WHERE id = ?',
                [id]
            );

            if (result.length > 0) {
                return result[0];
            }
            return null;
        } catch {
            throw new customError(500, 'Error fetching data from IN_STOCK table.');
        }
    }

    public async searchStockReserve(
        id: number,
        reservationToken: string
    ): Promise<searchStockReserve | null> {
        try {
            const [result] = await this.db.query<searchStockReserve[]>(
                'SELECT id_stock, product, reservationToken FROM RESERVED WHERE id_stock = ? AND reservationToken = ?',
                [id, reservationToken]
            );

            if (result.length > 0) {
                return result[0];
            }
            return null;
        } catch {
            throw new customError(500, 'Error fetching data from RESERVED table.');
        }
    }

    public async getStock(id: number): Promise<responseGetStock> {
        try {
            const [result] = await this.db.query<SelectProduct[]>(
                `SELECT 
          i.id, 
          i.qtd as stock, 
          COALESCE(COUNT(DISTINCT r.reservationToken), 0) as reserve, 
          COALESCE(COUNT(DISTINCT s.reservationToken), 0) as sold
        FROM IN_STOCK as i 
        LEFT JOIN RESERVED as r ON i.id = r.id_stock
        LEFT JOIN SOLD as s ON i.id = s.id_stock 
        WHERE i.id = ?
        GROUP BY i.id, i.qtd`,
                [id]
            );

            if (result.length > 0) {
                return {
                    ID: result[0].id,
                    IN_STOCK: result[0].stock,
                    RESERVE: result[0].reserve,
                    SOLD: result[0].sold,
                };
            } else {
                throw new customError(404, 'Product not found.');
            }
        } catch (error) {
            if (error instanceof customError) {
                throw error;
            }
            throw new customError(500, 'Error fetching stock data.');
        }
    }

    public async insertStock(
        id: number,
        product: string,
        qtd: number
    ): Promise<responsePathStock> {
        try {
            await this.db.query(
                'INSERT INTO IN_STOCK (id, product, qtd) VALUES (?, ?, ?)',
                [id, product, qtd]
            );

            return {
                id: id,
                product: product,
                stock: qtd,
            };
        } catch {
            throw new customError(500, 'Error inserting data into IN_STOCK table.');
        }
    }

    public async updateStock(
        id: number,
        product: string,
        qtd: number
    ): Promise<responsePathStock> {
        try {
            const [result] = await this.db.query<ResultSetHeader>(
                'UPDATE IN_STOCK SET product = ?, qtd = ? WHERE id = ?',
                [product, qtd, id]
            );

            // Check if any rows were affected
            if (result.affectedRows === 0) {
                throw new customError(404, 'Product not found for update.');
            }

            return {
                id: id,
                product: product,
                stock: qtd,
            };
        } catch (error) {
            if (error instanceof customError) {
                throw error;
            }
            throw new customError(500, 'Error updating data in IN_STOCK table.');
        }
    }

    public async insertStockReserve(
        id: number,
        product: string,
        uuid: string
    ): Promise<responseInsertStockReserve> {
        try {
            await this.db.query<UpdateProduct[]>(
                'INSERT INTO RESERVED (id_stock, product, reservationToken) VALUES (?, ?, ?)',
                [id, product, uuid]
            );

            return {
                id: id,
                product: product,
                reservationToken: uuid,
            };
        } catch {
            throw new customError(500, 'Error inserting data into RESERVED table.');
        }
    }

    public async deleteStockReserve(
        id: number,
        reservationToken: string
    ): Promise<void> {
        try {
            const [result] = await this.db.query<ResultSetHeader>(
                'DELETE FROM RESERVED WHERE id_stock = ? AND reservationToken = ?',
                [id, reservationToken]
            );

            if (result.affectedRows === 0) {
                throw new customError(404, 'Reservation not found.');
            }
        } catch (error) {
            if (error instanceof customError) {
                throw error;
            }
            throw new customError(500, 'Error deleting data in RESERVED table.');
        }
    }

    public async insertStockSold(
        id: number,
        product: string,
        uuid: string
    ): Promise<responseInsertStockSold> {
        try {
            await this.db.query(
                'INSERT INTO SOLD (id_stock, product, reservationToken) VALUES (?, ?, ?)',
                [id, product, uuid]
            );

            return {
                id: id,
                product: product,
                reservationToken: uuid,
            };
        } catch {
            throw new customError(500, 'Error inserting data into SOLD table.');
        }
    }
}
