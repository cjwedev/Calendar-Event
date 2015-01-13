
'use strict';

var MainCtrl = function ($rootScope, $scope, $state, $cookieStore, $firebase) {
    var fireRef = new Firebase($rootScope.firebaseUrl);

    // Check if user logged in
    if (angular.isUndefined($cookieStore.get('user')) || $cookieStore.get('user') === null)
        $state.go('signin');

    // When profile data is synchronized, stores it into cookie
    $scope.$watch('profile.profile', function() {
        debugger;
        $cookieStore.put('profile', $scope.profile);
        console.log($scope.profile);
    });

    // Retrieve user profile data
    $scope.init = function() {
        var sync = $firebase(fireRef.child('users/' + $rootScope.userToken.uid));
        $scope.profile = sync.$asObject();
    }
};