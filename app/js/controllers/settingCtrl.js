'use strict'

var SettingCtrl = function ($rootScope, $scope, $state, $cookieStore, $firebase, $filter) {
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

        if (idx > -1) {
            // is currently selected
            $scope.selectedGroup.splice(idx, 1);
            for (var i = 0; i < $scope.groupList.length; i++) {
                if ($scope.groupList[i].$id == group_id) {
                    var gr = $scope.groupList[i];
                    if (!angular.isUndefined(gr.members))
                        delete gr.members[$rootScope.userToken.uid];
                    $scope.groupList.$save(i);
                }
            }
        } else {
            // new
            $scope.selectedGroup.push(group_id);

            for (var i = 0; i < $scope.groupList.length; i++) {
                if ($scope.groupList[i].$id == group_id) {
                    var gr = $scope.groupList[i];
                    if (angular.isUndefined(gr.members)) gr.members = {};
                    gr.members[$rootScope.userToken.uid] = {join: $filter('date')(new Date(), 'yyyy/MM/dd HH:mm')};
                    $scope.groupList.$save(i);
                }
            }
        }
    };

    $scope.submitSetting = function() {
        $scope.profile.uid = $rootScope.userToken.uid;
        $scope.profile.groups = {};

        for (var i = 0; i < $scope.selectedGroup.length; i++) {
            $scope.profile.groups[$scope.selectedGroup[i]] = {join: $filter('date')(new Date(), 'yyyy/MM/dd HH:mm')};
        }
    }
}