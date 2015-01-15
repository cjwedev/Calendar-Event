'use strict'

var ShareCtrl = function ($rootScope, $scope, $state, $cookieStore, $stateParams, $firebase) {
    // If not logged in, redirect to the login page
    if (angular.isUndefined($cookieStore.get('user')) || $cookieStore.get('user') === null) {
        debugger;
        $state.go('signin');
    }
    $scope.profile = $cookieStore.get('profile');
    $scope.eventTitle = $rootScope.event.title;

    var fireRef = new Firebase($rootScope.firebaseUrl);

    var groupsSync = $firebase(fireRef.child('groups'));
    $scope.groupList = groupsSync.$asArray();

    // Selected group checkboxes (groupId)
    if (angular.isUndefined($scope.selectedGroupUser)) {
        $scope.selectedGroup = [];      // Selected group checkboxes (groupId)
        $scope.selectedUser = [];       // Selected user checkboxes (userId)
        $scope.selectedGroupUser = {};  // Selected users by group
    } else {
        $scope.selectedGroup = $rootScope.selectedGroup;
        $scope.selectedUser = $rootScope.selectedUser;       // Selected user checkboxes (userId)
        $scope.selectedGroupUser = $rootScope.selectedGroupUser;  // Selected users by group {groupId : [userId Array]}
    }

    // Retrieve current user's group list
    var currentGroupsObj = $scope.profile.groups;
    $scope.groupUserList = {};
    var groupArray = [];
    for (var key in currentGroupsObj) {
        groupArray.push(key);
        $scope.groupUserList[key] = {};
        $scope.groupUserList[key].users = [];
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
            var userGroups = $scope.userList[i].groups;
            for (var gr in userGroups) {
                if (groupArray.indexOf(gr) > -1) {
                    var tmp = {};
                    tmp.id = $scope.userList[i].$id;
                    tmp.firstName = $scope.userList[i].profile.first_name;
                    tmp.lastName = $scope.userList[i].profile.last_name;

                    $scope.groupUserList[k].users.push(tmp);
                }
            }
        }
        console.log($scope.groupUserList);
    });

    var updateGroupUserList = function(groupId, userId) {
        if (angular.isUndefined($scope.selectedGroupUser[groupId])) {
            $scope.selectedGroupUser[groupId] = [];
            $scope.selectedGroupUser[groupId].push(userId);
        } else {
            var idx = $scope.selectedGroupUser[groupId].indexOf(userId);
            if (idx > -1) {
                $scope.selectedGroupUser[groupId].splice(idx, 1);
            } else {
                $scope.selectedGroupUser[groupId].push(userId);
            }
        }
    }

    // Store the selected groups' Id
    $scope.toggleGroupSelection = function(groupId) {
        var idx = $scope.selectedGroup.indexOf(groupId);
        if (idx > -1) {
            // is currently selected
            $scope.selectedGroup.splice(idx, 1);

            // Uncheck all users in this group
            for (var i = 0; i < $scope.groupUserList[groupId].length; i++) {
                var obj = $scope.groupUserList[groupId][i];
                var user_idx = $scope.selectedUser.indexOf(obj.id);
                if (user_idx > -1) {
                    $scope.selectedUser.splice(user_idx, 1);
                    updateGroupUserList(groupId, obj.id);
                }
            }
        } else {
            // is newly selected
            $scope.selectedGroup.push(groupId);

            // Check all users in this group
            for (var i = 0; i < $scope.groupUserList[groupId].length; i++) {
                var obj = $scope.groupUserList[groupId][i];
                var user_idx = $scope.selectedUser.indexOf(obj.id);
                if (user_idx < 0) {
                    $scope.selectedUser.push(obj.id);
                    updateGroupUserList(groupId, obj.id);
                }
            }
        }
    }

    // Store the selected users' Id
    $scope.toggleUserSelection = function(groupId, userId) {
        var idx = $scope.selectedUser.indexOf(userId);
        if (idx > -1) {
            // is currently selected
            $scope.selectedUser.splice(idx, 1);
            updateGroupUserList(groupId, userId);
        } else {
            // is newly selected
            $scope.selectedUser.push(userId);
            updateGroupUserList(groupId, userId);
        }
    }

    // All select
    $scope.toggleSelectAll = function() {
        if ($scope.checkAll) {
            for (var i = 0; i < $scope.showGroupList.length; i++){
                // Select all groups
                var group = $scope.showGroupList[i];
                var grpIdx = $scope.selectedGroup.indexOf(group.id);
                if (grpIdx < 0) $scope.selectedGroup.push(group.id);

                // Select all users
                for (var j = 0; j < $scope.groupUserList[group.id].length; j++) {
                    var userObj = $scope.groupUserList[group.id][j];
                    var idx = $scope.selectedUser.indexOf(userObj.id);
                    if (idx < 0) {
                        $scope.selectedUser.push(userObj.id);
                        updateGroupUserList(group.id, userObj.id);
                    }
                }
            }
        } else {
            $scope.selectedUser = [];
            $scope.selectedGroup = [];
        }
    }

    $scope.done = function() {
        $rootScope.selectedGroup = $scope.selectedGroup;
        $rootScope.selectedUser = $scope.selectedUser;
        $rootScope.selectedGroupUser = $scope.selectedGroupUser;

        $state.go('eventCreate');
    }
}
