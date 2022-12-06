const { parse } = require("csv-parse");
const fs = require("fs");
const path = require("path");

const planets = require("./planets.mongo");

function isHabitablePlanet(planet) {
  return (
    isDispositionConfirmed(planet) &&
    isModerateSunlight(planet) &&
    isModerateRadius(planet)
  );

  function isDispositionConfirmed(planet) {
    return planet["koi_disposition"] === "CONFIRMED";
  }

  function isModerateSunlight(planet) {
    return planet["koi_insol"] > 0.36 && planet["koi_insol"] < 1.11;
  }

  function isModerateRadius(planet) {
    return planet["koi_prad"] < 1.6;
  }
}

function loadPlanetsData() {
  return new Promise((resolve, reject) => {
    fs.createReadStream(
      path.join(__dirname, "..", "..", "data", "kepler_data.csv")
    )
      .pipe(
        parse({
          comment: "#",
          columns: true,
        })
      )
      .on("data", async (data) => {
        if (isHabitablePlanet(data)) {
          savePlanets(data);
        }
      })
      .on("error", (err) => {
        console.log(err);
        reject(err);
      })
      .on("end", async () => {
        resolve();
      });
  });
}

async function getAllPLanets() {
  return await planets.find(
    {},
    {
      _id: 0,
      __v: 0,
    }
  );
}

async function savePlanets(planet) {
  try {
    await planets.updateOne(
      {
        keplerName: planet.keplerName,
      },
      {
        keplerName: planet.keplerName,
      },
      {
        upsert: true,
      }
    );
  } catch (err) {
    console.log(`Could not save planet ${err}`);
  }
}

module.exports = {
  loadPlanetsData,
  getAllPLanets,
};
