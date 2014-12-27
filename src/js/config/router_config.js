/*
 * config/router_config.js
 *
 * Defines the routes/states for the application.
*/
angular.module(_APP_)
  .config(
    [          '$stateProvider', '$urlRouterProvider',
      function ($stateProvider,   $urlRouterProvider) {

        /////////////////////////////
        // Redirects and Otherwise //
        /////////////////////////////

        // Use $urlRouterProvider to configure any redirects (when) and invalid urls (otherwise).
        $urlRouterProvider.otherwise('/');

        //////////////////////////
        // State Configurations //
        //////////////////////////

        // Use $stateProvider to configure your states.
        $stateProvider

          //////////
          // Home //
          //////////

          .state("home", {

            // Use a url of "/" to set a states as the "index".
            url: "/",
            views: {
              'nav':{
                templateUrl: 'html/partials/nav/left.html',
                controller: 'NavController'
              },
              'titlebar':{
                templateUrl: 'html/partials/titlebar/index.html',
                controller: [ '$scope', function($scope){
                  $scope.title = "Home";
                }]
              },
              'content': {
                templateUrl: 'html/partials/home/index.html',
                controller: 'HomeContentController'
              }
            }
          })


      }]);
