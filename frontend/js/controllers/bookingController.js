// LabTrack - Booking controller: booking form, list, approve/reject/cancel
angular.module("labtrackApp").controller("BookingController", [
  "$window",
  "AuthService",
  "EquipmentService",
  "BookingService",
  function ($window, AuthService, EquipmentService, BookingService) {
    var vm = this;

    vm.auth = AuthService;

    // ----- List state -----
    vm.bookings = [];
    vm.equipment = [];
    vm.loading = true;
    vm.error = "";
    vm.message = "";
    vm.statusFilter = "";
    vm.statuses = ["Pending", "Approved", "Rejected", "Cancelled"];

    // ----- Form state -----
    vm.showForm = false;
    vm.form = { equipment: "", startTime: null, endTime: null, purpose: "" };
    vm.formErrors = [];
    vm.submitted = false;
    vm.saving = false;

    function getErrors(response) {
      var data = response && response.data;
      if (data && data.errors && data.errors.length) return data.errors;
      if (data && data.message) return [data.message];
      return ["Could not reach the server."];
    }

    vm.statusClass = function (status) {
      if (status === "Pending") return "status-inuse";
      if (status === "Approved") return "status-available";
      if (status === "Rejected") return "status-maintenance";
      return "status-cancelled";
    };

    // Equipment under maintenance cannot be booked
    vm.bookable = function () {
      return vm.equipment.filter(function (e) {
        return e.status !== "Maintenance";
      });
    };

    vm.pendingCount = function () {
      return vm.bookings.filter(function (b) {
        return b.status === "Pending";
      }).length;
    };

    // Only the owner or staff may cancel, and only Pending/Approved bookings.
    // The server checks this again, so this only decides what to show.
    vm.canCancel = function (b) {
      if (b.status !== "Pending" && b.status !== "Approved") return false;
      var isOwner = b.user && AuthService.user && b.user._id === AuthService.user.id;
      return AuthService.canManage() || isOwner;
    };

    // ----- Loading -----
    vm.loadBookings = function () {
      vm.loading = true;
      vm.error = "";

      BookingService.getAll()
        .then(function (response) {
          vm.bookings = response.data;
        })
        .catch(function (response) {
          vm.error = getErrors(response)[0];
        })
        .finally(function () {
          vm.loading = false;
        });
    };

    vm.loadEquipment = function () {
      EquipmentService.getAll().then(function (response) {
        vm.equipment = response.data;
      });
    };

    // ----- Form -----
    vm.openForm = function () {
      vm.showForm = true;
      vm.formErrors = [];
      vm.submitted = false;
      vm.message = "";
    };

    vm.closeForm = function () {
      vm.showForm = false;
      vm.formErrors = [];
      vm.submitted = false;
    };

    vm.save = function (formCtrl) {
      vm.submitted = true;
      vm.formErrors = [];
      if (formCtrl.$invalid) return;

      if (vm.form.endTime <= vm.form.startTime) {
        vm.formErrors = ["End time must be after start time"];
        return;
      }

      vm.saving = true;

      // Date objects become ISO text (UTC) when sent as JSON
      BookingService.create({
        equipment: vm.form.equipment,
        startTime: vm.form.startTime,
        endTime: vm.form.endTime,
        purpose: vm.form.purpose,
      })
        .then(function () {
          vm.message = "Booking requested. It is now waiting for approval.";
          vm.form = { equipment: "", startTime: null, endTime: null, purpose: "" };
          vm.closeForm();
          vm.loadBookings();
        })
        .catch(function (response) {
          vm.formErrors = getErrors(response);
        })
        .finally(function () {
          vm.saving = false;
        });
    };

    // ----- Staff: approve or reject -----
    vm.approve = function (b) {
      vm.message = "";
      vm.error = "";
      BookingService.review(b._id, "Approved", "")
        .then(function () {
          vm.message = "Booking approved.";
          vm.loadBookings();
        })
        .catch(function (response) {
          vm.error = getErrors(response)[0];
        });
    };

    vm.reject = function (b) {
      var note = $window.prompt("Reason for rejecting (optional):", "");
      if (note === null) return; // pressed Cancel
      vm.message = "";
      vm.error = "";
      BookingService.review(b._id, "Rejected", note)
        .then(function () {
          vm.message = "Booking rejected.";
          vm.loadBookings();
        })
        .catch(function (response) {
          vm.error = getErrors(response)[0];
        });
    };

    // ----- Cancel -----
    vm.cancel = function (b) {
      if (!$window.confirm("Cancel this booking for " + b.equipment.name + "?")) return;
      vm.message = "";
      vm.error = "";
      BookingService.cancel(b._id)
        .then(function () {
          vm.message = "Booking cancelled.";
          vm.loadBookings();
        })
        .catch(function (response) {
          vm.error = getErrors(response)[0];
        });
    };

    vm.logout = function () {
      AuthService.logout().then(function () {
        $window.location.href = "/";
      });
    };

    // ----- Start: make sure someone is logged in -----
    AuthService.loadUser().then(function () {
      if (!AuthService.user) {
        $window.location.href = "login.html";
        return;
      }
      vm.loadEquipment();
      vm.loadBookings();

      // "Book" links from the homepage use bookings.html?equipment=<id>
      var wanted = new URLSearchParams($window.location.search).get("equipment");
      if (wanted) {
        vm.form.equipment = wanted;
        vm.openForm();
      }
    });
  },
]);