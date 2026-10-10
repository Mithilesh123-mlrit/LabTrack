// LabTrack - Hero controller: live "Today in the Lab" card
angular.module("labtrackApp").controller("HeroController", [
  "EquipmentService",
  function (EquipmentService) {
    var vm = this;

    vm.items = [];
    vm.loaded = false;

    vm.statusClass = function (status) {
      if (status === "Available") return "status-available";
      if (status === "In Use") return "status-inuse";
      if (status === "Maintenance") return "status-maintenance";
      return "";
    };

    EquipmentService.getAll()
      .then(function (response) {
        vm.items = response.data.slice(0, 4); // first four items only
      })
      .finally(function () {
        vm.loaded = true;
      });
  },
]);