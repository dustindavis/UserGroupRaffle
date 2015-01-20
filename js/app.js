//SETUP
var __MONGODB_USER = "";
var __MONGODB_API_KEY = "";

angular.module('raffleAppControllers', []);

//SERVICES  -- TODO: Should be factored out into unique services
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

var raffleApp = angular.module('ugRaffleApp', ['ngRoute', 'raffleAppControllers', 'raffleAppServices', 'ui.bootstrap']);

//ROUTING

raffleApp.config(['$routeProvider', function ($routeProvider) {
    $routeProvider
        .when('/registration', {
            templateUrl: 'apps/registration/registration.html',
            controller: 'registrationCtrl'
        })
        .when('/raffle/:eventid', {
            templateUrl: 'apps/raffle/raffle.html',
            controller: 'raffleCtrl'
        })
        .when('/setup', {
            templateUrl: 'apps/setup/setup.html',
            controller: 'setupCtrl'
        })
        .when('/reports', {
            templateUrl: 'apps/reports/reports.html',
            controller: 'reportsCtrl'
        })
        .otherwise({
            redirectTo: '/registration'
        });
}]);

raffleApp.zUtilities = (function () {

    var sortArray = function (array, column) {
        return array.sort(function (a, b) {
            return ((a[column] < b[column]) ? -1 : ((a[column] > b[column]) ? 1 : 0));
        });
    },

    sortDateArray = function (array, column) {
        return array.sort(function (a, b) {
            var aDate = new Date(a[column]).toISOString().substring(0, 10);
            var bDate = new Date(b[column]).toISOString().substring(0, 10);

            return ((aDate < bDate) ? -1 : ((aDate > bDate) ? 1 : 0));
        });
    }

    return {
        sortArray: sortArray,
        sortDateArray: sortDateArray
    };
})();

var MongoDB = function (db) {
    var url = 'https://api.mongolab.com/api/1/databases/' + __MONGODB_USER + '/collections/' + db + '?apiKey=' + __MONGODB_API_KEY;

    return url;
};

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