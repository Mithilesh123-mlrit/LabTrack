// LabTrack - Navbar controller: shows the user and handles logout
angular.module("labtrackApp").controller("AuthController", [
  "AuthService",
  function (AuthService) {
    var vm = this;

    vm.auth = AuthService;

    vm.logout = function () {
      AuthService.logout();
    };
  },
]);