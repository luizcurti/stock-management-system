import { Controller, Get, Route, Request, Post, Patch } from 'tsoa';

import { Request as ExRequest } from 'express';
import { ProductService } from '../services/ProductService';
import {
  responseGetStock,
  responseInsertStockReserve,
  responsePathStock,
} from '../models/responseTypes';

@Route('/product')
export class ProductController extends Controller {
  constructor(private productService: ProductService = new ProductService()) {
    super();
  }

  /**
   * Update or create stock for a product
   */
  @Patch('/{id}/stock')
  public async patchStock(
    @Request() request: ExRequest
  ): Promise<responsePathStock> {
    return await this.productService.pathStock(request);
  }

  /**
   * Get stock information for a product
   */
  @Get('/{id}/')
  public async getStock(
    @Request() request: ExRequest
  ): Promise<responseGetStock> {
    return await this.productService.getStock(request);
  }

  /**
   * Reserve a product from stock
   */
  @Post('/{id}/reserve')
  public async postStockReserve(
    @Request() request: ExRequest
  ): Promise<responseInsertStockReserve> {
    return await this.productService.postStockReserve(request);
  }

  /**
   * Return a reserved product to stock
   */
  @Post('/{id}/')
  public async postStock(@Request() request: ExRequest): Promise<void> {
    return await this.productService.postStock(request);
  }

  /**
   * Mark a reserved product as sold
   */
  @Post('/{id}/sold')
  public async postStockSold(@Request() request: ExRequest): Promise<void> {
    return await this.productService.postStockSold(request);
  }
}
