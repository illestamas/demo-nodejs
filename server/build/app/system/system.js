"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const winston_1 = require("../../types/winston");
const moment_1 = __importDefault(require("moment"));
const router = express_1.default.Router();
router.get("/system", async (req, res, next) => {
    if (!req.headers.authorization) {
        return res.status(401).json({
            error: "[authorization] header must be provided!"
        });
    }
    if (req.headers.authorization !== process.env.APPSETTING_ADMIN_SECRET) {
        global.logger.log(winston_1.LogLevel.warn, "Invalid admin secret provided!");
        return res.status(401).json({
            error: "[authorization] header invalid!"
        });
    }
    return next();
}, async (req, res) => {
    const generalStatus = {
        uptime: process.uptime(),
        timestamp: (0, moment_1.default)()
    };
    global.system.general = generalStatus;
    return res.json(global.system);
});
exports.default = router;
