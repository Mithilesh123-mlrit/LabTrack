// LabTrack - Equipment service: all HTTP calls for equipment live here
angular.module("labtrackApp").factory("EquipmentService", [
  "$http",
  function ($http) {
    var baseUrl = "https://labtrack-3r44.onrender.com/api/equipment";

    return {
      getAll: function () {
        return $http.get(baseUrl);
      },
      create: function (data) {
        return $http.post(baseUrl, data);
      },
      update: function (id, data) {
        return $http.put(baseUrl + "/" + id, data);
      },
      remove: function (id) {
        return $http.delete(baseUrl + "/" + id);
      },
    };
  },
]);