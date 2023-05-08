import * as request from "supertest";
import * as dotenv from "dotenv";

dotenv.config();

const baseURL = `http://localhost:${process.env.APPSETTING_PORT}`;
var token: string;

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