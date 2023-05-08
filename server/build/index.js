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
const express_1 = __importDefault(require("express"));
const dotenv = __importStar(require("dotenv"));
const sequelize_1 = __importDefault(require("./db/sequelize"));
const systemLogging = __importStar(require("./utils/status"));
const authController = __importStar(require("./app/auth/auth"));
const artworkController = __importStar(require("./app/artwork/artwork"));
const userController = __importStar(require("./app/user/user"));
const systemController = __importStar(require("./app/system/system"));
const winston_1 = __importDefault(require("./utils/winston"));
const winston_2 = require("./types/winston");
dotenv.config();
systemLogging.init();
const app = (0, express_1.default)();
// configure express to read http requests' JSON body.
app.use(express_1.default.json({ limit: '50mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '50mb' }));
// as "authController" contains a middleware that validates jwt tokens, it has to be the first.
app.use(authController.default);
app.use(artworkController.default);
app.use(userController.default);
app.use(systemController.default);
app.listen(process.env.APPSETTING_PORT, async () => {
    // initialize logger, optionally enable logtail logging.
    const logger = new winston_1.default()
        .initLogger()
        .addConsoleTransport();
    if (process.env.APPSETTING_LOGTAIL_API_KEY) {
        logger.addLogtailTransport(process.env.APPSETTING_LOGTAIL_API_KEY);
    }
    global.logger = logger;
    logger.log(winston_2.LogLevel.info, "Application build init.");
    // initialize database connection.
    const sequelizeConnection = {
        dialect: "mysql",
        database: process.env.APPSETTING_DB_DATABASE,
        username: process.env.APPSETTING_DB_USERNAME,
        password: process.env.APPSETTING_DB_PASSWORD,
        host: process.env.APPSETTING_DB_HOST,
        port: parseInt(process.env.APPSETTING_DB_PORT),
        logging: process.env.APPSETTING_DB_LOGGING === "1"
    };
    const sequelize = new sequelize_1.default("postgres")
        .initSequelize(sequelizeConnection)
        .initUmzug();
    // attach monitoring
    global.system.db = sequelize._status;
    await sequelize.initModels();
    await sequelize.initAssociations();
    await sequelize.up();
    await sequelize.enableMonitoring(process.env.APPSETTING_DB_STATUS_CHECK_INTERVAL);
    if (process.env.APPSETTING_ENVIRONMENT === "development") {
        await sequelize.initSeeders();
    }
    global.db = sequelize._db;
    global.sequelize = sequelize._sequelize;
    logger.log(winston_2.LogLevel.info, `Application build completed. Server is now listening to requests on port ${process.env.APPSETTING_PORT}`);
});
