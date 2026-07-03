import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import app from "../src/index.js";

// These tests exist to prove the core claim of a multi-tenant app: one
// user can never read, modify, or delete another user's data, even when
// they know the resource's id.
describe("tenant isolation", () => {
  let tokenA, tokenB, projectId;

  beforeAll(async () => {
    const a = await request(app)
      .post("/api/auth/register")
      .send({ email: "owner@example.com", password: "password123", name: "Owner" });
    tokenA = a.body.token;

    const b = await request(app)
      .post("/api/auth/register")
      .send({ email: "intruder@example.com", password: "password123", name: "Intruder" });
    tokenB = b.body.token;

    const project = await request(app)
      .post("/api/projects")
      .set("Authorization", `Bearer ${tokenA}`)
      .send({ title: "Owner's private project" });
    projectId = project.body.project.id;
  });

  it("owner can fetch their own project", async () => {
    const res = await request(app)
      .get(`/api/projects/${projectId}`)
      .set("Authorization", `Bearer ${tokenA}`);
    expect(res.status).toBe(200);
  });

  it("a different user cannot fetch it", async () => {
    const res = await request(app)
      .get(`/api/projects/${projectId}`)
      .set("Authorization", `Bearer ${tokenB}`);
    expect(res.status).toBe(403);
  });

  it("a different user cannot update it", async () => {
    const res = await request(app)
      .patch(`/api/projects/${projectId}`)
      .set("Authorization", `Bearer ${tokenB}`)
      .send({ title: "Hijacked" });
    expect(res.status).toBe(403);
  });

  it("a different user cannot delete it", async () => {
    const res = await request(app)
      .delete(`/api/projects/${projectId}`)
      .set("Authorization", `Bearer ${tokenB}`);
    expect(res.status).toBe(403);
  });

  it("a different user's project list never includes it", async () => {
    const res = await request(app)
      .get("/api/projects")
      .set("Authorization", `Bearer ${tokenB}`);
    expect(res.status).toBe(200);
    expect(res.body.projects.find((p) => p.id === projectId)).toBeUndefined();
  });
});
