const request = require("supertest");
const app = require("../../app");

describe("Test GET /launches", () => {
  test("Should return 200 sucess code", async () => {
    const response = await request(app)
      .get("/launches")
      .expect("Content-Type", /json/)
      .expect(200);
  });
});

describe("Test POST /launches", () => {
  const testObj = {
    mission: "USS Enterprise",
    rocket: "Navat",
    target: "Kepler-186 f",
    launchDate: "January 4, 2028",
  };

  const testObjWithoutDate = {
    mission: "USS Enterprise",
    rocket: "Navat",
    target: "Kepler-186 f",
  };

  const testObjInvalidDate = {
    mission: "USS Enterprise",
    rocket: "Navat",
    target: "Kepler-186 f",
    launchDate: "Hehehe=)",
  };

  test("Should return 201 sucess code", async () => {
    const response = await request(app)
      .post("/launches")
      .send(testObj)
      .expect("Content-Type", /json/)
      .expect(201);

    const requestDate = new Date(testObj.launchDate).valueOf();
    const responseDate = new Date(response.body.launchDate).valueOf();
    expect(responseDate).toBe(requestDate);

    expect(response.body).toMatchObject(testObjWithoutDate);
  });

  test("Should catch missed properties", async () => {
    const response = await request(app)
      .post("/launches")
      .send(testObjWithoutDate)
      .expect("Content-Type", /json/)
      .expect(400);

    expect(response.body).toStrictEqual({
      error: "Missing required launch property",
    });
  });

  test("Should catch invalid dates", async () => {
    const response = await request(app)
      .post("/launches")
      .send(testObjInvalidDate)
      .expect("Content-Type", /json/)
      .expect(400);

    expect(response.body).toStrictEqual({
      error: "Wrong date format",
    });
  });
});