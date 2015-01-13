'use strict'

var ShareCtrl = function ($rootScope, $scope, $state, $cookieStore, $stateParams, $firebase) {
    // If not logged in, redirect to the login page
    if (angular.isUndefined($cookieStore.get('user')) || $cookieStore.get('user') === null) {
        debugger;
        $state.go('signin');
    }
    $scope.profile = $cookieStore.get('profile');
    $scope.eventTitle = $stateParams.eventTitle;

    var fireRef = new Firebase($rootScope.firebaseUrl);

    var groupsSync = $firebase(fireRef.child('groups'));
    $scope.groupList = groupsSync.$asArray();

    // Retrieve current user's group list
    var currentGroupsObj = $scope.profile.groups;
    $scope.currentGroupsList = {};
    var groupArray = [];
    for (var key in currentGroupsObj) {
        debugger;
        groupArray.push(key);
        $scope.currentGroupsList[key] = [];
    }

    // Grouping users by their group
    var usersSync = $firebase(fireRef.child('users'));
    $scope.userList = usersSync.$asArray();
    $scope.$watch('userList.length', function() {
        debugger;
        for (var i = 0; i < $scope.userList.length; i++) {
            if ($scope.userList[i].$id != $scope.profile.$id) {
                var userGroups = $scope.userList[i].groups;
                for (var k in userGroups) {
                    if (groupArray.indexOf(k) > -1) {
                        $scope.currentGroupsList[k].push({
                            id: $scope.userList[i].$id,
                            fistName: $scope.userList[i].profile.first_name,
                            lastName: $scope.userList[i].profile.last_name
                        });
                    }
                }
            }
        }
    });

}
