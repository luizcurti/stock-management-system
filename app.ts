import * as dotenv from "dotenv";
dotenv.config();
import express, { Request, Response, NextFunction } from "express"; // Use default Request and Response
import bodyParser from "body-parser";
import { RegisterRoutes } from "./build/routes";
import swaggerUI from "swagger-ui-express";
import cors from "cors";

export const app = express();
const swaggerDoc = require('./swagger.json');

app.use(cors({origin: '*'}));

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(bodyParser.json());

app.use('/product/doc', swaggerUI.serve, swaggerUI.setup(swaggerDoc));

RegisterRoutes(app);

// 404 Not Found Handler
app.use(function notFoundHandler(_req: Request, res: Response) {
  res.status(404).send({
    message: "Not Found",
  });
});