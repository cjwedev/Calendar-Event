'use strict'

var ShareCtrl = function ($rootScope, $scope, $state, $cookieStore, $firebase) {
    // If not logged in, redirect to the login page
    if (angular.isUndefined($cookieStore.get('user')) || $cookieStore.get('user') === null) {
        $state.go('signin');
    }
    $scope.eventTitle = $rootScope.event.title;

    var fireRef = new Firebase($rootScope.firebaseUrl);
    $scope.groupList = $firebase(fireRef.child('groups')).$asArray();
    $scope.usersObj = $firebase(fireRef.child('users')).$asObject();

    /* Initialize scope variables */
    // Selected group checkboxes (groupId)
    if (angular.isUndefined($scope.selectedGroupUser)) {
        $scope.selectedGroupUser = {};  // Selected users by group
    } else {
        $scope.selectedGroupUser = $rootScope.selectedGroupUser;  // Selected users by group {groupId : [userId Array]}
    }
    $scope.selectedGroup = [];
    for (var item in $scope.selectedGroupUser) {
        $scope.selectedGroup.push(item);
    }

    // Store the selected groups' Id
    $scope.toggleGroupSelection = function(groupId) {
        var idx = $scope.selectedGroup.indexOf(groupId);
        if (idx > -1) { // is currently selected
            $scope.selectedGroup.splice(idx, 1);
            delete $scope.selectedGroupUser[groupId];
        } else { // is newly selected
            $scope.selectedGroup.push(groupId);

            if (angular.isUndefined($scope.selectedGroupUser[groupId])) {
                $scope.selectedGroupUser[groupId] = {};
                for (var i = 0; i < $scope.groupList.length; i++) {
                    if ($scope.groupList[i].$id == groupId) {
                        $scope.selectedGroupUser[groupId].groupName = $scope.groupList[i].details.groupName;
                        $scope.selectedGroupUser[groupId].members = [];

                        // Add all group members
                        for (var item in $scope.groupList[i].members ) {
                            $scope.selectedGroupUser[groupId].members.push(item);
                        }
                        break;
                    }
                }
            } else {
                for (var i = 0; i < $scope.groupList.length; i++) {
                    if ($scope.groupList[i].$id == groupId) {
                        // Add all group members
                        for (var item in $scope.groupList[i].members ) {
                            if ($scope.selectedGroupUser[groupId].members.indexOf(item) < 0) {
                                $scope.selectedGroupUser[groupId].members.push(item);
                            }
                        }
                        break;
                    }
                }
            }
        }
    }

    // Store the selected users' Id with group Id
    $scope.toggleUserSelection = function(groupId, userId) {
        if (angular.isUndefined($scope.selectedGroupUser[groupId])) { // This group and user are first time to be added
            $scope.selectedGroupUser[groupId] = {};
            for (var i = 0; i < $scope.groupList.length; i++) {
                if ($scope.groupList[i].$id == groupId) {
                    $scope.selectedGroupUser[groupId].groupName = $scope.groupList[i].details.groupName;
                    $scope.selectedGroupUser[groupId].members = [];

                    // Add selected member
                    $scope.selectedGroupUser[groupId].members.push(userId);
                }
            }
        } else {
            var idx = $scope.selectedGroupUser[groupId].members.indexOf(userId);
            if (idx > -1) { // this is currently selected
                $scope.selectedGroupUser[groupId].members.splice(idx, 1);
            } else { // is newly selected
                $scope.selectedGroupUser[groupId].members.push(userId);
            }

            if ($scope.selectedGroupUser[groupId].members.length == 0) {
                delete $scope.selectedGroupUser[groupId];
            }
        }
    }

    // All select
    $scope.toggleSelectAll = function() {
        if ($scope.checkAll) {
            for (var i = 0; i < $scope.groupList.length; i++){
                var groupId = $scope.groupList[i].$id;

                var grpIdx = $scope.selectedGroup.indexOf(groupId);
                if (grpIdx < 0) $scope.selectedGroup.push(groupId);

                if (angular.isUndefined($scope.selectedGroupUser[groupId])) {
                    $scope.selectedGroupUser[groupId] = {};
                    $scope.selectedGroupUser[groupId].groupName = $scope.groupList[i].details.groupName;
                    $scope.selectedGroupUser[groupId].members = [];
                }

                for (var item in $scope.groupList[i].members ) {
                    if ($scope.selectedGroupUser[groupId].members.indexOf(item) < 0) {
                        $scope.selectedGroupUser[groupId].members.push(item);
                    }
                }
            }
        } else {
            $scope.selectedGroupUser = {};
            $scope.selectedGroup = [];
        }
    }

    $scope.done = function() {
        $rootScope.selectedGroupUser = $scope.selectedGroupUser;

        $state.go('eventCreate');
    }
}
