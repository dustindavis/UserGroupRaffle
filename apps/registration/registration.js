angular.module('raffleAppControllers')
    .controller('registrationCtrl', ['$scope', '$filter', 'registrationSvc',
    function ($scope, $filter, registrationSvc) {

        $scope.members = [];
        $scope.events = [];

        registrationSvc.getMembers().then(function (members) {
            $scope.members = raffleApp.zUtilities.sortArray(members,'lastName');
        });
        registrationSvc.getEvents().then(function (events) {
            var sortedEvents = raffleApp.zUtilities.sortDateArray(events, 'date');
            $scope.events = sortedEvents;
        });

        $scope.currentEvent = {
            id: 0,
            topic: 'None'
        };
        $scope.memberInputDisplay = 1;
        $scope.eventInputDisplay = 1;


        $scope.showAttendeeList = function () {
            return $scope.currentEvent.id != 0;
        };

        $scope.createEvent = function (newEvent) {
            registrationSvc.addEvent(newEvent).then(function (events) {
                $scope.events = events;
                $scope.currentEvent = newEvent;
                $scope.newEvent = {};
            });
            
        }

        $scope.selectEvent = function (event) {
            $scope.currentEvent = event;
        }

        $scope.addAttendee = function (attendee) {
            addAttendeeToEvent(attendee);
        }

        $scope.createAttendee = function (newAttendee) {
            addAttendeeToEvent(newAttendee);

            registrationSvc.createMember(newAttendee).then(function (members) {
                $scope.members = members;
                $scope.newAttendee = {};
            });

        }

        $scope.adjustEntries = function (attendee, value) {
            if (isNaN(attendee.entries)) {
                attendee.entries = 2;
            }
            attendee.entries += value;

            if (attendee.entries < 0) {
                attendee.entries = 0;
            }
            registrationSvc.updateEvent($scope.currentEvent);

        }

        $scope.removeAttendee = function (attendee) {
            var position = $scope.currentEvent.attendees.indexOf(attendee);

            if (~position) $scope.currentEvent.attendees.splice(position, 1);
            registrationSvc.updateEvent($scope.currentEvent);

        }

        function addAttendeeToEvent(attendee) {
            if ($scope.currentEvent == undefined || $scope.currentEvent.id == "0") {
                return;
            }
            if ($scope.currentEvent.attendees == undefined) {
                $scope.currentEvent.attendees = [];
            }
            attendee.entries = 2;
            $scope.currentEvent.attendees.push(attendee);
            registrationSvc.updateEvent($scope.currentEvent);

        }

        $scope.isAttending = function (attendees) {
            return function (member) {

                if (attendees == undefined) {
                    return true;
                }

                for (var i = 0; i < attendees.length; i++) {
                    if (attendees[i].id == member.id) {
                        return false;
                    }
                }

                return true;
            }
        }

    }]);



raffleAppServices.factory('registrationSvc',
    function ($http, $q, $timeout) {
        return {
            __events: [],
            __members: [],
            __prizes: [],

            getEvents: function () {
                var deferred = $q.defer();
                var self = this;

                $http.get(MongoDB('events'))
                    .then(function (data) {
                        self.__events = data.data;
                        deferred.resolve(self.__events);
                    });

                return deferred.promise;
            },
            addEvent: function (newEvent) {
                var deferred = $q.defer();
                var self = this;

                newEvent.id = Guid();
                self.__events.push(newEvent);

                $http.post(MongoDB('events'), newEvent)
                    .then(function (data) {
                        deferred.resolve(self.__events);
                    });

                return deferred.promise;
            },
            updateEvent: function (event) {
                var deferred = $q.defer();
                var self = this;

                var id = '{"id":"' + event.id + '"}';
                delete event._id;

                $http.put(MongoDB('events') + '&q=' + id, event)
                    .then(function (data) {
                        deferred.resolve(self.__events);
                    });

                return deferred.promise;
            },

            getMembers: function () {
                var deferred = $q.defer();
                var self = this;

                $http.get(MongoDB('members'))
                    .then(function (data) {
                        self.__members = data.data;
                        deferred.resolve(self.__members);
                    });

                return deferred.promise;
            },
            createMember: function (member) {
                var deferred = $q.defer();
                var self = this;

                member.id = Guid();

                self.__members.push(member);

                $http.post(MongoDB('members'), member)
                    .then(function (data) {
                        deferred.resolve(self.__members);
                    });

                return deferred.promise;
            },

            getPrizes: function () {
                var deferred = $q.defer();
                var self = this;

                $http.get(MongoDB('prizes'))
                    .then(function (data) {
                        self.__prizes = data.data;
                        deferred.resolve(self.__prizes);
                    });

                return deferred.promise;
            },
            createPrize: function (prize) {
                var deferred = $q.defer();
                var self = this;
                prize.id = Guid();
                self.__members.push(prize);

                $http.post(MongoDB('prizes'), prize)
                    .then(function (data) {
                        deferred.resolve(self.__prizes);
                    });

                return deferred.promise;
            }

        };
    }
);