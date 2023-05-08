import * as fs from "fs";
import * as path from "path";

import {
  Sequelize,
  SequelizeOptions
} from "sequelize-typescript";

import {
  Umzug,
  SequelizeStorage
} from "umzug";

import Winston from "@utils/winston";

import { LogLevel } from "@ts/winston";
import { SequelizeConnectionOptions } from "@ts/connection";
import { DatabaseStatus } from "@ts/system";

import cron, {
  ScheduledTask
} from "node-cron";

import moment from "moment";

import * as userSeeder from "./seeders/user";

export default class SequelizeConnection {
  _name: string;
  _logger: Winston = global.logger;
  _status: DatabaseStatus = {
    status: "null",
    ssl: false,
    migrations: false,
    touched: moment()
  };

  _sequelize: Sequelize;
  _umzug: Umzug;
  _db: any = {};
  _monitoringTask: ScheduledTask;

  constructor(name: string) {
    this._name = name;
  }

  initSequelize(options: SequelizeConnectionOptions) {
    this._logger.log(LogLevel.debug, `[${this._name}] sequelize init.`);

    const sequelizeOptions: SequelizeOptions = {
      dialect: options.dialect,
      database: options.database,
      username: options.username,
      password: options.password,
      host: options.host,
      port: options.port,
      logging: options.logging,
      protocol: "tcp",
      dialectOptions: {
        compress: true,
        ssl: ["uat", "production"].includes(process.env.APPSETTING_ENVIRONMENT)
        ? fs.readFileSync(path.join(__dirname, "..", "..", "ssl/DigiCertGlobalRootCA.crt.pem"))
        : null
      },
      minifyAliases: true,
      pool: {
        max: 20,
        min: 0,
        acquire: 60000,
        idle: 10000
      }
    };

    this._status.ssl = ["uat", "production"].includes(process.env.APPSETTING_ENVIRONMENT);

    this._sequelize = new Sequelize(sequelizeOptions);

    this._status.status = "up";
    this._status.touched = moment();

    this._logger.log(LogLevel.debug, `[${this._name}] sequelize completed.`);

    return this;
  }

  initUmzug() {
    this._logger.log(LogLevel.debug, "Umzug init.");

    this._umzug = new Umzug({
      migrations: {
        glob: path.join(__dirname, "migrations/*"),
        resolve: params => {
          return {
            name: params.name,
            path: params.path,
            ...require(params.path)
          }
        }
      },
      context: this._sequelize.getQueryInterface(),
      storage: new SequelizeStorage({
        sequelize: this._sequelize,
        modelName: "sequelize_meta"
      }),
      logger: console
    });

    this._logger.log(LogLevel.debug, "Umzug completed.");

    return this;
  }

  async initModels() {
    this._logger.log(LogLevel.debug, "Sequelize models init.");

    const files = fs.readdirSync(path.join(__dirname, "models")).filter((file: any) => {
      return (file.indexOf(".") !== 0) && ([".js", ".ts"].includes(file.slice(-3)));
    });

    for (const file of files) {
      const { default: defaultFunc } = await import(path.join(path.join(__dirname, "models"), file));
      const model = await defaultFunc(this._sequelize);

      this._db[model.name] = model;
      
    }    

    this._logger.log(LogLevel.debug, "Sequelize models completed.");

    return this;
  }

  async initAssociations() {
    this._logger.log(LogLevel.debug, "Sequelize associations init.");

    Object.keys(this._db).forEach(modelName => {
      if (this._db[modelName].associate) {
        this._db[modelName].associate(this._db);
      }
    });

    this._logger.log(LogLevel.debug, "Sequelize associations completed.");

    return this;
  }

  async up() {
    if (["development"].includes(process.env.APPSETTING_ENVIRONMENT)) {
      this._logger.log(LogLevel.debug, "DB schema drop init.");

      await this._sequelize.drop();

      this._logger.log(LogLevel.debug, "DB schema drop completed.");
    }

    this._logger.log(LogLevel.debug, "Umzug sync init.");

    await this._umzug.up();

    this._status.migrations = true;
    this._status.touched = moment();

    this._logger.log(LogLevel.debug, "Umzug sync completed.");

    return this;
  }

  async enableMonitoring(monitoringInterval: string) {
    if (!cron.validate(monitoringInterval)) {
      this._logger.log(LogLevel.error, "Invalid cron syntax!");
      return this;
    }

    this._monitoringTask = cron.schedule(monitoringInterval, async() => {
      try {
        await this._sequelize.authenticate();

        if (this._status.status === "down") {
          this._logger.log(LogLevel.info, "Sequelize connection established!");

          this._status.status = "up";
          this._status.touched = moment();
        }
      } catch (error) {
        if (this._status.status === "up") {
          this._logger.log(LogLevel.emergency, "Sequelize connection lost!");

          this._status.status = "down";
          this._status.touched = moment();
        }
      }
    });
   
    return this;
  }

  async disableMonitoring() {
    if (this._monitoringTask) {
      this._monitoringTask.stop();
    }
   
    return this;
  }

  async initSeeders() {
    await userSeeder.add(this._db);

    return this;
  }
}