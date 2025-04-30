import { Repository } from "./Repository";
import { SelectProduct, UpdateProduct, searchStock, searchStockReserve } from "../models/queryResultsTypes";
import { customError } from '../customErrors/customErrors';
import { responsePathStock, responseGetStock, responseInsertStockReserve, responseInsertStockSold } from "../models/responseTypes";

export class ProductRepository extends Repository {
    constructor() {
        super();
    }

    public async searchStock(id:number): Promise<searchStock | null> {
        try {
            const [result] = await this.db.query<searchStock[]>(`SELECT id, product, qtd FROM IN_STOCK WHERE id = ${id};`);
            if(result.length){
                return result[0];
            }
            else{
                return null;
            }
        } catch (error) {
            //console.error({id, error});
            throw new customError(404, `Error fetching data from IN_STOCK table.`);
        }
    }

    public async searchStockReserve(id:number, reservationToken:string): Promise<searchStockReserve | null> {
        try {
            const [result] = await this.db.query<searchStockReserve[]>(`SELECT id_stock, product, reservationToken FROM RESERVED WHERE id_stock = ${id} AND reservationToken = '${reservationToken}';`);

            if(result.length){
                return result[0];
            }
            else{
                return null;
            }
        } catch (error) {
            //console.error({id, reservationToken, error});
            throw new customError(404, `Error fetching data from RESERVED table.`);
        }
    }

    public async getStock(id:number): Promise<responseGetStock | void> {
        try {
            const [result] = await this.db.query<SelectProduct[]>(
                `SELECT i.id, i.qtd as stock, count(r.id_stock) as reserve, count(s.id_stock) as sold
                FROM IN_STOCK as i 
                LEFT JOIN RESERVED as r ON i.product = r.product
                LEFT JOIN SOLD as s ON i.product = s.product WHERE id = ${id}
                group by i.id, i.qtd;`
                );

            if(result.length) {
                return {
                    ID: result[0].id,
                    IN_STOCK: result[0].stock, 
                    RESERVE: result[0].reserve, 
                    SOLD: result[0].sold
                }
            }
            else {
                throw new customError(404, `Error fetching data.`);
            }
        } catch (error) {
            //console.error({id, error});
            throw error;
        }
    }

    public async insertStock(id:number, product:string, qtd:number): Promise<responsePathStock> {
        try {
            await this.db.query(`INSERT INTO IN_STOCK (id, product, qtd) VALUES (${id}, '${product}', ${qtd})`);

            return {
                id: id, 
                product: product, 
                stock: qtd
            }
        } catch (error) {
            //console.error({id, product, qtd, error});
            throw new customError(404, `Error inserting data into IN_STOCK table.`);
        }
    }

    public async updateStock(id:number, product:string, qtd:number): Promise<responsePathStock> {
        try {
            await this.db.query(`UPDATE IN_STOCK SET product = '${product}', qtd = ${qtd} WHERE id = ${id};`);

            return {
                id: id, 
                product: product, 
                stock: qtd
            }
        } catch (error) {
            //console.error({id, product, qtd, error});
            throw new customError(404, `Error updating data in IN_STOCK table.`);
        }
    }

    public async insertStockReserve(id:number, product:string, uuid:string): Promise<responseInsertStockReserve> {
        try {
            await this.db.query<UpdateProduct[]>(`INSERT INTO RESERVED (id_stock, product, reservationToken) VALUES (${id}, '${product}', '${uuid}');`);

            return {
                id: id, 
                product: product, 
                reservationToken: uuid
            }
        } catch (error) {
            //console.error({id, product, uuid, error});
            throw new customError(404, `Error inserting data into RESERVED table.`);
        }
    }

    public async deleteStockReserve(id:number, reservationToken:string): Promise<void> {
        try {
            await this.db.query(`DELETE FROM RESERVED WHERE id_stock = ${id} AND reservationToken = '${reservationToken}';`);
        } catch (error) {
            //console.error({id, reservationToken, error});
            throw new customError(404, `Error deleting data in RESERVED table.`);
        }
    }
    
    public async insertStockSold(id:number, product:string, uuid:string): Promise<responseInsertStockSold> {
        try {
            await this.db.query(`INSERT INTO SOLD (id_stock, product, reservationToken) VALUES (${id}, '${product}', '${uuid}');`);

            return {
                id: id, 
                product: product, 
                reservationToken: uuid
            }                
        } catch (error) {
            //console.error(error);
            throw new customError(404, `Error inserting data into SOLD table.`);
        }
    }
}
