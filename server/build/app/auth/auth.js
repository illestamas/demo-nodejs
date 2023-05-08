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
const bcrypt_1 = require("bcrypt");
const deep_email_validator_1 = __importDefault(require("deep-email-validator"));
const jwt = __importStar(require("jsonwebtoken"));
const router = express_1.default.Router();
/* middleware for authenticating jwt token across the application */
router.use('/', async function (req, res, next) {
    // skip jwt check for endpoints
    if (req.url.includes("/auth") || req.url.includes("/system")) {
        return next();
    }
    if (!req.headers.authorization) {
        return res.status(401).json({
            error: "[jwt token] must be provided in the Authorization header!"
        });
    }
    jwt.verify(req.headers.authorization.toString(), process.env.APPSETTING_JWT_SECRET, function (error, decoded) {
        if (error) {
            return res.status(401).json({
                error: "[jwt token] invalid!"
            });
        }
        // add user to "request"
        req.user = decoded.user;
        return next();
    });
});
router.post("/auth", async (req, res, next) => {
    if (!req.body?.email) {
        return res.json({
            error: "[email] must be populated!"
        });
    }
    if (!req.body?.password) {
        return res.json({
            error: "[password] must be populated!"
        });
    }
    // validate email making sure it is a valid address that actually exists
    if (process.env.APPSETTING_EMAIL_VALIDATION === "advanced") {
        const isEmailValid = (await (0, deep_email_validator_1.default)(req.body.email)).valid;
        if (!isEmailValid) {
            return res.json({
                error: "[email] invalid!"
            });
        }
    }
    return next();
}, async (req, res, next) => {
    // fetch user from db based on email
    const user = await global.db.user.findOne({
        attributes: [
            "reference",
            "password"
        ],
        where: {
            email: req.body.email
        }
    });
    if (!user) {
        return res.json({
            error: "[email] not found!"
        });
    }
    // As password is hashed on the backend, use "bcrypt" to compare the hashed password with the plain one provided by the user
    const isPasswordMatch = (0, bcrypt_1.compareSync)(req.body.password.toString(), user.getDataValue("password"));
    if (!isPasswordMatch) {
        return res.json({
            error: "[password] invalid!"
        });
    }
    // provide jwt token for the user.
    /*
      As JWT is public and can be decoded, user "reference" is used instead of user "Id" to link to a user object.
      "Id" can give information on how many records are in a table, therefore it's safer to use a uuid instead.
    */
    const token = jwt.sign({
        user: {
            reference: user.getDataValue("reference")
        }
    }, process.env.APPSETTING_JWT_SECRET, {
        expiresIn: process.env.APPSETTING_JWT_EXPIRATION,
        algorithm: "HS256"
    });
    return res.json({
        token
    });
});
router.get('/auth/refresh', async function (req, res, next) {
    if (!req.headers.authorization) {
        return res.status(401).json({
            error: "[jwt token] must be provided in the Authorization header!"
        });
    }
    jwt.verify(req.headers.authorization.toString(), process.env.APPSETTING_JWT_SECRET, function (error, decoded) {
        if (error) {
            return res.status(401).json({
                error: "[jwt token] invalid!"
            });
        }
        const token = jwt.sign({
            user: decoded.user
        }, process.env.APPSETTING_JWT_SECRET, {
            expiresIn: process.env.APPSETTING_JWT_EXPIRATION,
            algorithm: "HS256"
        });
        return res.json({
            token
        });
    });
});
exports.default = router;
