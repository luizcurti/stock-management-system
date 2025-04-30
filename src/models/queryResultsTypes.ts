/**
 * @tsoaModel
 */

import { RowDataPacket } from "mysql2";

export interface SelectProduct extends RowDataPacket{
    id: number
}

export interface UpdateProduct extends RowDataPacket{
    id: number
    product: string
    qtd: number
}
export interface InsertProduct extends RowDataPacket{
    id: number
    product: string
    qtd: number
}

export interface searchStock extends RowDataPacket {
    id: number
    product: string
    qtd: number
}

export interface searchStockReserve extends RowDataPacket {
    id_stock: number
    product: string
    reservationTokenqtd: string
}
