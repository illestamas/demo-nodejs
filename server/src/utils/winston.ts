import { Logger, createLogger, transports, format } from "winston";
import { Logtail } from "@logtail/node";
import { LogtailTransport } from "@logtail/winston";
import { LogLevel } from "@ts/winston";

const LOG_LEVELS = {
  fatal: 0,
  emergency: 1,
  error: 2,
  warn: 3,
  info: 4,
  debug: 5
};

export default class Winston {
  _logger: Logger;
  _logtail: Logtail;

  initLogger() {
    this._logger = createLogger({
      levels: LOG_LEVELS,
      level: process.env.APPSETTING_LOG_LEVEL,
      format: format.combine(
        format.timestamp({format: 'YYYY-MM-DD HH:mm:ss'}),
        format.printf((info: any) => {
          return `[LV]: ${info.level.toUpperCase()} [DT]: ${info.timestamp} [MS]: ${info.message.toString()}`;
        }),
        format.splat()
      )
    });

    return this;
  }

  addConsoleTransport() {
    this._logger.add(new (transports.Console)({
      level: process.env.APPSETTING_LOG_LEVEL
    }));

    return this;
  }

  addLogtailTransport(logtailApiKey: string) {
    this._logtail = new Logtail(logtailApiKey);    
    this._logger.add(new LogtailTransport(this._logtail));

    return this;
  }

  log(level: LogLevel, message: string) {
    this._logger.log({
      level: level.toString(),
      message
    });
  }
}