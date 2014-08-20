angular.module('ugRaffleApp').controller("SetupMembersCtrl", ['$scope', 'memberService',
    function ($scope, memberService) {

        $scope.members = [];

        memberService.getMembers().then(function (members) {
            $scope.members = members;
        });

        $scope.addMember = function (newMember) {
            memberService.createMember(newMember).then(function (members) {
                $scope.members = members;
                $scope.newMember = {};
            });
        };

    }]);


angular.module('raffleAppServices').factory('memberService', 
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

                self._members.push(member);

                $http.post(MongoDB('members'), member)
                    .then(function (data) {
                        deferred.resolve(self.members);
                    });

                return deferred.promise;
            };

        return {
            members: members,
            getMembers: getMembers,
            addMember: addMember
        }
    });