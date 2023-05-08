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
const idNonExisting = 1; // non-existing id within artwork catalogue
const idInvalidFormat = "wrong"; // non-existing id within artwork catalogue
const idExisting = 22736; // existing id within artwork catalogue
const idExisting2 = 26715; // existing id within artwork catalogue
describe("GET /artworks", () => {
    it("should fail as pageNumber is not provided", async () => {
        // login first to get jwt
        token = (await request.default(baseURL).post("/auth").send({
            email: "user1@email.com",
            password: "password"
        }))?.body?.token;
        const response = await request.default(baseURL).get("/artworks").set({
            "Authorization": token
        });
        expect(response.statusCode).toBe(200);
        expect(response.body?.error).toBe("[pageNumber] must be a valid number!");
    });
    it("should fail as pageLimit is not provided", async () => {
        // login first to get jwt
        token = (await request.default(baseURL).post("/auth").send({
            email: "user1@email.com",
            password: "password"
        }))?.body?.token;
        const response = await request.default(baseURL).get("/artworks?pageNumber=1").set({
            "Authorization": token
        });
        expect(response.statusCode).toBe(200);
        expect(response.body?.error).toBe("[pageLimit] must be a valid number!");
    });
    it("should succeed", async () => {
        // login first to get jwt
        token = (await request.default(baseURL).post("/auth").send({
            email: "user1@email.com",
            password: "password"
        }))?.body?.token;
        const response = await request.default(baseURL).get("/artworks?pageNumber=1&pageLimit=10").set({
            "Authorization": token
        });
        expect(response.statusCode).toBe(200);
        const record = response.body?.data[0];
        expect(record).toHaveProperty("id");
        expect(record).toHaveProperty("title");
        expect(record).toHaveProperty("author");
        expect(record).toHaveProperty("thumbnail");
    });
});
describe("GET /artworks/:id", () => {
    it("should fail as id does not exist", async () => {
        const response = await request.default(baseURL).get(`/artworks/${idNonExisting}`).set({
            "Authorization": token
        });
        expect(response.statusCode).toBe(200);
        expect(response.body?.error).toBe("Not found");
    });
    it("should succeed", async () => {
        const response = await request.default(baseURL).get(`/artworks/${idExisting}`).set({
            "Authorization": token
        });
        expect(response.statusCode).toBe(200);
        const record = response.body;
        expect(record).toHaveProperty("id");
        expect(record).toHaveProperty("title");
        expect(record).toHaveProperty("author");
        expect(record).toHaveProperty("thumbnail");
    });
});
describe("GET /artworks/purchase/:id", () => {
    it("should fail as artwork id does not exist", async () => {
        const response = await request.default(baseURL).post(`/artworks/purchase/${idInvalidFormat}`).set({
            "Authorization": token
        });
        expect(response.statusCode).toBe(200);
        expect(response.body?.error).toBe("[id] must be a valid number!");
    });
    it("should fail as id does not exist", async () => {
        const response = await request.default(baseURL).post(`/artworks/purchase/${idNonExisting}`).set({
            "Authorization": token
        });
        expect(response.statusCode).toBe(200);
        expect(response.body?.error).toBe("Artwork does not exist in catalogue!");
    });
    it("should fail as artwork already belongs to a user", async () => {
        const response = await request.default(baseURL).post(`/artworks/purchase/${idExisting}`).set({
            "Authorization": token
        });
        expect(response.statusCode).toBe(200);
        expect(response.body?.error).toBe("Artwork is not for sale!");
    });
    it("should succeed", async () => {
        const response = await request.default(baseURL).post(`/artworks/purchase/${idExisting2}`).set({
            "Authorization": token
        });
        expect(response.statusCode).toBe(200);
        expect(response.body?.message).toBe("Purchase has been successful!");
    });
});
