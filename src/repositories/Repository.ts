import { Pool } from "mysql2/promise";
import { db } from "../config/database";

export class Repository {
  public db: Pool;
  constructor() {
    this.db = db;
  }
}