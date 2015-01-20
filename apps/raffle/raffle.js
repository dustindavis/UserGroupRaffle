//**************************[ Raffle Controller ]**************************//
angular.module('raffleAppControllers').controller('raffleCtrl', ['$scope', '$routeParams', '$modal', 'registrationSvc',
    function ($scope, $routeParams, $modal, registrationSvc) {
        var __prizeList = [];
        var eventid = $routeParams.eventid;

        $scope.events = [];

        registrationSvc.getPrizes().then(function (prizes) {
            __prizeList = prizes;
        });

        registrationSvc.getEvents().then(function (events) {
            $scope.events = events;
        }).then(function () {
            var localEvent = $scope.events.filter(function (obj) {
                return obj.id === eventid;
            });
            $scope.selectEvent(localEvent[0]);
        }
        );

        $scope.currentEvent = {
            id: 0
        };

        $scope.currentEvent.raffleEntries = [];
        $scope.currentEvent.currentWinner = {};

        $scope.memberInputDisplay = 1;
        $scope.eventInputDisplay = false;
        $scope.hasError = true;
        $scope.errorMessage = 'No entries for this raffle';

        var createEntries = function () {
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

            $scope.currentEvent.raffleEntries = shuffle(tmpEntries);

        };

        var shuffle = function (array) {
            var currentIndex = array.length,
                temporaryValue,
                randomIndex;

            while (0 !== currentIndex) {

                randomIndex = Math.floor(Math.random() * currentIndex);
                currentIndex -= 1;

                temporaryValue = array[currentIndex];
                array[currentIndex] = array[randomIndex];
                array[randomIndex] = temporaryValue;
            }

            return array;
        };

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

            if (event.currentWinner === undefined) {
                event.currentWinner = {};
            }

            if (event.raffleEntries === undefined) {
                event.raffleEntries = [];
            }

            $scope.currentEvent = event;

            createEntries();
            $scope.eventInputDisplay = !$scope.eventInputDisplay;
            registrationSvc.updateEvent($scope.currentEvent);

            validateEvent();
        };

        $scope.drawWinner = function () {
            validateEvent();

            $scope.currentEvent.raffleStarted = true;
            $scope.currentEvent.raffleCompleted = false;

            var raffleEntries = $scope.currentEvent.raffleEntries;

            var rand = raffleEntries[Math.floor(Math.random() * raffleEntries.length)];
            var winner = {};
            angular.copy(rand, winner);

            $scope.currentEvent.currentWinner = winner;

            var position = raffleEntries.indexOf(rand);
            if (~position) raffleEntries.splice(position, 1);

            $scope.currentEvent.raffleEntries = raffleEntries;

            registrationSvc.updateEvent($scope.currentEvent);

        };

        $scope.setPrize = function (prize) {
            var winner = {};

            if ($scope.currentEvent.currentWinner === winner) {
                return;
            }

            angular.copy($scope.currentEvent.currentWinner, winner);
            winner.prize = prize;
            $scope.currentEvent.winners.push(winner);

            $scope.currentEvent.currentWinner = {};

            var position = $scope.currentEvent.prizes.indexOf(prize);
            if (~position) $scope.currentEvent.prizes.splice(position, 1);


            registrationSvc.updateEvent($scope.currentEvent);
            validateEvent();


        };

        $scope.canDraw = function () {
            
            if ($scope.currentEvent.raffleCompleted) {
                return false;
            }
            if (Object.keys($scope.currentEvent.currentWinner).length > 0) {
                return false;
            }
            return !$scope.hasError;
        };

        var validateEvent = function () {
            var raffleEntries = $scope.currentEvent.raffleEntries;

            if (raffleEntries == undefined || (raffleEntries.length == 0 && ($scope.currentEvent.winners == undefined || $scope.currentEvent.winners.length == 0))) {
                setError('No entries for this raffle');
                return;
            }

            if (raffleEntries.length == 0 && $scope.currentEvent.winners.length > 0 &&
                Object.keys($scope.currentEvent.currentWinner).length == 0) {

                $scope.currentEvent.raffleCompleted = true;
                registrationSvc.updateEvent($scope.currentEvent);
                setError('This raffle has ended!');
                return;
            }

            if ($scope.currentEvent.prizes.length == 0) {
                $scope.currentEvent.raffleCompleted = true;
                registrationSvc.updateEvent($scope.currentEvent);
                setError('No more prizes left!');
                return;
            }

            clearError();
        };

        var setError = function (message) {
            $scope.hasError = true;
            $scope.errorMessage = message;
        };
        var clearError = function () {
            $scope.errorMessage = '';
            $scope.hasError = false;
        };

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
        };

        $scope.isEmpty = function (obj) {
            for (var key in obj) {
                if (obj.hasOwnProperty(key)) {
                    return false;
                }

            }
            return true;
        };

        $scope.passWin = function () {

            var modalInstance = $modal.open({
                templateUrl: 'assets/modal-generic.html',
                controller: function ($scope, $modalInstance, modalInformation) {
                    $scope.info = modalInformation;

                    $scope.ok = function () {
                        $modalInstance.close();
                    };

                    $scope.close     = function () {
                        $modalInstance.dismiss('cancel');
                    };
                },
                controllerAs: 'modalPassWinCtrl',
                size: 'sm',
                resolve: {
                    modalInformation: function () {
                        var info = {};

                        info = {
                            modalTitle: 'Pass Win?',
                            modalBody: 'Are you sure you want to pass? This will remove all remaining entries.',
                            closeButtonText: 'Cancel',
                            actionButtonText: 'Yes'
                        };

                        return info;
                    }
                }
            });

            modalInstance.result
                .then(function () {
                    validateEvent();

                    $scope.currentEvent.raffleEntries = filterEntries($scope.currentEvent.raffleEntries, $scope.currentEvent.currentWinner);

                    $scope.drawWinner();
                });

        };

        var filterEntries = function (array, entry) {
            return array.filter(function (el) {
                return el.id !== entry.id;
            });
        }

        $scope.donateWin = function () {

            var allMembers = $scope.currentEvent.attendees;

            var modalInstance = $modal.open({
                templateUrl: 'assets/modal.html',
                controller: 'MemberModalInstanceCtrl',
                size: 'lg',
                resolve: {
                    modalInformation: function () {
                        var info = {};

                        info = {
                            members: allMembers,
                            modalTitle: 'Select Member',
                            modalDocument: 'apps/raffle/member-select.html',
                            closeButtonText: 'Cancel'
                        };

                        return info;
                    }
                }
            });

            modalInstance.result
                .then(function (member) {
                    $scope.currentEvent.currentWinner = member;
                });
        };

    }]);