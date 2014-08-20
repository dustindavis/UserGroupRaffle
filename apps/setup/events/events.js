angular.module('ugRaffleApp')

.controller("SetupEventsCtrl", ['$scope', 'registrationSvc',
    function ($scope, registrationSvc) {

        $scope.events = [];

        registrationSvc.getEvents().then(function (events) {
            $scope.events = events;
        });

        $scope.createEvent = function (newEvent) {
            registrationSvc.addEvent(newEvent).then(function (events) {
                $scope.events = events;
                $scope.currentEvent = newEvent;
                $scope.newEvent = {};
            });

        }

    }]);