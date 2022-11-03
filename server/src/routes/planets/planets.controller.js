const { getAllPLanets } = require("../../models/planets.model");

function httpGetAllPlanets(req, res) {
  return res.status(200).json(getAllPLanets());
}

module.exports = {
  httpGetAllPlanets,
};
