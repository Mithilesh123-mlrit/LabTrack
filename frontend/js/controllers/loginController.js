// LabTrack - Login page controller (login and register)
angular.module("labtrackApp").controller("LoginController", [
  "$window",
  "AuthService",
  function ($window, AuthService) {
    var vm = this;

    vm.mode = "login"; // "login" or "register"
    vm.form = { name: "", email: "", password: "" };
    vm.errors = [];
    vm.submitted = false;
    vm.loading = false;

    function getErrors(response) {
      var data = response && response.data;
      if (data && data.errors && data.errors.length) return data.errors;
      if (data && data.message) return [data.message];
      return ["Could not reach the server."];
    }

    vm.setMode = function (mode) {
      vm.mode = mode;
      vm.errors = [];
      vm.submitted = false;
    };

        // Fills the login form with a demo account
    vm.fillDemo = function (email, password) {
      vm.mode = "login";
      vm.form.email = email;
      vm.form.password = password;
      vm.errors = [];
      vm.submitted = false;
    };

    vm.submit = function (formCtrl) {
      vm.submitted = true;
      if (formCtrl.$invalid) return;

      vm.loading = true;
      vm.errors = [];

      var request;
      if (vm.mode === "register") {
        // Create the account, then log in with the same details
        request = AuthService.register(vm.form).then(function () {
          return AuthService.login(vm.form.email, vm.form.password);
        });
      } else {
        request = AuthService.login(vm.form.email, vm.form.password);
      }

      request
        .then(function () {
          $window.location.href = "/"; // go to the homepage
        })
        .catch(function (response) {
          vm.errors = getErrors(response);
        })
        .finally(function () {
          vm.loading = false;
        });
    };
  },
]);