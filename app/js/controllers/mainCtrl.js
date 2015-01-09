
'use strict';

var MainCtrl = function ($rootScope, $scope, $state, $cookieStore, $firebase) {
    var fireRef = new Firebase('https://vivid-inferno-7237.firebaseio.com');

    if (angular.isUndefined($cookieStore.get('user')) || $cookieStore.get('user') === null)
        $state.go('signin');

    // When profile data is synchronized, stores it into cookie
    $scope.$watch('profile.profile.uid', function(newVal, oldVal) {
        $cookieStore.put('profile', $scope.profile);
    });

    // Retrieve user profile data
    $scope.init = function() {
        var sync = $firebase(fireRef.child($rootScope.userToken.uid));
        $scope.profile = sync.$asObject();
    }
};