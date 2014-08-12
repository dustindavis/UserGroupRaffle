//SETUP
var __MONGODB_USER 		= "ugraffleapp";
var __MONGODB_API_KEY 	= "xJgTUGLkO2VW_N3JGbJBTnsWUOJyfdGs";


//CONTORLLERS
var raffleAppControllers = angular.module('raffleAppControllers', []);

raffleAppControllers.controller('registrationCtrl', ['$scope', 'registrationSvc',
    function ($scope, registrationSvc) {

        $scope.members = [];
        $scope.events = [];

        registrationSvc.getMembers().then(function (members) {
            $scope.members = members;
        });
        registrationSvc.getEvents().then(function (events) {
            $scope.events = events;
        });

        $scope.currentEvent = {
            id: 0, topic: 'None'
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
            if($scope.currentEvent == undefined || $scope.currentEvent.id == "0") { return; }
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

//**************************[ Raffle Controller ]**************************//
raffleAppControllers.controller('raffleCtrl', ['$scope', 'registrationSvc',
    function ($scope, registrationSvc) {
        var emptyWinner = {};
        var __prizeList = [];

        registrationSvc.getPrizes().then(function (prizes) {
            __prizeList = prizes;
        });
        registrationSvc.getEvents().then(function (events) {
            $scope.events = events;
        });

        $scope.currentEvent = {
            id: 0
        };
        $scope.memberInputDisplay = 1;
        $scope.eventInputDisplay = false;
        $scope.currentWinner = emptyWinner;
        $scope.hasError = true;
        $scope.errorMessage = 'No entries for this raffle';

        raffleEntries = [];

        createEntries = function () {
            if ($scope.currentEvent.raffleStarted === true) {
                return;
            }

            var attendees = $scope.currentEvent.attendees;
            var tmpEntries = [];

            for (var i = 0; i < attendees.length; i++) {

                for (var x = 0; x < attendees[i].entries; x++) {
                    tmpEntries.push(attendees[i]);
                }
            }
            
            raffleEntries = shuffle(tmpEntries);

        }

        var shuffle = function(array) {
          var currentIndex = array.length
            , temporaryValue
            , randomIndex ;

          while (0 !== currentIndex) {

            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;

            temporaryValue = array[currentIndex];
            array[currentIndex] = array[randomIndex];
            array[randomIndex] = temporaryValue;
          }

          return array;
        }

        $scope.showRaffle = function () {
            return $scope.currentEvent.id != 0 && $scope.hasError == false;
        };

        $scope.selectEvent = function (event) {
            if (event.prizes === undefined) {
                event.prizes = __prizeList;
            }

            if (event.winners === undefined) {
                event.winners = [];
            }

            $scope.currentEvent = event;

            createEntries();
            $scope.eventInputDisplay = !$scope.eventInputDisplay;

            validateEvent();
        }

        $scope.drawWinner = function () {
            validateEvent();

            $scope.currentEvent.raffleStarted = true;
            $scope.currentEvent.raffleCompleted = false;

            var rand = raffleEntries[Math.floor(Math.random() * raffleEntries.length)];
            var winner = {};
            angular.copy(rand, winner);

            $scope.currentWinner = winner;

            var position = raffleEntries.indexOf(rand);
            if (~position) raffleEntries.splice(position, 1);

        }

        $scope.setPrize = function (prize) {
            var winner = {};

            if ($scope.currentWinner === emptyWinner) {
                return;
            }

            angular.copy($scope.currentWinner, winner);
            winner.prize = prize;
            $scope.currentEvent.winners.push(winner);

            $scope.currentWinner = emptyWinner;

            var position = $scope.currentEvent.prizes.indexOf(prize);
            if (~position) $scope.currentEvent.prizes.splice(position, 1);


            registrationSvc.updateEvent($scope.currentEvent);
		  validateEvent();


        }

        $scope.canDraw = function () {

            if ($scope.currentEvent.raffleCompleted) {
                return false;
            }
            if ($scope.currentWinner !== emptyWinner) {
                return false;
            }
            return !$scope.hasError;
        }

        validateEvent = function () {
            if (raffleEntries == undefined || (raffleEntries.length == 0 && ($scope.currentEvent.winners == undefined || $scope.currentEvent.winners.length == 0))) {
                setError('No entries for this raffle');
                return;
            }

            if (raffleEntries.length == 0 && $scope.currentEvent.winners.length > 0) {
                $scope.currentEvent.raffleCompleted = true;
                setError('This raffle has ended!');
                return;
            }

            if ($scope.currentEvent.prizes.length == 0) {
                $scope.currentEvent.raffleCompleted = true;
                setError('No more prizes left!');
                return;
            }

            clearError();
        }

        setError = function (message) {
            $scope.hasError = true;
            $scope.errorMessage = message;
        }

        clearError = function () {
            $scope.errorMessage = '';
            $scope.hasError = false;
        }

        $scope.hasWinner = function (result) {
            return function (prize) {

                if (prize == undefined) {
                    return false;
                }

                if (result) {
                    return prize.winner != undefined;
                } else {
                    return prize.winner == undefined;
                }
            }
        }

}]);

raffleAppControllers.controller('setupCtrl', function ($scope) {



});

raffleAppControllers.controller('reportsCtrl', function ($scope) {



})

//SERVICES
var raffleAppServices = angular.module('raffleAppServices', []);

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


var raffleApp = angular.module('ugRaffleApp', ['ngRoute', 'raffleAppControllers', 'raffleAppServices']);

//FILTERS


//ROUTING

raffleApp.config(['$routeProvider',
 function ($routeProvider) {
        $routeProvider
            .when('/registration', {
                templateUrl: 'apps/registration/index.html',
                controller: 'registrationCtrl'
            })
            .when('/raffle', {
                templateUrl: 'apps/raffle/index.html',
                controller: 'raffleCtrl'
            })
            .when('/setup', {
                templateUrl: 'apps/setup/index.html',
                controller: 'setupCtrl'
            })
            .when('/reports', {
                templateUrl: 'apps/reports/index.html',
                controller: 'reportsCtrl'
            })
            .otherwise({
                redirectTo: '/registration'
            });
 }]);

var MongoDB = function (db) {
    var url = 'https://api.mongolab.com/api/1/databases/' + __MONGODB_USER + '/collections/' + db + '?apiKey=' + __MONGODB_API_KEY;

    return url;
}

var Guid = (function () {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    return function () {
        return s4() + s4() + s4() + s4() + s4() + s4() + s4() + s4();
    };
})();
