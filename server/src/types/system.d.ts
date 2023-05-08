import { Moment } from "moment";

export enum Status {
  "up",
  "down",
  "null"
}

export interface DatabaseStatus {
  status: keyof typeof Status,
  ssl: boolean,
  migrations: boolean,
  touched: Moment
}

export interface GeneralStatus {
  uptime: number,
  timestamp: Moment
}

export interface SystemStatus {
  general: GeneralStatus,
  db: DatabaseStatus
}