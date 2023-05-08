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
var token;
const uuidWrongFormat = "wrong-format";
const uuidCorrectFormat = "e53da5c1-35ec-48e8-95fe-8c53026b55ca";
describe("GET /users/artworks/:reference", () => {
    it("should fail as reference is in wrong format", async () => {
        // login first to get jwt
        token = (await request.default(baseURL).post("/auth").send({
            email: "user1@email.com",
            password: "password"
        }))?.body?.token;
        const response = await request.default(baseURL).get(`/users/artworks/${uuidWrongFormat}`).set({
            "Authorization": token
        });
        expect(response.statusCode).toBe(200);
        expect(response.body?.error).toBe("[reference] must be a valid uuid!");
    });
    it("should fail as there's no matching user to reference", async () => {
        const response = await request.default(baseURL).get(`/users/artworks/${uuidCorrectFormat}`).set({
            "Authorization": token
        });
        expect(response.statusCode).toBe(200);
        expect(response.body?.error).toBe("[user] not found!");
    });
});
