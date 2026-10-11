// LabTrack - Booking service: all HTTP calls for bookings live here
angular.module("labtrackApp").factory("BookingService", [
  "$http",
  function ($http) {
    var baseUrl = "https://labtrack-3r44.onrender.com/api/bookings";

    return {
      getAll: function () {
        return $http.get(baseUrl);
      },
      create: function (data) {
        return $http.post(baseUrl, data);
      },
      review: function (id, status, note) {
        return $http.put(baseUrl + "/" + id + "/review", {
          status: status,
          reviewNote: note || "",
        });
      },
      cancel: function (id) {
        return $http.put(baseUrl + "/" + id + "/cancel");
      },
    };
  },
]);