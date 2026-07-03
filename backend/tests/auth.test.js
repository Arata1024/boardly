import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../src/index.js";

describe("auth", () => {
  const creds = { email: "alice@example.com", password: "supersecret123", name: "Alice" };

  it("registers a new user", async () => {
    const res = await request(app).post("/api/auth/register").send(creds);
    expect(res.status).toBe(201);
    expect(res.body.token).toBeTypeOf("string");
    expect(res.body.user.email).toBe(creds.email);
    expect(res.body.user.password).toBeUndefined();
  });

  it("rejects duplicate registration", async () => {
    const res = await request(app).post("/api/auth/register").send(creds);
    expect(res.status).toBe(409);
  });

  it("rejects weak passwords", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ email: "bob@example.com", password: "short", name: "Bob" });
    expect(res.status).toBe(400);
  });

  it("logs in with correct credentials", async () => {
    const res = await request(app).post("/api/auth/login").send(creds);
    expect(res.status).toBe(200);
    expect(res.body.token).toBeTypeOf("string");
  });

  it("rejects wrong password", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: creds.email, password: "wrongpassword" });
    expect(res.status).toBe(401);
  });

  it("rejects access to /me without a token", async () => {
    const res = await request(app).get("/api/auth/me");
    expect(res.status).toBe(401);
  });
});
