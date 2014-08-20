angular.module('ugRaffleApp').controller('setupCtrl', ['$scope',
    function ($scope) {
        $scope.subSections = [
            { name: 'Events', url: 'apps/setup/events/events.html' },
            { name: 'Members', url: 'apps/setup/members/members.html' },
            { name: 'Users', url: 'apps/setup/users/users.html' },
            { name: 'Prizes', url: 'apps/setup/prizes/prizes.html' }
        ];

        $scope.changeSubSection = function(index) {
            $scope.subSection = $scope.subSections[index];
            $scope.selected = index;
        };

        $scope.changeSubSection(0);

    }]);