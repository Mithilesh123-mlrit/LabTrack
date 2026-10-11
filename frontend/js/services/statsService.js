// LabTrack - Stats service: loads the dashboard numbers
angular.module("labtrackApp").factory("StatsService", [
  "$http",
  function ($http) {
    var service = {
      data: { total: 0, available: 0, inUse: 0, maintenance: 0, activeBookings: 0 },
      loaded: false,
      failed: false,
    };

    service.load = function () {
      return $http
        .get("https://labtrack-3r44.onrender.com/api/stats")
        .then(function (response) {
          service.data = response.data;
          service.loaded = true;
          service.failed = false;
        })
        .catch(function () {
          service.failed = true;
        });
    };

    service.load(); // fetch once as soon as the service is first used

    return service;
  },
]);