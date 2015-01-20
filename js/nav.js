angular.module('ugRaffleApp')
    .controller('navigationCtrl', ['$scope', '$filter', 'EventService',
        function ($scope, $filter, EventService) {
            $scope.events = [];
            
            loadRemoteData();

            function loadRemoteData() {

                EventService.getEvents()
                    .then(function (events) {
                        var sortedEvents = raffleApp.zUtilities.sortDateArray(events, 'date');
                        setRemoteData(sortedEvents);
                    });
            };

            function setRemoteData(events) {
                $scope.events = events;
            };
        }
    ]);