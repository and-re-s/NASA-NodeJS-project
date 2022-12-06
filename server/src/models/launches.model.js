const axios = require("axios");

const launchesDatabase = require("./launches.mongo");
const planetsDatabase = require("./planets.mongo");

const DEFAULT_FLIGHT_NUMBER = 100;
const SPACEX_API_URL = "https://api.spacexdata.com/v4/launches/query";

async function getLatestFlightNumber() {
  const latestLaunch = await launchesDatabase.findOne().sort("-flightNumber");
  return latestLaunch?.flightNumber;
}

async function getAllLaunches(skip, limit) {
  return await launchesDatabase
    .find(
      {},
      {
        _id: 0,
        __v: 0,
      }
    )
    .sort({ flightNumber: 1 })
    .skip(skip)
    .limit(limit);
}

async function grabSpaceXData() {
  console.log("Downloading...");
  const response = await axios.post(SPACEX_API_URL, {
    query: {},
    options: {
      pagination: false,
      populate: [
        {
          path: "rocket",
          select: {
            name: 1,
          },
        },
        {
          path: "payloads",
          select: {
            customers: 1,
          },
        },
      ],
    },
  });

  const launchDocs = response.data.docs;
  for (const launchDoc of launchDocs) {
    const payloads = launchDoc["payloads"];
    const customers = payloads.flatMap((payload) => {
      return payload["customers"];
    });

    const launch = {
      flightNumber: launchDoc["flight_number"],
      mission: launchDoc["name"],
      rocket: launchDoc["rocket"]["name"],
      launchDate: launchDoc["date_local"],
      customers: customers,
      upcoming: false,
      success: launchDoc["success"],
    };

    await saveLaunch(launch);
  }
  console.log("Data succefully grabbed");
}

async function loadLaunchData() {
  const alreadyDownloaded = await findLaunch({
    flightNumber: 1,
    rocket: "Falcon 1",
    mission: "FalconSat",
  });

  if (!alreadyDownloaded) {
    grabSpaceXData();
  }
  return;
}

async function saveLaunch(launch) {
  await launchesDatabase.updateOne(
    {
      flightNumber: launch.flightNumber,
    },
    launch,
    {
      upsert: true,
    }
  );
}

async function scheduleNewLaunch(launch) {
  const newflightNum =
    (await getLatestFlightNumber()) + 1 || DEFAULT_FLIGHT_NUMBER;
  const newLaunch = Object.assign(launch, {
    success: true,
    upcoming: true,
    customers: ["NASA", " Andrei S."],
    flightNumber: newflightNum,
  });

  const checkPlanet = await planetsDatabase.findOne({
    keplerName: launch.target,
  });

  if (!checkPlanet) {
    throw new Error("No matching planet found");
  } else {
    await saveLaunch(newLaunch);
  }
}

async function findLaunch(filter, options = { _id: 0, __v: 0 }) {
  return await launchesDatabase.findOne(filter, options);
}

async function existsLaunchWithId(launchId) {
  return await findLaunch({
    flightNumber: launchId,
  });
}

async function abortLaunch(id) {
  const aborted = await launchesDatabase.findOneAndUpdate(
    {
      flightNumber: id,
    },
    {
      success: false,
      upcoming: false,
    }
  );

  return aborted;
}
// TODO: update sucess status of flights 188-203 bcs data in SpaceX API a bit outdated
// async function updateData()

module.exports = {
  getAllLaunches,
  abortLaunch,
  existsLaunchWithId,
  scheduleNewLaunch,
  loadLaunchData,
};
