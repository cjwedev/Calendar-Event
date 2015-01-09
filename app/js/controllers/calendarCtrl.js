
'use strict';

var CalendarCtrl = function ($rootScope, $scope, $state, $cookieStore, $filter, $firebase) {
    // If not logged in, redirect to the login page
    if (angular.isUndefined($cookieStore.get('user')) || $cookieStore.get('user') === null) {
        $state.go('signin');
    }
    $scope.profile = $cookieStore.get('profile');

    var fireRef = new Firebase('https://vivid-inferno-7237.firebaseio.com');
    var sync = $firebase(fireRef.child('event').orderByChild('from'));

    if (angular.isUndefined(sync)) {
        fireRef.set({ event: {} });
    }

    $scope.eventList = sync.$asArray();
    $scope.$watch('eventList.length', function(){
        debugger;
    });

    $scope.initList = function() {

    }

    $scope.createEvent = function() {
        // Store the converted starndard datetime into Firebase
        var date_from_tmp = new Date(Date.parse($scope.event.eventDate + " " + $scope.event.eventFrom));
        var date_to_tmp = new Date(Date.parse($scope.event.eventDate + " " + $scope.event.eventTo));

        $scope.eventList.$add({
            title       : $scope.event.title,
            from        : $filter('date')(date_from_tmp, 'yyyy/MM/dd HH:mm'),
            to          : $filter('date')(date_to_tmp, 'yyyy/MM/dd HH:mm'),
            group       : $scope.event.group,
            address     : $scope.event.address,
            created_by  : $scope.profile.profile.uid
        });
    };

    // Init date picker
    $('#eventDate').datetimepicker({
        timepicker: false,
        format: 'D, M j, Y',
        closeOnDateSelect: true,
        defaultDate: new Date(),
        onChangeDateTime:function(dp, $input){

            $scope.event.eventDate = $input.val();
        }
    });

    // Init From-To time picker
    $('#eventFrom').datetimepicker({
        datepicker: false,
        closeOnDateSelect: true,
        format: 'h:i a',
        step: 30,
        onChangeDateTime:function(dp, $input){
            $scope.event.eventFrom = $input.val();
        }
    });
    $('#eventTo').datetimepicker({
        datepicker: false,
        closeOnDateSelect: true,
        format: 'h:i a',
        step: 30,
        onChangeDateTime:function(dp, $input){
            $scope.event.eventTo = $input.val();
        }
    });

};