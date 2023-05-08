"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const sequelize_typescript_1 = require("sequelize-typescript");
const umzug_1 = require("umzug");
const winston_1 = require("../types/winston");
const node_cron_1 = __importDefault(require("node-cron"));
const moment_1 = __importDefault(require("moment"));
const userSeeder = __importStar(require("./seeders/user"));
class SequelizeConnection {
    _name;
    _logger = global.logger;
    _status = {
        status: "null",
        ssl: false,
        migrations: false,
        touched: (0, moment_1.default)()
    };
    _sequelize;
    _umzug;
    _db = {};
    _monitoringTask;
    constructor(name) {
        this._name = name;
    }
    initSequelize(options) {
        this._logger.log(winston_1.LogLevel.debug, `[${this._name}] sequelize init.`);
        const sequelizeOptions = {
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
        this._sequelize = new sequelize_typescript_1.Sequelize(sequelizeOptions);
        this._status.status = "up";
        this._status.touched = (0, moment_1.default)();
        this._logger.log(winston_1.LogLevel.debug, `[${this._name}] sequelize completed.`);
        return this;
    }
    initUmzug() {
        this._logger.log(winston_1.LogLevel.debug, "Umzug init.");
        this._umzug = new umzug_1.Umzug({
            migrations: {
                glob: path.join(__dirname, "migrations/*"),
                resolve: params => {
                    return {
                        name: params.name,
                        path: params.path,
                        ...require(params.path)
                    };
                }
            },
            context: this._sequelize.getQueryInterface(),
            storage: new umzug_1.SequelizeStorage({
                sequelize: this._sequelize,
                modelName: "sequelize_meta"
            }),
            logger: console
        });
        this._logger.log(winston_1.LogLevel.debug, "Umzug completed.");
        return this;
    }
    async initModels() {
        this._logger.log(winston_1.LogLevel.debug, "Sequelize models init.");
        const files = fs.readdirSync(path.join(__dirname, "models")).filter((file) => {
            return (file.indexOf(".") !== 0) && ([".js", ".ts"].includes(file.slice(-3)));
        });
        for (const file of files) {
            const { default: defaultFunc } = await Promise.resolve(`${path.join(path.join(__dirname, "models"), file)}`).then(s => __importStar(require(s)));
            const model = await defaultFunc(this._sequelize);
            this._db[model.name] = model;
        }
        this._logger.log(winston_1.LogLevel.debug, "Sequelize models completed.");
        return this;
    }
    async initAssociations() {
        this._logger.log(winston_1.LogLevel.debug, "Sequelize associations init.");
        Object.keys(this._db).forEach(modelName => {
            if (this._db[modelName].associate) {
                this._db[modelName].associate(this._db);
            }
        });
        this._logger.log(winston_1.LogLevel.debug, "Sequelize associations completed.");
        return this;
    }
    async up() {
        if (["development"].includes(process.env.APPSETTING_ENVIRONMENT)) {
            this._logger.log(winston_1.LogLevel.debug, "DB schema drop init.");
            await this._sequelize.drop();
            this._logger.log(winston_1.LogLevel.debug, "DB schema drop completed.");
        }
        this._logger.log(winston_1.LogLevel.debug, "Umzug sync init.");
        await this._umzug.up();
        this._status.migrations = true;
        this._status.touched = (0, moment_1.default)();
        this._logger.log(winston_1.LogLevel.debug, "Umzug sync completed.");
        return this;
    }
    async enableMonitoring(monitoringInterval) {
        if (!node_cron_1.default.validate(monitoringInterval)) {
            this._logger.log(winston_1.LogLevel.error, "Invalid cron syntax!");
            return this;
        }
        this._monitoringTask = node_cron_1.default.schedule(monitoringInterval, async () => {
            try {
                await this._sequelize.authenticate();
                if (this._status.status === "down") {
                    this._logger.log(winston_1.LogLevel.info, "Sequelize connection established!");
                    this._status.status = "up";
                    this._status.touched = (0, moment_1.default)();
                }
            }
            catch (error) {
                if (this._status.status === "up") {
                    this._logger.log(winston_1.LogLevel.emergency, "Sequelize connection lost!");
                    this._status.status = "down";
                    this._status.touched = (0, moment_1.default)();
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
exports.default = SequelizeConnection;
