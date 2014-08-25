angular.module('ugRaffleApp')
    .controller("SetupPrizesCtrl", ['$scope', '$modal', 'PrizeService',
        function ($scope, $modal, PrizeService) {

            $scope.prizes = [];

            loadRemoteData();

            $scope.createPrize = function (newPrize) {
                PrizeService.addPrize(newPrize).then(function (prizes) {
                    $scope.prizes = prizes;
                    $scope.currentPrize = newPrize;
                    $scope.newPrize = {};
                });

            };

            $scope.deletePrize = function (prize) {
                PrizeService.deletePrize(prize)
                    .then(loadRemoteData);
            };

            $scope.editPrize = function (prize) {
                var modalInstance = $modal.open({
                    templateUrl: 'assets/modal.html',
                    controller: 'PrizeModalInstanceCtrl',
                    size: 'lg',
                    resolve: {
                        modalInformation: function () {
                            var info = {};

                            info = {
                                prize: prize,
                                modalTitle: 'Edit Prize',
                                modalDocument: 'apps/setup/prizes/prizes-edit.html'
                            };

                            return info;
                        }
                    }
                });

                modalInstance.result
                    .then(function (prize) {
                        $scope.updatePrize(prize);
                    });
            };

            $scope.addPrize = function () {
                var modalInstance = $modal.open({
                    templateUrl: 'assets/modal.html',
                    controller: 'PrizeModalInstanceCtrl',
                    size: 'lg',
                    resolve: {
                        modalInformation: function () {
                            var info = {};

                            info = {
                                prize: {},
                                modalTitle: 'Add Prize',
                                modalDocument: 'apps/setup/prizes/prizes-add.html'
                            };

                            return info;
                        }
                    }
                });

                modalInstance.result
                    .then(function (prize) {
                        $scope.createPrize(prize);
                    })
                    .then(loadRemoteData);
            };

            $scope.updatePrize = function (prize) {
                PrizeService.updatePrize(prize)
                    .then(loadRemoteData);
            };

            function loadRemoteData() {
                PrizeService.getPrizes()
                    .then(function (prizes) {
                        setRemoteData(prizes);
                    });
            };

            function setRemoteData(prizes) {
                $scope.prizes = prizes;
            };

        }
    ]);

angular.module('ugRaffleApp')
.controller('PrizeModalInstanceCtrl', ['$scope', '$modalInstance', 'modalInformation',
    function ($scope, $modalInstance, modalInformation) {
        $scope.prize = modalInformation['prize'];
        $scope.modalTitle = modalInformation['modalTitle'];
        $scope.modalDocument = modalInformation['modalDocument'];

        $scope.updatePrize = function () {
            $modalInstance.close($scope.prize);
        };

        $scope.createPrize = function () {
            $modalInstance.close($scope.prize);
        };

    }]);


angular.module('raffleAppServices')
    .factory('PrizeService', ['$http', '$q', '$timeout',
        function ($http, $q, $timeout) {

            var prizes = [],

                getPrizes = function () {
                    var deferred = $q.defer();
                    var self = this;

                    $http.get(MongoDB('prizes'))
                        .then(function (data) {
                            self.prizes = data.data;
                            deferred.resolve(self.prizes);
                        });

                    return deferred.promise;
                },

                addPrize = function (newPrize) {
                    var deferred = $q.defer();
                    var self = this;

                    newPrize.id = Guid();
                    self.prizes.push(newPrize);

                    $http.post(MongoDB('prizes'), newPrize)
                        .then(function (data) {
                            deferred.resolve(self.prizes);
                        });

                    return deferred.promise;
                },

                updatePrize = function (prize) {
                    var deferred = $q.defer();
                    var self = this;

                    var id = '{"id":"' + prize.id + '"}';
                    delete prize._id;

                    $http.put(MongoDB('prizes') + '&q=' + id, prize)
                        .then(function (data) {
                            deferred.resolve(self.prizes);
                        });

                    return deferred.promise;
                },

                deletePrize = function (prize) {
                    var deferred = $q.defer();
                    var self = this;
                    var collectionWithId = 'prizes/' + prize._id.$oid;

                    $http.delete(MongoDB(collectionWithId))
                         .then(function (data) {
                             deferred.resolve(self.prizes);
                         });

                    return deferred.promise;
                };

            return {
                prizes: prizes,
                getPrizes: getPrizes,
                addPrize: addPrize,
                updatePrize: updatePrize,
                deletePrize: deletePrize
            }
        }
    ]);