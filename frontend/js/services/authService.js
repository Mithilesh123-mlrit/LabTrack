// LabTrack - Auth service: login state and API calls for accounts
angular.module("labtrackApp").factory("AuthService", [
  "$http",
  function ($http) {
    var service = {
      user: null,   // the logged-in user, or null
      ready: false, // becomes true once we know whether someone is logged in
    };

    // Asks the server who is logged in (uses the session cookie)
    service.loadUser = function () {
      return $http
        .get("/api/auth/me")
        .then(function (response) {
          service.user = response.data;
        })
        .catch(function () {
          service.user = null; // 401 = nobody logged in
        })
        .finally(function () {
          service.ready = true;
        });
    };

    service.login = function (email, password) {
      return $http
        .post("/api/auth/login", { email: email, password: password })
        .then(function (response) {
          service.user = response.data;
          return response.data;
        });
    };

    service.register = function (data) {
      return $http.post("/api/auth/register", {
        name: data.name,
        email: data.email,
        password: data.password,
      });
    };

    service.logout = function () {
      return $http.post("/api/auth/logout").then(function () {
        service.user = null;
      });
    };

    // Only used to show or hide buttons. The server enforces the real rules.
    service.canManage = function () {
      return !!service.user && (service.user.role === "admin" || service.user.role === "assistant");
    };

    service.loadUser(); // check the session as soon as the service is first used

    return service;
  },
]);