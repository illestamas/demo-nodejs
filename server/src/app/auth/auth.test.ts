import * as request from "supertest";
import * as dotenv from "dotenv";

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