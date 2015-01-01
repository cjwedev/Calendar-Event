
'use strict';

var UserCtrl = function ($rootScope, $scope, $state, $cookieStore, $firebase) {
    var fireRef = new Firebase($rootScope.firebaseUrl);

    // Registre user credentials into Firebase
    $scope.signup = function() {
        fireRef.createUser({
            email    : $scope.user.email,
            password : $scope.user.password
        }, function(error) {
            if (error === null) {
                console.log("User created successfully");
            } else {
                console.log("Error creating user:", error);
            }
        });
    }

    // Authenticate user
    $scope.login = function() {
        fireRef.authWithPassword({
            email    : $scope.user.email,
            password : $scope.user.password
        }, function(error, authData) {
            if (error) {
                console.log("Login Failed!", error);
            } else {
                console.log("Authenticated successfully with payload:", authData);
                $rootScope.userToken = authData;
                $cookieStore.put('user', authData);
                $state.go('main');
            }
        });
    }
};
