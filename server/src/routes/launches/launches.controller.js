const { getAllLaunches, addNewLaunch } = require("../../models/launches.model");

function httpGetAllLaunches(req, res) {
  return res.status(200).json(getAllLaunches());
}

function httpAddNewLaunch(req, res) {
  const launch = req.body;
  let { mission, rocket, launchDate, target } = launch;

  if (!mission || !rocket || !launchDate || !target) {
    return res.status(400).json({
      error: "Missing required launch property",
    });
  }

  launchDate = new Date(launch.launchDate);

  if (isNaN(launchDate)) {
    return res.status(400).json({
      error: "Wrong date format",
    });
  }

  addNewLaunch(launch);
  return res.status(201).json(launch);
}

module.exports = {
  httpGetAllLaunches,
  httpAddNewLaunch,
};
