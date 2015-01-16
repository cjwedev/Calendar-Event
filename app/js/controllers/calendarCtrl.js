
'use strict';

var CalendarCtrl = function ($rootScope, $scope, $state, $cookieStore, $filter, $firebase) {
    // If not logged in, redirect to the login page
    if (angular.isUndefined($cookieStore.get('user')) || $cookieStore.get('user') === null) {
        $state.go('signin');
    }
    $scope.profile = $cookieStore.get('profile');
    if (angular.isUndefined($scope.profile)) {
        $state.go('signin');
    }

    $scope.userGroups = []; // Group array user involved
    for (var item in $scope.profile.groups) {
        $scope.userGroups.push(item);
    }

    // Initialize the variables for year, month, week, day event list
    $scope.yearList = [];
    $scope.monthList = [];
    $scope.weekList = [];
    $scope.dayList = [];
    $scope.showList = [];

    if (angular.isUndefined($rootScope.event))
        $scope.event = {};
    else
        $scope.event = $rootScope.event;

    if (angular.isUndefined($rootScope.selectedGroupUser)) {
        $scope.selectedGroupUser = {};
    } else {
        $scope.selectedGroupUser = $rootScope.selectedGroupUser;
        $scope.event.group = "";
        for (var item in $scope.selectedGroupUser) {
            $scope.event.group += $scope.selectedGroupUser[item].groupName;
            $scope.event.group += "(" + $scope.selectedGroupUser[item].members.length + ") ";
        }
    }

    var fireRef = new Firebase($rootScope.firebaseUrl);
    var sync = $firebase(fireRef.child('events').orderByChild('from'));
    $scope.eventList = sync.$asArray();

    if (angular.isUndefined(sync)) {
        fireRef.set({ event: {} });
    }

    $scope.$watch('eventList.length', function(){
        for (var i = 0; i < $scope.eventList.length; i++) {
            var event = $scope.eventList[i];

            // Check group
            var involved = false;
            for (var item in event.group) {
                if ($scope.userGroups.indexOf(item) > -1) {
                    for (var usr in event.group[item]) {
                        if (usr == $scope.profile.uid) {
                            involved = true;
                            break;
                        }
                    }

                    if (involved) break;
                }
            }

            if (!involved) continue;
            var membersCount = 0;
            for (var item in event.group) {
                if ($scope.userGroups.indexOf(item) > -1) {
                    for (var usr in event.group[item]) {
                        if (usr == $scope.profile.uid) {
                            involved = true;
                            break;
                        }
                    }

                    if (involved) break;
                }
            }

            var current_date = new Date();
            var event_start_time = new Date(event.from);

            // Year
            if (current_date.getFullYear() == event_start_time.getFullYear()) {
                $scope.yearList.push(event);

                // Month
                if (current_date.getMonth() == event_start_time.getMonth()) {
                    $scope.monthList.push(event);

                    // Week
                    var current_week = $filter('date')(current_date, 'ww');
                    var event_week = $filter('date')(event_start_time, 'ww');
                    if (current_week == event_week) {
                        $scope.weekList.push(event);

                        // Day
                        if (current_date.getDate() == event_start_time.getDate()) {
                            $scope.dayList.push(event);
                        }
                    }
                }
            }
            $scope.showEventList('year');
        }
    });

    // Extract only time in format (HH:MM AM) from full event date
    function getTimeWithoutDate(full_date) {
        return $filter('date')(new Date(full_date), 'hh:mm a');
    }

    $scope.showEventList = function(type) {
        $scope.showList = [];

        if (type == 'year') {
            $scope.tmpList = $scope.yearList;
            $scope.menuType = 'year';
        } else if (type == 'month') {
            $scope.tmpList = $scope.monthList;
            $scope.menuType = 'month';
        } else if (type == 'week') {
            $scope.tmpList = $scope.weekList;
            $scope.menuType = 'week';
        } else if (type == 'day') {
            $scope.tmpList = $scope.dayList;
            $scope.menuType = 'day';
        } else {
            $scope.tmpList = [];
            $scope.menuType = '';
        }

        // Group event list by day
        for (var i = 0; i < $scope.tmpList.length; i++) {
            var ev = $scope.tmpList[i];
            var date_str = $filter('date')(new Date(ev.from), 'EEEE, MMM d');
            ev.time = getTimeWithoutDate(ev.from);

            var day_obj = null;
            for (var j = 0; j < $scope.showList.length; j++) {
                if ($scope.showList[j]["date"] == date_str) {
                    day_obj = $scope.showList[j];
                    $scope.showList[j]["array"].push(ev);
                    break;
                }
            }

            if (day_obj == null) {
                var obj = {};
                obj["date"] = date_str;
                obj["array"] = [];
                obj["array"].push(ev);
                $scope.showList.push(obj);
            }
        }
        console.log($scope.showList);
    }

    $scope.createEvent = function() {
        // Store the converted starndard datetime into Firebase
        var date_from_tmp = new Date(Date.parse($scope.event.eventDate + " " + $scope.event.eventFrom));
        var date_to_tmp = new Date(Date.parse($scope.event.eventDate + " " + $scope.event.eventTo));

        var group = {}
        for (var item in $scope.selectedGroupUser) {
            group[item] = {};
            for (var i = 0; i < $scope.selectedGroupUser[item].members.length; i++) {
                group[item][$scope.selectedGroupUser[item].members[i]] = true;
            }
        }
        debugger;
        $scope.eventList.$add({
            title       : $scope.event.title,
            from        : $filter('date')(date_from_tmp, 'yyyy/MM/dd HH:mm'),
            to          : $filter('date')(date_to_tmp, 'yyyy/MM/dd HH:mm'),
            group       : group,
            address     : $scope.event.address,
            created_by  : $scope.profile.uid
        });

        $scope.event = {}
        $scope.selectedGroupUser = {};
        $state.go('eventList');
    }

    $scope.goLookup = function() {
        $rootScope.event = $scope.event;
        $state.go('eventShare');
    }

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