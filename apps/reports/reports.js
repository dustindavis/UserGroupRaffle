angular.module('raffleAppControllers').controller('reportsCtrl', ['$scope', '$routeParams', '$modal', 'registrationSvc',
    function ($scope, $routeParams, $modal, registrationSvc) {
        $scope.events = [];
        $scope.currentEvent = null;

        $scope.loadEvents = function () {
            registrationSvc.getEvents().then(function (events) {
                var sortedEvents = raffleApp.zUtilities.sortDateArray(events, 'date');
                $scope.events = sortedEvents;
            });
        }

        $scope.loadEvents();

    }]);