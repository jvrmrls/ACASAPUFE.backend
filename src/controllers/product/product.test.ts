import request from "supertest";
import "dotenv/config";
import App from "../../App";
import { Application } from "express";

const application = new App();
let app: Application;
beforeAll(() => {
  app = application.app;
});

describe("GET /api/products", () => {
  test("should return status code 200", async () => {
    const response = await request(app).get("/api/products");
    expect(response.status).toBe(200);
  });
});
