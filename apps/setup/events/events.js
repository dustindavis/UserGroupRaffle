angular.module('ugRaffleApp')
    .controller("SetupEventsCtrl", ['$scope', '$modal', 'EventService',
        function ($scope, $modal, EventService) {

            $scope.events = [];

            loadRemoteData();

            $scope.createEvent = function (newEvent) {
                EventService.addEvent(newEvent).then(function (events) {
                    $scope.events = events;
                    $scope.currentEvent = newEvent;
                    $scope.newEvent = {};
                });

            };

            $scope.deleteEvent = function (event) {
                EventService.deleteEvent(event)
                    .then(loadRemoteData);
            };

            $scope.editEvent = function (event) {
                var modalInstance = $modal.open({
                    templateUrl: 'assets/modal.html',
                    controller: 'EventModalInstanceCtrl',
                    size: 'lg',
                    resolve: {
                        modalInformation: function () {
                            var info = {};

                            info = {
                                event: event,
                                modalTitle: 'Edit Event',
                                modalDocument: 'apps/setup/events/events-edit.html'
                            };

                            return info;
                        }
                    }
                });

                modalInstance.result
                    .then(function (event) {
                        $scope.updateEvent(event);
                    });
            };

            $scope.addEvent = function () {
                var modalInstance = $modal.open({
                    templateUrl: 'assets/modal.html',
                    controller: 'EventModalInstanceCtrl',
                    size: 'lg',
                    resolve: {
                        modalInformation: function () {
                            var info = {};

                            info = {
                                event: {},
                                modalTitle: 'Add Event',
                                modalDocument: 'apps/setup/events/events-add.html'
                            };

                            return info;
                        }
                    }
                });

                modalInstance.result
                    .then(function (event) {
                        $scope.createEvent(event);
                    })
                    .then(loadRemoteData);
            };

            $scope.updateEvent = function (event) {
                EventService.updateEvent(event)
                    .then(loadRemoteData);
            };

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

angular.module('ugRaffleApp')
.controller('EventModalInstanceCtrl', ['$scope', '$modalInstance', 'modalInformation',
    function ($scope, $modalInstance, modalInformation) {
        $scope.event = modalInformation['event'];
        $scope.modalTitle = modalInformation['modalTitle'];
        $scope.modalDocument = modalInformation['modalDocument'];

        $scope.updateEvent = function () {
            $modalInstance.close($scope.event);
        };

        $scope.createEvent = function () {
            $modalInstance.close($scope.event);
        };

    }]);


angular.module('raffleAppServices')
    .factory('EventService', ['$http', '$q', '$timeout',
        function ($http, $q, $timeout) {

            var events = [],

                getEvents = function () {
                    var deferred = $q.defer();
                    var self = this;

                    $http.get(MongoDB('events'))
                        .then(function (data) {
                            self.events = data.data;
                            deferred.resolve(self.events);
                        });

                    return deferred.promise;
                },

                addEvent = function (newEvent) {
                    var deferred = $q.defer();
                    var self = this;

                    newEvent.id = Guid();
                    self.events.push(newEvent);

                    $http.post(MongoDB('events'), newEvent)
                        .then(function (data) {
                            deferred.resolve(self.events);
                        });

                    return deferred.promise;
                },

                updateEvent = function (event) {
                    var deferred = $q.defer();
                    var self = this;

                    var id = '{"id":"' + event.id + '"}';
                    delete event._id;

                    $http.put(MongoDB('events') + '&q=' + id, event)
                        .then(function (data) {
                            deferred.resolve(self.events);
                        });

                    return deferred.promise;
                },

                deleteEvent = function (event) {
                    var deferred = $q.defer();
                    var self = this;
                    var collectionWithId = 'events/' + event._id.$oid;

                    $http.delete(MongoDB(collectionWithId))
                         .then(function (data) {
                             deferred.resolve(self.events);
                         });

                    return deferred.promise;
                };

            return {
                events: events,
                getEvents: getEvents,
                addEvent: addEvent,
                updateEvent: updateEvent,
                deleteEvent: deleteEvent
            }
        }
    ]);