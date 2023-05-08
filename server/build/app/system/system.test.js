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
Object.defineProperty(exports, "__esModule", { value: true });
const request = __importStar(require("supertest"));
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const baseURL = `http://localhost:${process.env.APPSETTING_PORT}`;
describe("GET /system", () => {
    it("should fail due to APPSETTING_ADMIN_SECRET not provided", async () => {
        const response = await request.default(baseURL).get("/system");
        expect(response.statusCode).toBe(401);
        expect(response.body?.error).toBe("[authorization] header must be provided!");
    });
    it("should fail due to APPSETTING_ADMIN_SECRET being incorrect", async () => {
        const response = await request.default(baseURL).get("/system").set({
            "Authorization": "wrong_key"
        });
        expect(response.statusCode).toBe(401);
        expect(response.body?.error).toBe("[authorization] header invalid!");
    });
    it("should succeed", async () => {
        const response = await request.default(baseURL).get("/system").set({
            "Authorization": process.env.APPSETTING_ADMIN_SECRET
        });
        expect(response.statusCode).toBe(200);
    });
});
