"use strict";
/*
  Global system monitoring
  - stores information about db statuses, api statuses, and other key metrics.
*/
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.init = void 0;
const moment_1 = __importDefault(require("moment"));
function init() {
    const systemStatus = {
        general: {
            uptime: process.uptime(),
            timestamp: (0, moment_1.default)()
        },
        db: {
            status: "null",
            ssl: false,
            migrations: false,
            touched: null
        }
    };
    global.system = systemStatus;
}
exports.init = init;
