import * as request from "supertest";
import * as dotenv from "dotenv";

dotenv.config();

const baseURL = `http://localhost:${process.env.APPSETTING_PORT}`;
var token: string;

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