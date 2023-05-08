"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const winston_1 = require("winston");
const node_1 = require("@logtail/node");
const winston_2 = require("@logtail/winston");
const LOG_LEVELS = {
    fatal: 0,
    emergency: 1,
    error: 2,
    warn: 3,
    info: 4,
    debug: 5
};
class Winston {
    _logger;
    _logtail;
    initLogger() {
        this._logger = (0, winston_1.createLogger)({
            levels: LOG_LEVELS,
            level: process.env.APPSETTING_LOG_LEVEL,
            format: winston_1.format.combine(winston_1.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), winston_1.format.printf((info) => {
                return `[LV]: ${info.level.toUpperCase()} [DT]: ${info.timestamp} [MS]: ${info.message.toString()}`;
            }), winston_1.format.splat())
        });
        return this;
    }
    addConsoleTransport() {
        this._logger.add(new (winston_1.transports.Console)({
            level: process.env.APPSETTING_LOG_LEVEL
        }));
        return this;
    }
    addLogtailTransport(logtailApiKey) {
        this._logtail = new node_1.Logtail(logtailApiKey);
        this._logger.add(new winston_2.LogtailTransport(this._logtail));
        return this;
    }
    log(level, message) {
        this._logger.log({
            level: level.toString(),
            message
        });
    }
}
exports.default = Winston;
