
'use strict';

var CalendarCtrl = function ($rootScope, $scope, $state, $cookieStore, $filter, $stateParams, $firebase) {
    // If not logged in, redirect to the login page
    if (angular.isUndefined($cookieStore.get('user')) || $cookieStore.get('user') === null) {
        $state.go('signin');
    }
    $scope.profile = $cookieStore.get('profile');
    if (angular.isUndefined($scope.profile)) {
        $state.go('signin');
    }

    var fireRef = new Firebase($rootScope.firebaseUrl);

    /* Initialize event detail page variables
     * Selected event is in rootscope from list page */
    $scope.initDetailPage = function() {
        $scope.isOwner = false; // Check if current user is a creator of this event

        $scope.detailEvent = $firebase(fireRef.child('events').child($stateParams.eventId)).$asObject();
        $scope.$watch('detailEvent.title', function() {
            $scope.detailEvent.eventDateTimeFrom = $filter('date')(new Date($scope.detailEvent.from), 'EEE, MMM d yyyy');
            $scope.detailEvent.eventTimeFrom = $filter('date')(new Date($scope.detailEvent.from), 'hh:mm a');
            $scope.detailEvent.eventTimeTo = $filter('date')(new Date($scope.detailEvent.to), 'hh:mm a');

            // Calculate members count involved in the event
            var memberList = [];
            memberList.push($scope.detailEvent.created_by);
            for (var item in $scope.detailEvent.group) {
                for (var usr in $scope.detailEvent.group[item]) {
                    if (memberList.indexOf(usr) < 0)
                        memberList.push(usr);
                }
            }
            $scope.detailEvent.members = memberList.length;

            // Check if the current user is owner of this event
            if ($scope.detailEvent.created_by == $scope.profile.uid)
                $scope.isOwner = true;
        })

        // Initialize comment list
        $scope.commentsSync = $firebase(fireRef.child('comments').child($stateParams.eventId).orderByChild('created_date')).$asArray();
        $scope.$watch('commentsSync.length', function() {
            if (angular.isUndefined($scope.commentsSync)) {
                return;
            }

            $scope.commentList = $scope.commentsSync;
            for (var i = 0; i < $scope.commentList.length; i++) {
                if ($scope.profile.uid == $scope.commentList[i].created_by)
                    $scope.commentList[i].isSelf = true;
                else
                    $scope.commentList[i].isSelf = false;

                $scope.commentList[i].commentDate = $filter('date')(new Date($scope.commentList[i].created_date), 'EEE, MMM d yyyy, hh:mm a');

                // Get first name
                $scope.commentList[i].firstName =
                    $firebase(fireRef.child('users').child($scope.commentList[i].created_by).child('profile')).$asObject();
            }
        })
    }

    /* Initialize event list page variables */
    $scope.initListPage = function() {
        var sync = $firebase(fireRef.child('events').orderByChild('from'));
        $scope.eventList = sync.$asArray();

        // Group array user involved
        $scope.userGroups = [];
        for (var item in $scope.profile.groups) {
            $scope.userGroups.push(item);
        }

        if (angular.isUndefined(sync)) {
            fireRef.set({ events: {} });
        }

        // Initialize the variables for year, month, week, day event list
        $scope.yearList = [];
        $scope.monthList = [];
        $scope.weekList = [];
        $scope.dayList = [];
        $scope.showList = [];

        $rootScope.event = undefined;
        $rootScope.selectedGroupUser = undefined;
    }

    function getGroupUserFrom(selectedGroupUser) {
        var group = "";
        for (var item in selectedGroupUser) {
            group += selectedGroupUser[item].groupName;
            group += "(" + selectedGroupUser[item].members.length + ") ";
        }

        return group;
    }

    /* Initialize event create page variables */
    $scope.initCreatePage = function() {
        $scope.eventId = $stateParams.eventId;
        if (angular.isUndefined($scope.eventId)){ // event create page
            var sync = $firebase(fireRef.child('events'));
            $scope.eventListSync = sync.$asArray();

            $scope.edit = false;

            // This $scope.event is shared by event create and share page for sharing event data
            if (angular.isUndefined($rootScope.event))
                $scope.event = {};
            else
                $scope.event = $rootScope.event;

            // selectedGroupUser stores group and members involved to the group
            // it is shared by create and share page together
            if (angular.isUndefined($rootScope.selectedGroupUser)) {
                $scope.selectedGroupUser = {};
            } else {
                $scope.selectedGroupUser = $rootScope.selectedGroupUser;
                $scope.event.group = getGroupUserFrom($scope.selectedGroupUser);
                //for (var item in $scope.selectedGroupUser) {
                //    $scope.event.group += $scope.selectedGroupUser[item].groupName;
                //    $scope.event.group += "(" + $scope.selectedGroupUser[item].members.length + ") ";
                //}
            }

            // Set current DateTime
            var currentDateTime = new Date();
            $scope.event.eventDate = $filter('date')(currentDateTime, 'EEE, MMM d yyyy');
            $scope.event.eventFrom = $filter('date')(currentDateTime, 'hh:mm a');

            var oneHourSpan = new Date(
                currentDateTime.getYear(),
                currentDateTime.getMonth(),
                currentDateTime.getDay(),
                currentDateTime.getHours() + 1,
                currentDateTime.getMinutes(),
                currentDateTime.getSeconds());
            $scope.event.eventTo = $filter('date')(oneHourSpan, 'hh:mm a');
        } else { // event edit page
            $scope.eventSync = $firebase(fireRef.child('events').child($scope.eventId)).$asObject();
            $scope.groupListSync = $firebase(fireRef.child('groups')).$asArray();

            $scope.edit = true;
            $scope.event = {};

            // selectedGroupUser stores group and members involved to the group
            // it is shared by create and share page together
            if (!angular.isUndefined($rootScope.selectedGroupUser)) {
                $scope.selectedGroupUser = $rootScope.selectedGroupUser;
            }
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

        // Once group list is loaded, retrieves group list and members involved to this event
        $scope.$watch('groupListSync.length', function(oldVal, newVal) {
            if (oldVal == newVal) return;

            if (angular.isUndefined($scope.selectedGroupUser)) {
                $scope.selectedGroupUser = {};
                for (var gr in $scope.eventSync.group) {
                    $scope.selectedGroupUser[gr] = {};
                    for (var i = 0; i < $scope.groupListSync.length; i++) {
                        if ($scope.groupListSync[i].$id == gr) {
                            $scope.selectedGroupUser[gr].groupName = $scope.groupListSync[i].details.groupName;
                            break;
                        }
                    }
                    $scope.selectedGroupUser[gr].members = [];
                    for (var usr in $scope.eventSync.group[gr]) {
                        $scope.selectedGroupUser[gr].members.push(usr);
                    }
                }
            }

            $scope.event.id = $scope.eventSync.$id;
            $scope.event.title = $scope.eventSync.title;
            $scope.event.address = $scope.eventSync.address;
            $scope.event.eventDate = $filter('date')(new Date($scope.eventSync.from), 'EEE, MMM d yyyy');
            $scope.event.eventFrom = $filter('date')(new Date($scope.eventSync.from), 'hh:mm a');
            $scope.event.eventTo = $filter('date')(new Date($scope.eventSync.to), 'hh:mm a');
            $scope.event.group = getGroupUserFrom($scope.selectedGroupUser);
        })
    }

    $scope.$watch('eventList.length', function(){
        if (angular.isUndefined($scope.eventList))
            return;

        for (var i = 0; i < $scope.eventList.length; i++) {
            var event = $scope.eventList[i];

            // selected events with current user's group
            var involved = false;
            var memberList = [];
            memberList.push(event.created_by);
            if ($scope.profile.uid == event.created_by) {
                involved = true;
            } else {
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
            }

            if (!involved) continue;

            // Calculate members count involved in the group event
            for (var item in event.group) {
                if ($scope.userGroups.indexOf(item) > -1) {
                    for (var usr in event.group[item]) {
                        if (memberList.indexOf(usr) < 0)
                            memberList.push(usr);
                    }
                }
            }
            event.members = memberList.length;

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

    $scope.createEvent = function(isEdit) {
        // convert datetime format
        var date_from_tmp = new Date(Date.parse($scope.event.eventDate + " " + $scope.event.eventFrom));
        var date_to_tmp = new Date(Date.parse($scope.event.eventDate + " " + $scope.event.eventTo));

        var group = {};
        for (var item in $scope.selectedGroupUser) {
            group[item] = {};
            for (var i = 0; i < $scope.selectedGroupUser[item].members.length; i++) {
                group[item][$scope.selectedGroupUser[item].members[i]] = true;
            }
        }

        if (angular.isUndefined($scope.event.address))
            $scope.event.address = '';

        if (!isEdit) { // Create new event
            $scope.eventListSync.$add({
                title       : $scope.event.title,
                from        : $filter('date')(date_from_tmp, 'yyyy/MM/dd HH:mm'),
                to          : $filter('date')(date_to_tmp, 'yyyy/MM/dd HH:mm'),
                group       : group,
                address     : $scope.event.address,
                created_by  : $scope.profile.uid
            });

            $rootScope.event = undefined;
            $rootScope.selectedGroupUser = undefined;
            $state.go('eventList');
        } else { // Update current event
            $scope.eventSync.title  = $scope.event.title;
            $scope.eventSync.from   = $filter('date')(date_from_tmp, 'yyyy/MM/dd HH:mm');
            $scope.eventSync.to     = $filter('date')(date_to_tmp, 'yyyy/MM/dd HH:mm');
            $scope.eventSync.group  = group;
            $scope.eventSync.address = $scope.event.address;

            $scope.eventSync.$save();

            $rootScope.even = undefined;
            $rootScope.selectedGroupUser = undefined;
            $state.go('eventDetail', {eventId: $scope.eventId});
        }
    }

    $scope.deleteEvent = function() {
        var delete_confirm = confirm("Do you want to remove this event?");
        if (delete_confirm) {
            // Delete event
            $firebase(fireRef.child('events')).$remove($scope.eventSync.$id);

            // Delete comments
            $firebase(fireRef.child('comments')).$remove($scope.eventSync.$id);

            $state.go('eventList');
        }
    }

    $scope.goLookup = function() {
        $rootScope.event = $scope.event;
        $rootScope.selectedGroupUser = $scope.selectedGroupUser;

        if (angular.isUndefined($scope.eventId))
            $state.go('eventShare');
        else
            $state.go('eventShare', {eventId: $scope.eventId});
    }

    $scope.showDetails = function(eventId) {
        $state.go('eventDetail', {eventId: eventId});
    }

    $scope.goEditPage = function () {
        $state.go('eventCreate', {eventId: $stateParams.eventId});
    }

    $scope.addComment = function() {
        if (angular.isUndefined($scope.comment))
            return;

        $scope.commentsSync.$add({
            comment: $scope.comment,
            created_by: $scope.profile.uid,
            created_date: $filter('date')(new Date(), 'yyyy/MM/dd HH:mm')
        });

        $scope.comment = "";
    }
};