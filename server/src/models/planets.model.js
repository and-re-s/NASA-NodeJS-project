const { parse } = require("csv-parse");
const fs = require("fs");
const path = require("path");

const habitablePlanets = [];

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
      .on("data", (data) => {
        if (isHabitablePlanet(data)) {
          habitablePlanets.push(data);
        }
      })
      .on("error", (err) => {
        console.log(err);
        reject(err);
      })
      .on("end", () => {
        resolve();
      });
  });
}

function getAllPLanets() {
  return habitablePlanets;
}

module.exports = {
  loadPlanetsData,
  getAllPLanets,
};
