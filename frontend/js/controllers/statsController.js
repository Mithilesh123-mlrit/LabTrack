// LabTrack - Stats controller: gives the stat cards their data
angular.module("labtrackApp").controller("StatsController", [
  "StatsService",
  function (StatsService) {
    this.stats = StatsService;
  },
]);