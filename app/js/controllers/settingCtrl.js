'use strict'

var SettingCtrl = function ($rootScope, $scope, $state, $cookieStore, $firebase) {
    // If not logged in, redirect to the login page
    if (angular.isUndefined($cookieStore.get('user')) || $cookieStore.get('user') === null) {
        $state.go('signin');
    }

    // Retrieve default group list
    var fireRef = new Firebase($rootScope.firebaseUrl);
    var groupSync = $firebase(fireRef.child('groups'));
    $scope.groupList = groupSync.$asArray();

    var profileSync = $firebase(fireRef.child('users/' + $rootScope.userToken.uid));
    profileSync.$asObject().$bindTo($scope, "profile");
    if (angular.isUndefined(profileSync)) {
        fireRef.set({ users: { profile: {}}});
    }

    // Get selected group
    $scope.selectedGroup = [];
    var groupSync = $firebase(fireRef.child('users/' + $rootScope.userToken.uid + '/groups'));
    $scope.selectedGroupList = groupSync.$asArray();
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

        for (var i = 0; i < $scope.selectedGroup.length; i++) {
            $scope.profile.groups[$scope.selectedGroup[i]] = {enabled: true};
        }

        $state.go('main');
    }
}