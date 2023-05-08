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
describe("/*", () => {
    it("should fail as jwt is not provided", async () => {
        const response = await request.default(baseURL).get("/");
        expect(response.statusCode).toBe(401);
        expect(response.body?.error).toBe("[jwt token] must be provided in the Authorization header!");
    });
    it("should fail as jwt token must be valid", async () => {
        const response = await request.default(baseURL).get("/").set({
            "Authorization": "wrong_key"
        });
        expect(response.statusCode).toBe(401);
        expect(response.body?.error).toBe("[jwt token] invalid!");
    });
});
describe("POST   /auth", () => {
    it("should fail due to email missing from request body", async () => {
        const response = await request.default(baseURL).post("/auth");
        expect(response.statusCode).toBe(200);
        expect(response.body?.error).toBe("[email] must be populated!");
    });
    it("should fail due to password missing from request body", async () => {
        const response = await request.default(baseURL).post("/auth").send({
            email: "user1@email.com"
        });
        expect(response.statusCode).toBe(200);
        expect(response.body?.error).toBe("[password] must be populated!");
    });
    it("should fail due to wrong email in request body", async () => {
        const response = await request.default(baseURL).post("/auth").send({
            email: "wrong_@email.com",
            password: "12345"
        });
        expect(response.statusCode).toBe(200);
        expect(response.body?.error).toBe("[email] not found!");
    });
    it("should fail due to wrong password in request body", async () => {
        const response = await request.default(baseURL).post("/auth").send({
            email: "user1@email.com",
            password: "wrong"
        });
        expect(response.statusCode).toBe(200);
        expect(response.body?.error).toBe("[password] invalid!");
    });
    it("should give back a valid jwt in response body's token", async () => {
        const response = await request.default(baseURL).post("/auth").send({
            email: "user1@email.com",
            password: "password"
        });
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty("token");
    });
});
describe("GET /auth/refresh", () => {
    it("should fail as jwt is not provided", async () => {
        const response = await request.default(baseURL).get("/auth/refresh");
        expect(response.statusCode).toBe(401);
        expect(response.body?.error).toBe("[jwt token] must be provided in the Authorization header!");
    });
    it("should fail as jwt token must be valid", async () => {
        const response = await request.default(baseURL).get("/auth/refresh").set({
            "Authorization": "wrong_key"
        });
        expect(response.statusCode).toBe(401);
        expect(response.body?.error).toBe("[jwt token] invalid!");
    });
    it("should give back a valid jwt in response body's token", async () => {
        const token = (await request.default(baseURL).post("/auth").send({
            email: "user1@email.com",
            password: "password"
        }))?.body?.token;
        const response = await request.default(baseURL).get("/auth/refresh").set({
            "Authorization": token
        });
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty("token");
    });
});
