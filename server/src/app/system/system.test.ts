import * as request from "supertest";
import * as dotenv from "dotenv";

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