angular.module('ugRaffleApp')
    .controller('navigationCtrl', ['$scope', 'EventService',
        function ($scope, EventService) {
            $scope.events = [];

            loadRemoteData();

            function loadRemoteData() {
                EventService.getEvents()
                    .then(function (events) {
                        setRemoteData(events);
                    });
            };

            function setRemoteData(events) {
                $scope.events = events;
            };
        }
    ]);