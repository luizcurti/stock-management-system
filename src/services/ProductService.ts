import { Request as ExRequest } from "express";
import { Service } from "./Service";
import { ProductRepository } from "../repositories/ProductRepository";
import { v4 as uuidv4 } from 'uuid';
import { customError } from "../customErrors/customErrors";
import { responseGetStock, responseInsertStockReserve, responsePathStock } from "../models/responseTypes";

export class ProductService extends Service {
    constructor(
        private rep: ProductRepository = new ProductRepository(),
    ) {
        super();
    }
    public async pathStock(request:ExRequest):Promise<responsePathStock> {
        if(!request.params.id) throw new customError(401, "Missing or invalid ID.");
        const id:number = parseInt(request.params.id);
        const { product, qtd } = request.body;

        try {
            const returnSearch = await this.rep.searchStock(id);

            if(returnSearch == null) {
                return await this.rep.insertStock(id, product, qtd);
            } else if(returnSearch != null) {
                return await this.rep.updateStock(id, product, qtd);
            } else {
                throw new customError(404, `Error fetching data from IN_STOCK table.`);    
            }
        } catch (error) {
            console.error({id, error});
            throw error;
        }
    }    

    public async getStock(request:ExRequest):Promise<responseGetStock | void> {
        if(!request.params.id) throw new customError(401, "Missing or invalid ID.");
        const id:number = parseInt(request.params.id);

        return await this.rep.getStock(id);
    }

    public async postStockReserve(request:ExRequest):Promise<responseInsertStockReserve | void> {
        if(!request.params.id) throw new customError(401, "Missing or invalid ID.");
        const id:number = parseInt(request.params.id);

        try {
            const searchStock = await this.rep.searchStock(id);

            if(searchStock != null) {
                const { product, qtd } = searchStock;
                const uuid = uuidv4();
    
                if(qtd > 0){
                    await this.rep.updateStock(id, product, qtd-1);
                    return await this.rep.insertStockReserve(id, product, uuid);
                }
                else{
                    throw new customError(404, `Error updating / inserting data in IN_STOCK / RESERVE table.`);    
                }
            }
            else{
                throw new customError(404, `Error fetching data from IN_STOCK table.`);    
            }
        } catch (error) {
            console.error({id, error});
            throw error;
        }
    }

    public async postStock(request:ExRequest):Promise<void> {
        if(!request.params.id) throw new customError(401, "Missing or invalid ID.");
        const id:number = parseInt(request.params.id);
        const { reservationToken } = request.body;

        try{
            const searchStockReserve = await this.rep.searchStockReserve(id, reservationToken);
            
            if(searchStockReserve != null) {

                await this.rep.deleteStockReserve(id, reservationToken);
                const searchStock = await this.rep.searchStock(id);

                if(searchStock != null) {
                    const { product, qtd } = searchStock;

                    if(qtd >= 0){
                        await this.rep.updateStock(id, product, qtd+1);
                    }
                    else{
                        throw new customError(404, `Error updating data in IN_STOCK table.`);    
                    }
                }
                else{
                    throw new customError(404, `Error fetching data from IN_STOCK table.`);    
                }
            }
            else{
                throw new customError(404, `Error fetching data from RESERVE table.`);    
            }
        } catch (error) {
            console.error({id, error});
            throw error;
        }
    }

    public async postStockSold(request:ExRequest):Promise<void> {
        if(!request.params.id) throw new customError(401, "Missing or invalid ID.");
        const id:number = parseInt(request.params.id);
        const { reservationToken } = request.body;

        try{
            const searchStockReserve = await this.rep.searchStockReserve(id, reservationToken);

            if(searchStockReserve != null){
                const { product } = searchStockReserve;

                await this.rep.insertStockSold(id, product, reservationToken);
                await this.rep.deleteStockReserve(id, reservationToken);
            } else {
                throw new customError(404, `Error fetching data from RESERVE table.`);
            }
        } catch (error) {
            console.error({id, error});
            throw error;
        }
    }
}