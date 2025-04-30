/**
 * @tsoaModel
 */

export interface responsePathStock{
    id: number, 
    product: string, 
    stock: number
}
export interface responseGetStock {
    ID: number
    IN_STOCK: number, 
    RESERVE: number, 
    SOLD: number
}

export interface responseInsertStockReserve {
    id: number
    product: string, 
    reservationToken: string
}

export interface responseInsertStockSold {
    id: number
    product: string, 
    reservationToken: string
}


