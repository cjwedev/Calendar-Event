'use strict'

var SettingCtrl = function ($rootScope, $scope, $state, $cookieStore, $firebase) {
    // If not logged in, redirect to the login page
    if (angular.isUndefined($cookieStore.get('user')) || $cookieStore.get('user') === null) {
        $state.go('signin');
    }

    // Retrieve default group list
    var fireRef = new Firebase($rootScope.firebaseUrl);
    $scope.groupList = $firebase(fireRef.child('groups')).$asArray();

    var profileSync = $firebase(fireRef.child('users/' + $rootScope.userToken.uid));
    profileSync.$asObject().$bindTo($scope, "profile");

    // Get selected group
    $scope.selectedGroup = [];
    $scope.selectedGroupList = $firebase(fireRef.child('users/' + $rootScope.userToken.uid + '/groups')).$asArray();

    $scope.$watch('selectedGroupList.length', function() {
        for (var i = 0; i < $scope.selectedGroupList.length; i++) {
            $scope.selectedGroup.push($scope.selectedGroupList[i].$id);
        }
    })

    $scope.toggleGroupSelection = function(group_id) {
        var idx = $scope.selectedGroup.indexOf(group_id);

        // is currently selected
        if (idx > -1) {
            $scope.selectedGroup.splice(idx, 1);
        } else {
            $scope.selectedGroup.push(group_id);
        }
    };

    $scope.submitSetting = function() {
        $scope.profile.groups = {};
        debugger;
        for (var i = 0; i < $scope.selectedGroup.length; i++) {
            $scope.profile.groups[$scope.selectedGroup[i]] = {join: new Date()};
        }


        $state.go('main');
    }
}