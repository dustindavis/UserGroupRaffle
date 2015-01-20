angular.module('ugRaffleApp')
    .controller("SetupMembersCtrl", ['$scope', '$modal', 'MemberService',
    function ($scope, $modal, MemberService) {

        $scope.members = [];

        loadRemoteData();

        $scope.createMember = function (newMember) {
            MemberService.addMember(newMember).then(function (members) {
                $scope.members = members;
                $scope.newMember = {};
            });
        };

        $scope.deleteMember = function (member) {
            MemberService.deleteMember(member)
                .then(loadRemoteData);
        };

        $scope.editMember = function (member) {
            var modalInstance = $modal.open({
                templateUrl: 'assets/modal.html',
                controller: 'MemberModalInstanceCtrl',
                size: 'lg',
                resolve: {
                    modalInformation: function () {
                        var info = {};

                        info = {
                            member: member,
                            modalTitle: 'Edit Member',
                            modalDocument: 'apps/setup/members/members-edit.html'
                        };

                        return info;
                    }
                }
            });

            modalInstance.result
                .then(function (member) {
                    $scope.updateMember(member);
                });
        };

        $scope.addMember = function () {
            var modalInstance = $modal.open({
                templateUrl: 'assets/modal.html',
                controller: 'MemberModalInstanceCtrl',
                size: 'lg',
                resolve: {
                    modalInformation: function () {
                        var info = {};

                        info = {
                            member: {},
                            modalTitle: 'Add Member',
                            modalDocument: 'apps/setup/members/members-add.html'
                        };

                        return info;
                    }
                }
            });

            modalInstance.result
                .then(function (member) {
                    $scope.createMember(member);
                })
                .then(loadRemoteData);
        };

        $scope.updateMember = function (member) {
            MemberService.updateMember(member)
                .then(loadRemoteData);
        };

        function loadRemoteData() {
            MemberService.getMembers()
                .then(function (members) {
                    setRemoteData(members);
                });
        };

        function setRemoteData(members) {
            $scope.members = members;
        };

    }]);

angular.module('ugRaffleApp')
.controller('MemberModalInstanceCtrl', ['$scope', '$modalInstance', 'modalInformation',
    function ($scope, $modalInstance, modalInformation) {
        $scope.member = modalInformation['member'];
        $scope.modalTitle = modalInformation['modalTitle'];
        $scope.modalDocument = modalInformation['modalDocument'];
        $scope.members = modalInformation['members'];
        $scope.closeButtonText = modalInformation['closeButtonText'];
//        $scope.memberFilter = {};

        $scope.updateMember = function () {
            $modalInstance.close($scope.member);
        };

        $scope.createMember = function () {
            $modalInstance.close($scope.member);
        };

        $scope.selectMember = function(member) {
            //var member = $scope.members[index];
            $modalInstance.close(member);
        };

        $scope.close = function () {
            $modalInstance.dismiss('cancel');
        };

    }]);

angular.module('raffleAppServices').factory('MemberService',
    function ($http, $q, $timeout) {

        var members = new Array(),

            getMembers = function () {
                var deferred = $q.defer();
                var self = this;

                $http.get(MongoDB('members'))
                    .then(function (data) {
                        self.members = data.data;
                        deferred.resolve(self.members);
                    });

                return deferred.promise;
            },

            addMember = function (member) {
                var deferred = $q.defer();
                var self = this;

                member.id = Guid();

                self.members.push(member);

                $http.post(MongoDB('members'), member)
                    .then(function (data) {
                        deferred.resolve(self.members);
                    });

                return deferred.promise;
            },

            updateMember = function (member) {
                var deferred = $q.defer();
                var self = this;

                var id = '{"id":"' + member.id + '"}';
                delete member._id;

                $http.put(MongoDB('members') + '&q=' + id, member)
                    .then(function (data) {
                        deferred.resolve(self.members);
                    });

                return deferred.promise;
            },

            deleteMember = function (member) {
                var deferred = $q.defer();
                var self = this;
                var collectionWithId = 'members/' + member._id.$oid;

                $http.delete(MongoDB(collectionWithId))
                        .then(function (data) {
                            deferred.resolve(self.members);
                        });

                return deferred.promise;
            };

        return {
            members: members,
            getMembers: getMembers,
            addMember: addMember,
            updateMember: updateMember,
            deleteMember: deleteMember
        }
    });