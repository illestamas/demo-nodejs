import express, { Express } from "express";
import * as dotenv from "dotenv";

import SequelizeConnection from "@db/sequelize";

import * as systemLogging from "@utils/status";

import * as authController from "@app/auth/auth";
import * as artworkController from "@app/artwork/artwork";
import * as userController from "@app/user/user";
import * as systemController from "@app/system/system";

import Winston from "@utils/winston";
import { LogLevel } from "@ts/winston";
import { SequelizeConnectionOptions } from "@ts/connection";

dotenv.config();
systemLogging.init();

const app: Express = express();

// configure express to read http requests' JSON body.
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({extended: true, limit: '50mb'}));

// as "authController" contains a middleware that validates jwt tokens, it has to be the first.
app.use(authController.default);
app.use(artworkController.default);
app.use(userController.default);
app.use(systemController.default);

app.listen(process.env.APPSETTING_PORT, async() => {
  // initialize logger, optionally enable logtail logging.
  const logger: Winston = new Winston()
    .initLogger()
    .addConsoleTransport();

  if (process.env.APPSETTING_LOGTAIL_API_KEY) {
    logger.addLogtailTransport(process.env.APPSETTING_LOGTAIL_API_KEY);
  }
  global.logger = logger;

  logger.log(LogLevel.info, "Application build init.");

  // initialize database connection.
  const sequelizeConnection: SequelizeConnectionOptions = {
    dialect: "mysql",
    database: process.env.APPSETTING_DB_DATABASE,
    username: process.env.APPSETTING_DB_USERNAME,
    password: process.env.APPSETTING_DB_PASSWORD,
    host: process.env.APPSETTING_DB_HOST,
    port: parseInt(process.env.APPSETTING_DB_PORT),
    logging: process.env.APPSETTING_DB_LOGGING === "1"
  };
  const sequelize: SequelizeConnection = new SequelizeConnection("postgres")
    .initSequelize(sequelizeConnection)
    .initUmzug();

  // attach monitoring
  global.system.db = sequelize._status;

  await sequelize.initModels();
  await sequelize.initAssociations()
  await sequelize.up();
  await sequelize.enableMonitoring(process.env.APPSETTING_DB_STATUS_CHECK_INTERVAL);

  if (process.env.APPSETTING_ENVIRONMENT === "development") {
    await sequelize.initSeeders();    
  }
  
  global.db = sequelize._db;
  global.sequelize = sequelize._sequelize;

  logger.log(LogLevel.info, `Application build completed. Server is now listening to requests on port ${process.env.APPSETTING_PORT}`);
});