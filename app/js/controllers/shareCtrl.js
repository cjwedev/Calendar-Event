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

    $scope.selectedGroup = [];  // Selected group checkboxes (groupId)
    $scope.selectedUser = [];   // Selected user checkboxes (userId)

    // Retrieve current user's group list
    var currentGroupsObj = $scope.profile.groups;
    $scope.groupUserList = {};
    var groupArray = [];
    for (var key in currentGroupsObj) {
        groupArray.push(key);
        $scope.groupUserList[key] = [];
    }
    $scope.showGroupList = [];
    $scope.$watch('groupList.length', function() {
        for (var i = 0; i < groupArray.length; i++) {
            for (var j = 0; j < $scope.groupList.length; j++) {
                if (groupArray[i] == $scope.groupList[j].$id) {
                    $scope.showGroupList.push({
                        id: $scope.groupList[j].$id,
                        name: $scope.groupList[j].name
                    });
                }
            }
        }
    });

    // Grouping users by their group
    var usersSync = $firebase(fireRef.child('users'));
    $scope.userList = usersSync.$asArray();
    $scope.$watch('userList.length', function() {
        for (var i = 0; i < $scope.userList.length; i++) {
            if ($scope.userList[i].$id != $scope.profile.$id) {
                var userGroups = $scope.userList[i].groups;
                for (var k in userGroups) {
                    if (groupArray.indexOf(k) > -1) {
                        var tmp = {};
                        tmp.id = $scope.userList[i].$id;
                        tmp.firstName = $scope.userList[i].profile.first_name;
                        tmp.lastName = $scope.userList[i].profile.last_name;

                        $scope.groupUserList[k].push(tmp);
                    }
                }
            }
        }
        console.log($scope.groupUserList);
    });

    // Store the selected groups' Id
    $scope.toggleGroupSelection = function(groupId) {
        var idx = $scope.selectedGroup.indexOf(groupId);
        if (idx > -1) {
            // is currently selected
            $scope.selectedGroup.splice(idx, 1);
        } else {
            // is newly selected
            $scope.selectedGroup.push(groupId);
        }
    }

    // Store the selected users' Id
    $scope.toggleUserSelection = function(userId) {
        var idx = $scope.selectedUser.indexOf(userId);
        if (idx > -1) {
            // is currently selected
            $scope.selectedUser.splice(idx, 1);
        } else {
            // is newly selected
            $scope.selectedUser.push(userId);
        }
    }
}
