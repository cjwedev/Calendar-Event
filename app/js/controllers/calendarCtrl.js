
'use strict';

var CalendarCtrl = function ($rootScope, $scope, $state, $cookieStore, $firebase) {
    var fireRef = new Firebase('https://vivid-inferno-7237.firebaseio.com');

    $scope.profile = $cookieStore.get('profile');
    debugger;

    if (angular.isUndefined($cookieStore.get('user')) || $cookieStore.get('user') === null) {
        debugger;
        $state.go('signin');
    }
};