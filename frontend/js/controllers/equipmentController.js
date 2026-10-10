// LabTrack - Equipment controller: table, search, and add/edit/delete form
angular.module("labtrackApp").controller("EquipmentController", [
  "$window",
  "$timeout",
  "EquipmentService",
  "AuthService",
  "StatsService",
  function ($window, $timeout, EquipmentService, AuthService, StatsService) {
    var vm = this;

    vm.auth = AuthService; // lets the HTML ask vm.auth.canManage()

    // ----- Table state -----
    vm.items = [];
    vm.loading = true;
    vm.error = "";
    vm.search = "";
    vm.statusFilter = "";
    vm.statuses = ["Available", "In Use", "Maintenance"];

    // ----- Form state -----
    vm.showForm = false;
    vm.editingId = null; // null = adding, otherwise the _id being edited
    vm.form = {};
    vm.formErrors = [];
    vm.submitted = false;
    vm.saving = false;
    vm.message = ""; // green success message

    function emptyForm() {
      return {
        equipmentId: "",
        name: "",
        category: "",
        laboratory: "",
        status: "Available",
        quantity: 1,
        purchaseDate: null,
        notes: "",
      };
    }

    // Reads error messages from an API error response
    function getErrors(response) {
      var data = response && response.data;
      if (data && data.errors && data.errors.length) return data.errors;
      if (data && data.message) return [data.message];
      return ["Could not reach the server."];
    }

    vm.statusClass = function (status) {
      if (status === "Available") return "status-available";
      if (status === "In Use") return "status-inuse";
      if (status === "Maintenance") return "status-maintenance";
      return "";
    };

    // ----- Load -----
    vm.load = function () {
      vm.loading = true;
      vm.error = "";

      EquipmentService.getAll()
        .then(function (response) {
          vm.items = response.data;
          StatsService.load(); // refresh the dashboard cards too
        })
        .catch(function () {
          vm.error = "Could not load equipment. Check that the server is running.";
        })
        .finally(function () {
          vm.loading = false;
        });
    };

    // ----- Form open/close -----
    function scrollToForm() {
      // wait for AngularJS to draw the form, then scroll to it
      $timeout(function () {
        var el = $window.document.getElementById("equipmentForm");
        if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      });
    }

    vm.openAdd = function () {
      vm.editingId = null;
      vm.form = emptyForm();
      vm.formErrors = [];
      vm.submitted = false;
      vm.message = "";
      vm.showForm = true;
      scrollToForm();
    };

    vm.openEdit = function (item) {
      vm.editingId = item._id;
      vm.form = angular.copy(item);
      // <input type="date"> needs a Date object, not a string
      vm.form.purchaseDate = item.purchaseDate ? new Date(item.purchaseDate) : null;
      vm.formErrors = [];
      vm.submitted = false;
      vm.message = "";
      vm.showForm = true;
      scrollToForm();
    };

    vm.closeForm = function () {
      vm.showForm = false;
      vm.editingId = null;
      vm.formErrors = [];
    };

    // ----- Save (create or update) -----
    vm.save = function (formCtrl) {
      vm.submitted = true;
      if (formCtrl.$invalid) return;

      // Send only the fields the API accepts
      var payload = {
        equipmentId: vm.form.equipmentId,
        name: vm.form.name,
        category: vm.form.category || "General",
        laboratory: vm.form.laboratory,
        status: vm.form.status,
        quantity: vm.form.quantity,
        purchaseDate: vm.form.purchaseDate || null,
        notes: vm.form.notes,
      };

      var isEdit = !!vm.editingId;
      var request = isEdit
        ? EquipmentService.update(vm.editingId, payload)
        : EquipmentService.create(payload);

      vm.saving = true;
      vm.formErrors = [];

      request
        .then(function () {
          vm.message = isEdit ? "Equipment updated." : "Equipment added.";
          vm.submitted = false;
          vm.closeForm();
          vm.load();
        })
        .catch(function (response) {
          vm.formErrors = getErrors(response);
        })
        .finally(function () {
          vm.saving = false;
        });
    };

    // ----- Delete -----
    vm.remove = function (item) {
      if (!$window.confirm('Delete "' + item.name + '" (' + item.equipmentId + ")?")) {
        return;
      }

      EquipmentService.remove(item._id)
        .then(function () {
          vm.message = "Equipment deleted.";
          vm.load();
        })
        .catch(function (response) {
          vm.error = getErrors(response)[0];
        });
    };

    vm.load(); // run once when the page opens
  },
]);