import {
  Controller,
  Get,
  Route,
  Request,
  Post,
  Patch,
} from "tsoa";

import { Request as ExRequest } from "express";
import { ProductService } from "../services/ProductService";
import { responseGetStock, responseInsertStockReserve, responsePathStock } from "../models/responseTypes";

@Route("/product")
export class ProductController extends Controller {
  constructor(
    private productService:ProductService = new ProductService()
  ) {
    super();
  }

  @Patch("/:id/stock")
  public async pathStock(
    @Request() request:ExRequest
  ): Promise<responsePathStock> {
    return await this.productService.pathStock(request);
  }

  @Get("/:id/")
  public async getStock(
    @Request() request:ExRequest
  ): Promise<responseGetStock | void> {
    return await this.productService.getStock(request);
  }

  @Post("/:id/reserve")
  public async postStockReserve(
    @Request() request:ExRequest,
  ): Promise<responseInsertStockReserve | void> {
    return await this.productService.postStockReserve(request);
  }

  @Post("/:id/")
  public async postStock(
    @Request() request:ExRequest,
  ): Promise<void> {
    return await this.productService.postStock(request);
  }

  @Post("/:id/sold")
  public async postStockSold(
    @Request() request:ExRequest,
  ): Promise<void> {
    return await this.productService.postStockSold(request);
  }
}