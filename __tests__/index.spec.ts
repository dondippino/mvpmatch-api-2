import request from "supertest";
import { prismaMockInstance } from "../prisma";
import { App } from "../src/app";

describe("MVPMatch Test API 2  V1", () => {
  let userToken: Promise<string>;
  const mazeEntry = {
    entrance: "A1",
    gridSize: "8x8",
    walls: [
      "C1",
      "G1",
      "A2",
      "C2",
      "E2",
      "G2",
      "C3",
      "E3",
      "B4",
      "C4",
      "E4",
      "F4",
      "G4",
      "B5",
      "E5",
      "B6",
      "D6",
      "E6",
      "G6",
      "H6",
      "B7",
      "D7",
      "G7",
      "B8",
    ],
  };

  const mazeEntryMultiSolution = {
    entrance: "A1",
    gridSize: "8x8",
    walls: [
      "C1",
      "G1",
      "A2",
      "C2",
      "E2",
      "G2",
      "E3",
      "B4",
      "C4",
      "E4",
      "F4",
      "G4",
      "B5",
      "E5",
      "B6",
      "D6",
      "E6",
      "G6",
      "H6",
      "B7",
      "D7",
      "G7",
      "B8",
    ],
  };

  const mazeEntryNoSolution = {
    entrance: "A1",
    gridSize: "8x8",
    walls: [
      "C1",
      "G1",
      "A2",
      "C2",
      "E2",
      "G2",
      "C3",
      "E3",
      "B4",
      "C4",
      "E4",
      "F4",
      "G4",
      "B5",
      "E5",
      "B6",
      "D6",
      "E6",
      "G6",
      "H6",
      "B7",
      "D7",
      "G7",
      "A8",
      "B8",
      "C8",
      "D8",
      "E8",
      "F8",
      "G8",
      "H8",
    ],
  };

  const mazeEntryWithInvalidGridSize = { ...mazeEntry, gridSize: "AXB" };
  const mazeEntryWithInvalidEntrance = { ...mazeEntry, entrance: "1B" };
  const mazeEntryWithInvalidValuesWithinWall = { ...mazeEntry, walls: ["3"] };

  beforeAll(async () => {
    prismaMockInstance.user.findUnique.mockResolvedValue({
      username: "happyUser",
      password: "$2b$10$.7ZK8S5/aqKK2HfcsgJrrugf9zpVvXTzVgMVykypvNqBDKs.ZqyBu",
    });

    const response = await request(App).post("/login").send({
      username: "happyUser",
      password: "iTk19!n",
    });
    const { access_token } = response.body;
    userToken = Promise.resolve(access_token);
  });
  describe("POST /maze", () => {
    describe("", () => {
      test("it should throw an error 401, when user attempts to create a maze while unauthenticated", async () => {
        const response = await request(App).post("/mazes").send(mazeEntry);
        expect(response.statusCode).toBe(401);
      });

      test("it should throw an error 400, when the 'gridSize' param is not the right format", async () => {
        const response = await request(App)
          .post("/mazes")
          .auth(await userToken, { type: "bearer" })
          .send(mazeEntryWithInvalidGridSize);
        expect(response.statusCode).toBe(400);
      });

      test("it should throw an error 400, when the 'entrance' param is invalid", async () => {
        const response = await request(App)
          .post("/mazes")
          .auth(await userToken, { type: "bearer" })
          .send(mazeEntryWithInvalidEntrance);
        expect(response.statusCode).toBe(400);
      });

      test("it should throw an error 400, when the 'walls' param have one or more invalid value", async () => {
        const response = await request(App)
          .post("/mazes")
          .auth(await userToken, { type: "bearer" })
          .send(mazeEntryWithInvalidValuesWithinWall);
        expect(response.statusCode).toBe(400);
      });
    });

    describe("", () => {
      beforeEach(() => {
        prismaMockInstance.maze.create.mockResolvedValue({
          id: 1,
          ...mazeEntry,
          userId: "happyUser",
        });
      });

      test("it should return 200 OK, when the user successfully creates a maze", async () => {
        const response = await request(App)
          .post("/mazes")
          .auth(await userToken, { type: "bearer" })
          .send(mazeEntry);
        expect(response.statusCode).toBe(200);
      });
    });
  });

  describe("GET /maze/:mazeId/solution", () => {
    describe("", () => {
      beforeEach(() => {
        prismaMockInstance.maze.findUnique
          .mockResolvedValueOnce({
            id: 1,
            ...mazeEntry,
            userId: "happyUser",
          })
          .mockResolvedValueOnce({
            id: 2,
            ...{ ...mazeEntry, entrance: "A11" },
            userId: "happyUser",
          })
          .mockResolvedValueOnce({
            id: 3,
            ...mazeEntryNoSolution,
            userId: "happyUser",
          })
          .mockResolvedValueOnce({
            id: 4,
            ...mazeEntryMultiSolution,
            userId: "happyUser",
          })
          .mockResolvedValueOnce({
            id: 5,
            ...mazeEntryMultiSolution,
            userId: "happyUser",
          });
      });
      test("it should return 200 OK, when there is a solution to the maze", async () => {
        const response = await request(App)
          .get("/mazes/1/solution")
          .query({ steps: "min" })
          .auth(await userToken, { type: "bearer" });
        expect(response.statusCode).toBe(200);
      });

      test("it should throw error 500, when there is no solution to the maze, because the entrance falls outside the maze", async () => {
        const response = await request(App)
          .get("/mazes/2/solution")
          .query({ steps: "min" })
          .auth(await userToken, { type: "bearer" });
        expect(response.statusCode).toBe(500);
      });

      test("it should throw error 500, when there is no solution to the maze, because there is no exit", async () => {
        const response = await request(App)
          .get("/mazes/3/solution")
          .query({ steps: "min" })
          .auth(await userToken, { type: "bearer" });
        expect(response.statusCode).toBe(500);
      });

      test("it should return the expected path when 'min' is sepcified in the query string", async () => {
        const response = await request(App)
          .get("/mazes/4/solution")
          .query({ steps: "min" })
          .auth(await userToken, { type: "bearer" });
        expect(response.body).toMatchObject({
          path: ["A1", "B1", "B2", "B3", "A3", "A4", "A5", "A6", "A7", "A8"],
        });
      });

      test("it should return the expected path when 'max' is sepcified in the query string", async () => {
        const response = await request(App)
          .get("/mazes/4/solution")
          .query({ steps: "max" })
          .auth(await userToken, { type: "bearer" });
        expect(response.body).toMatchObject({
          path: [
            "A1",
            "B1",
            "B2",
            "B3",
            "C3",
            "D3",
            "D4",
            "D5",
            "C5",
            "C6",
            "C7",
            "C8",
            "D8",
            "E8",
            "F8",
            "G8",
            "H8",
          ],
        });
      });
    });
  });
});
