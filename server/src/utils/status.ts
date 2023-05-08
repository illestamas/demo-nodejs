/* 
  Global system monitoring
  - stores information about db statuses, api statuses, and other key metrics.
*/

import {
  SystemStatus
} from "@ts/system";

import moment from "moment";

export function init() {
  const systemStatus: SystemStatus = {
    general: {
      uptime: process.uptime(),
      timestamp: moment()
    },
    db: {
      status: "null",
      ssl: false,
      migrations: false,
      touched: null
    }
  }

  global.system = systemStatus;
}
