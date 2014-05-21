
//CONTORLLERS
var raffleAppControllers = angular.module('raffleAppControllers', []);

raffleAppControllers.controller('registrationCtrl', ['$scope', 'registrationSvc', function($scope,registrationSvc) {

	$scope.members = registrationSvc.getMembers();
	$scope.events = registrationSvc.getEvents();
	$scope.currentEvent = { id: 0};

	$scope.showAttendeeList = function() { return $scope.currentEvent.id != 0; };

	$scope.createEvent = function() {
		registrationSvc.addEvent($scope.newEvent);
		$scope.events = registrationSvc.getEvents();
		$scope.currentEvent = $scope.newEvent;
		$scope.newEvent = {};
	}

	$scope.selectEvent = function(event) {
		$scope.currentEvent = event;
	}

	$scope.addAttendee = function(attendee) {
		addAttendeeToEvent(attendee);
	}

	$scope.createAttendee = function(attendee) {
		addAttendeeToEvent(attendee);
		$scope.attendee = {};
	}

	$scope.adjustEntries = function(attendee, value) {
		if(isNaN(attendee.entries)) { attendee.entries = 2; }
		attendee.entries += value;

		if(attendee.entries < 0) { attendee.entries = 0; }


	}

	function addAttendeeToEvent(attendee) {
		if($scope.currentEvent.attendees == undefined) { $scope.currentEvent.attendees = []; }
		attendee.entries = 2;
		$scope.currentEvent.attendees.push(attendee);
	}

	$scope.isAttending = function(attendees) {
		return function(member) {
			
			if(attendees == undefined) { return true; }

			for(var i =0;i<attendees.length;i++) {
				if(attendees[i].email == member.email) {
					return false;
				}
			}

			return true;
		}
	}

}]);

raffleAppControllers.controller('raffleCtrl', function($scope) {

	

});

raffleAppControllers.controller('setupCtrl', function($scope) {

	

});

raffleAppControllers.controller('reportsCtrl', function($scope) {

	

})

//SERVICES
var raffleAppServices = angular.module('raffleAppServices', []);

raffleAppServices.factory('registrationSvc', 
		function() {
			return 	{
					__events: [
								{ id: 1, date: '5/6/2014', speaker: 'Daniel Lewis', topic: 'Node.JS', location: 'San Bernardino', attendees: [] },
								{ id: 2, date: '6/10/2014', speaker: 'Dustin Davis', topic: 'SPA with Angular.JS', location: 'San Bernardino', attendees: [] },
								{ id: 3, date: '7/10/2014', speaker: 'Mike Roth', topic: 'Stuff', location: 'San Bernardino', attendees: [] }
									],
					__members: [
						{ id: 1, firstName: 'Dustin', lastName:'Davis', email:'dd@dd.com'},
						{ id: 2, firstName: 'John', lastName:'Smith', email:'js@dd.com'},
						{ id: 3, firstName: 'Mary', lastName:'Smith', email:'ms@dd.com'}
					],
					getEvents: function() {
								return	this.__events;
					},
					addEvent: function(newEvent) {
						this.__events.push(newEvent);
					},
					getMembers: function() {
						return this.__members;
					}

				};
		}

	);



var raffleApp = angular.module('ugRaffleApp', ['ngRoute', 'raffleAppControllers','raffleAppServices']);

//FILTERS


//ROUTING

raffleApp.config(['$routeProvider',
	function($routeProvider) {
		$routeProvider
			.when('/registration', { templateUrl: 'apps/registration/index.html', controller: 'registrationCtrl'})
			.when('/raffle', { templateUrl: 'apps/raffle/index.html', controller: 'raffleCtrl'})
			.when('/setup', { templateUrl: 'apps/setup/index.html', controller: 'setupCtrl'})
			.when('/reports', { templateUrl: 'apps/reports/index.html', controller: 'reportsCtrl'})
			.otherwise({redirectTo:'/registration'});

	}]

);





