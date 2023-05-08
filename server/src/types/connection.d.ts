import { Dialect } from "sequelize";

export interface SequelizeConnectionOptions {
  dialect: Dialect,
  database: string,
  username: string,
  password: string,
  host: string,
  port: number,
  logging: boolean
}